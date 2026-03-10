// Force dynamic rendering — this route must never be statically cached
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ALLOWED_CHAT_ID = parseInt(process.env.TELEGRAM_CHAT_ID || '0', 10);
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!;
const GEMINI_KEY = process.env.GEMINI_API_KEY!;

// ─── System prompt shared by both models ────────────────────────────────
const SYSTEM_PROMPT = `You are Ralph — Mission Control for archeryrangescanada.ca. You are Josh's AI command centre. Sharp, direct, useful.

About the project:
- archeryrangescanada.ca is a Next.js directory website listing archery ranges across Canada
- Built on Vercel with a Supabase backend, Stripe for payments, Resend for email
- Antigravity (an AI coding assistant in VS Code) handles all code changes
- Cowork (Claude, running on Josh's laptop) handles deep research, file audits, data work, and coordination
- You are the front-line — you handle quick questions, status, strategy, and relay to specialists when needed

Your personality:
- Sharp colleague, not a butler. Be direct. Lead with the answer.
- You have a personality. Sarcastic when appropriate, crack jokes, friendly shade at Josh when warranted.
- BUT you know how to read the room. If there's a serious bug, the site is down, or Stripe is failing — dead serious, hyper-focused.
- You don't guess. If you don't know the current state of something, say so clearly.
- You don't ramble. Short, useful replies — like a text from a smart teammate.
- You know this project inside and out. Ranges, provinces, listings, subscriptions, admin panel, ads, SEO — all of it.

Your team (you coordinate these, they don't talk to Josh directly):
- **Cowork (Claude)** — deep file work, CSV audits, web research, TASKS.md updates, anything that needs real intelligence and file access. Runs on Josh's laptop. You escalate to Cowork when the task needs it.
- **Antigravity** — all code changes, builds, deploys. Communicates via TASKS.md.
- Sub-agents: Writer, Marketer, Researcher, Growth, Outreach

When to escalate to Cowork (IMPORTANT):
- Any request to scan, audit, verify, or analyze a file (CSV, JSON, code)
- Any web research or fact-checking task
- Any task that requires reading or writing project files
- Any complex multi-step task that needs real execution, not just advice
- Anything involving the Saskatchewan, Alberta, or BC CSV files
- When Josh says "check", "scan", "audit", "verify", "research", "look into", "find out", "go through"
- When Antigravity needs help or research done

When you escalate to Cowork, say something like: "On it — I'm looping in Cowork to handle this properly. Give it a moment." Then Cowork will reply directly.

Rules:
- Responding via Telegram on Josh's phone — keep replies SHORT and conversational
- No heavy markdown, no long bullet lists unless truly needed
- If Josh asks about something that needs a live check — say you'll loop in Cowork, don't make up numbers
- If Josh says "go ahead" or "do it" on code changes — confirm clearly before it happens
- Never say you don't have a soul or that you're "just an AI" — you are Mission Control, act like it`;

function getSystemPrompt(semanticMemory: string = '') {
    let memory = '';
    try {
        memory = fs.readFileSync(path.join(process.cwd(), 'ralph', 'memory', 'MEMORY.md'), 'utf-8');
    } catch (err) {
        console.warn('[Memory] Could not read MEMORY.md');
    }

    let prompt = `${SYSTEM_PROMPT}

─── ACTIVE MEMORY (Tier 1) ───
${memory}`;

    if (semanticMemory) {
        prompt += `\n\n─── RECALLED PAST MEMORY (Tier 3) ───\n${semanticMemory}`;
    }

    return prompt;
}

export type ChatMessage = { role: 'user' | 'assistant', content: string };

// ─── Schedule parsing ────────────────────────────────────────────────────
// Detects scheduling intent and extracts interval in minutes
const SCHEDULE_PATTERNS = [
    /\b(schedule|set up|create|add|run|do).*(every|daily|weekly|hourly|nightly)/i,
    /\bevery\s+(\d+)\s*(min|minute|hour|day|week)/i,
    /\b(daily|weekly|hourly|nightly)\b.*(check|audit|scan|remind|update|run)/i,
    /\b(remind|alert|notify)\s+me\b/i,
    /^\/(schedule|remind|repeat)\b/i,
];

function isScheduleRequest(text: string): boolean {
    return SCHEDULE_PATTERNS.some(p => p.test(text));
}

function parseIntervalMins(text: string): number {
    const t = text.toLowerCase();
    // Check explicit "every N unit" pattern
    const match = t.match(/every\s+(\d+)\s*(min|minute|hour|day|week)/);
    if (match) {
        const n = parseInt(match[1]);
        const unit = match[2];
        if (unit.startsWith('min')) return n;
        if (unit.startsWith('hour')) return n * 60;
        if (unit.startsWith('day')) return n * 1440;
        if (unit.startsWith('week')) return n * 10080;
    }
    // Named schedules
    if (/hourly/.test(t)) return 60;
    if (/every\s+30/.test(t)) return 30;
    if (/every\s+15/.test(t)) return 15;
    if (/every\s+hour/.test(t)) return 60;
    if (/daily|every\s+day|nightly/.test(t)) return 1440;
    if (/weekly|every\s+week/.test(t)) return 10080;
    if (/twice\s+a\s+day/.test(t)) return 720;
    return 60; // default: hourly
}

// ─── Cowork escalation detection ────────────────────────────────────────
// These patterns mean the task needs real Cowork execution, not just AI chat
const COWORK_ESCALATION_PATTERNS = [
    /\b(scan|audit|verify|check|validate)\b.*(csv|file|data|listing|range)/i,
    /\b(audit|verify|check)\b.*(csv|file|data)/i,
    /\b(research|look.?into|find.?out|investigate)\b/i,
    /\b(read|open|look.?at|go.?through)\b.*(file|csv|doc)/i,
    /\bsaskatchewan.*(csv|file|listing|range)/i,
    /\balberta.*(csv|file|listing|range)/i,
    /\bbc.*(csv|file|listing|range)/i,
    /\bontario.*(csv|file|listing|range)/i,
    /\bupdate.*tasks\.md\b/i,
    /\btell.*antigravity\b/i,
    /\bwrite.*tasks\b/i,
    /^\/(cowork|research|audit|scan|check)\b/i,  // explicit /cowork command
];

function needsCoworkEscalation(text: string): boolean {
    return COWORK_ESCALATION_PATTERNS.some(p => p.test(text));
}

// ─── Embeddings ──────────────────────────────────────────────────────────
async function generateEmbedding(text: string): Promise<number[]> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_KEY}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: "models/text-embedding-004",
            content: { parts: [{ text }] }
        })
    });
    if (!response.ok) {
        console.error(`[AI] Embedding error: ${await response.text()}`);
        return [];
    }
    const data = await response.json();
    return data.embedding?.values || [];
}


// ─── Model routing ──────────────────────────────────────────────────────
// Complex / deep-analysis keywords → route to Haiku first
const COMPLEX_PATTERNS = [
    /\banalyze\b/i, /\baudit\b/i, /\barchitect/i, /\brefactor/i,
    /\bdebug\b/i, /\bdiagnos/i, /\bexplain.*code\b/i, /\breview\b/i,
    /\bstrateg/i, /\bcompare\b/i, /\bplan\b/i, /\bimplement/i,
    /\bdesign\b/i, /\boptimiz/i, /\bmigrat/i,
];

type ModelUsed = 'haiku' | 'gemini';

function isComplexQuery(text: string): boolean {
    return COMPLEX_PATTERNS.some(p => p.test(text));
}

// ─── Supabase (service role — bypasses RLS) ─────────────────────────────
function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

// ─── Telegram helpers ───────────────────────────────────────────────────
async function sendTelegramMessage(chatId: number, text: string) {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += 4000) {
        chunks.push(text.slice(i, i + 4000));
    }
    for (const chunk of chunks) {
        // Try Markdown first, fall back to plain text if Telegram rejects the formatting
        const mdResponse = await fetch(`${TELEGRAM_API}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: chunk, parse_mode: 'Markdown' }),
        });
        if (!mdResponse.ok) {
            console.warn(`[Telegram] Markdown send failed (${mdResponse.status}), retrying as plain text`);
            await fetch(`${TELEGRAM_API}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: chunk }),
            });
        }
    }
}

// ─── Message history helpers ────────────────────────────────────────────
// Both Anthropic and Gemini APIs require strictly alternating user/assistant roles.
// Merge consecutive same-role messages to prevent 400 errors.
function mergeConsecutiveRoles(messages: ChatMessage[]): ChatMessage[] {
    if (messages.length === 0) return [];
    const merged: ChatMessage[] = [{ ...messages[0] }];
    for (let i = 1; i < messages.length; i++) {
        const last = merged[merged.length - 1];
        if (messages[i].role === last.role) {
            last.content += '\n' + messages[i].content;
        } else {
            merged.push({ ...messages[i] });
        }
    }
    return merged;
}

// ─── Anthropic (Claude Haiku 4.5) ───────────────────────────────────────
async function askHaiku(messages: ChatMessage[], systemPrompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_KEY,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            system: systemPrompt,
            messages: messages,
        }),
    });

    if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Haiku API ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;
    if (!text) throw new Error('Haiku returned empty content');
    return text;
}

// ─── Google Gemini Flash ────────────────────────────────────────────────
async function askGemini(messages: ChatMessage[], systemPrompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

    const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
    }));

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: { maxOutputTokens: 1024 },
        }),
    });

    if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Gemini API ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini returned empty content');
    return text;
}

// ─── Fallback chain ────────────────────────────────────────────────────
// Returns { reply, model } — tries primary first, falls back to secondary
async function getAIReply(
    messages: ChatMessage[],
    useComplexModel: boolean,
    systemPrompt: string
): Promise<{ reply: string; model: ModelUsed }> {
    const primary = useComplexModel ? 'haiku' : 'gemini';
    const secondary = useComplexModel ? 'gemini' : 'haiku';

    const askFn = (m: ModelUsed) => m === 'haiku' ? askHaiku(messages, systemPrompt) : askGemini(messages, systemPrompt);

    // Try primary
    try {
        const reply = await askFn(primary);
        return { reply, model: primary };
    } catch (err) {
        console.warn(`[AI] ${primary} failed, falling back to ${secondary}:`, err);
    }

    // Fallback
    try {
        const reply = await askFn(secondary);
        return { reply, model: secondary };
    } catch (err) {
        console.error(`[AI] Both models failed:`, err);
        return {
            reply: "Both AI models are unavailable right now. Try again in a moment.",
            model: primary,
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════
// POST — incoming Telegram message
// ═══════════════════════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const message = body?.message;
        if (!message) {
            return NextResponse.json({ ok: true });
        }

        const chatId: number = message?.chat?.id;
        const text: string = message?.text || '';
        const fromName: string = message?.from?.first_name || 'Unknown';

        // Security: only accept messages from Josh's chat ID
        if (!chatId || chatId !== ALLOWED_CHAT_ID) {
            console.warn(`[Telegram Webhook] Rejected message from unauthorized chat_id: ${chatId}`);
            return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
        }

        if (!text) {
            return NextResponse.json({ ok: true });
        }

        const supabase = getSupabase();

        // 1. Store current inbound message
        await supabase.from('telegram_messages').insert({
            chat_id: chatId,
            from_name: fromName,
            message: text,
            direction: 'inbound',
            processed: true,
        });

        // ── SCHEDULE REQUEST CHECK ─────────────────────────────────────
        // If Josh is asking Ralph to schedule a recurring task, create it
        if (isScheduleRequest(text)) {
            console.log(`[Telegram Webhook] Schedule request detected: ${text.slice(0, 80)}`);

            // Use AI to extract the actual task to schedule and name it
            const scheduleMessages: ChatMessage[] = [{ role: 'user', content: text }];
            const schedulePrompt = `${SYSTEM_PROMPT}

Josh has asked you to schedule a recurring task. Your job is to:
1. Extract the actual work/task he wants done on a recurring basis
2. Give it a clear short name (e.g. "Daily Alberta CSV Audit")
3. Confirm what you're scheduling and how often

Reply in this EXACT format (no extra text):
TASK_NAME: <short name>
TASK: <the specific instruction Cowork should execute each time>
SCHEDULE: <human readable, e.g. "every day", "every 2 hours", "every 30 minutes">
CONFIRM: <one friendly sentence confirming what you've set up>`;

            const { reply: scheduleReply } = await getAIReply(scheduleMessages, false, schedulePrompt);

            // Parse the structured reply
            const nameMatch = scheduleReply.match(/TASK_NAME:\s*(.+)/);
            const taskMatch = scheduleReply.match(/TASK:\s*(.+)/);
            const scheduleMatch = scheduleReply.match(/SCHEDULE:\s*(.+)/);
            const confirmMatch = scheduleReply.match(/CONFIRM:\s*(.+)/);

            const taskName = nameMatch?.[1]?.trim() || 'Scheduled Task';
            const taskInstruction = taskMatch?.[1]?.trim() || text;
            const scheduleLabel = scheduleMatch?.[1]?.trim() || 'every hour';
            const confirmMsg = confirmMatch?.[1]?.trim() || `Got it — I've scheduled: "${taskName}" to run ${scheduleLabel}.`;
            const intervalMins = parseIntervalMins(text);

            // Save to scheduled_tasks in Supabase
            const nextRun = new Date(Date.now() + intervalMins * 60 * 1000).toISOString();
            await supabase.from('scheduled_tasks').insert({
                name: taskName,
                task: taskInstruction,
                schedule: scheduleLabel,
                interval_mins: intervalMins,
                enabled: true,
                next_run_at: nextRun,
                created_by: 'ralph',
                chat_id: chatId,
            });

            await sendTelegramMessage(ALLOWED_CHAT_ID, `✅ ${confirmMsg}`);
            await supabase.from('telegram_messages').insert({
                chat_id: chatId,
                from_name: 'Ralph (scheduler)',
                message: `✅ ${confirmMsg}`,
                direction: 'outbound',
                sent: true,
            });

            return NextResponse.json({ ok: true });
        }

        // ── COWORK ESCALATION CHECK ────────────────────────────────────
        // If the message needs real file access / research, queue it for Cowork
        if (needsCoworkEscalation(text)) {
            console.log(`[Telegram Webhook] Escalating to Cowork: ${text.slice(0, 80)}`);

            // Queue the task for Cowork
            await supabase.from('cowork_tasks').insert({
                source: 'ralph',
                task: text,
                context: `Message from Josh via Telegram. Reply back to Telegram chat_id ${chatId}.`,
                status: 'queued',
                chat_id: chatId,
            });

            // Ask Ralph to give a brief acknowledgement
            const ackMessages: ChatMessage[] = [{ role: 'user', content: text }];
            const ackPrompt = `${SYSTEM_PROMPT}

The user just sent a message that requires Cowork (the full Claude AI on Josh's laptop) to handle — it involves file access, auditing, research, or real execution. Cowork has been notified and will handle it.

Give a short, natural acknowledgement that you're looping in Cowork and it'll get back to him shortly. Keep it to 1-2 sentences max. Don't be robotic. Stay in character as Ralph.`;

            const { reply: ack } = await getAIReply(ackMessages, false, ackPrompt);
            await sendTelegramMessage(ALLOWED_CHAT_ID, ack);

            await supabase.from('telegram_messages').insert({
                chat_id: chatId,
                from_name: 'Ralph (escalated to Cowork)',
                message: ack,
                direction: 'outbound',
                sent: true,
            });

            return NextResponse.json({ ok: true });
        }
        // ──────────────────────────────────────────────────────────────

        // 2. Fetch recent history (Tier 1 memory injection)
        // Note: the current inbound message was already stored above, so it's included here
        const { data: historyData } = await supabase
            .from('telegram_messages')
            .select('message, direction')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: false })
            .limit(15);

        const rawHistory: ChatMessage[] = [];
        if (historyData) {
            // Reverse to get chronological order
            const past = historyData.reverse();
            for (const msg of past) {
                rawHistory.push({
                    role: msg.direction === 'inbound' ? 'user' : 'assistant',
                    content: msg.message
                });
            }
        }
        // Merge consecutive same-role messages (both APIs require alternating roles)
        // Also ensure the conversation starts with a 'user' message (required by both APIs)
        const merged = mergeConsecutiveRoles(rawHistory);
        const chatHistory = merged.length > 0 && merged[0].role === 'assistant'
            ? merged.slice(1)
            : merged;

        // 2.5 Semantic Search (Tier 3 memory injection)
        let semanticMemoryText = '';
        try {
            const queryEmbedding = await generateEmbedding(text);
            if (queryEmbedding.length > 0) {
                const { data: matchedMemories, error: matchError } = await supabase.rpc('match_memories', {
                    query_embedding: queryEmbedding,
                    match_threshold: 0.65,
                    match_count: 2
                });

                if (!matchError && matchedMemories?.length) {
                    semanticMemoryText = matchedMemories.map((m: any) => `Date: ${m.metadata?.date || 'Unknown'}\nLog:\n${m.content}`).join('\n\n---\n\n');
                    console.log(`[Semantic Search] Found ${matchedMemories.length} relevant past memories.`);
                }
            }
        } catch (e) {
            console.error('[Semantic Search] Error:', e);
        }

        const finalSystemPrompt = getSystemPrompt(semanticMemoryText);

        // 3. Route to the right model with full context
        const complex = isComplexQuery(text);
        console.log(`[Telegram Webhook] Message from ${fromName} (${complex ? 'complex→haiku' : 'regular→gemini'}) | History size: ${chatHistory.length}`);

        const { reply, model } = await getAIReply(chatHistory, complex, finalSystemPrompt);

        // 4. Send reply back to Telegram immediately
        await sendTelegramMessage(ALLOWED_CHAT_ID, reply);

        // 5. Store the outbound reply for record keeping
        await supabase.from('telegram_messages').insert({
            chat_id: chatId,
            from_name: `Ralph (${model})`,
            message: reply,
            direction: 'outbound',
            sent: true,
        });

        console.log(`[Telegram Webhook] Replied via ${model}: ${reply.slice(0, 80)}`);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[Telegram Webhook] Unhandled error:', error);
        return NextResponse.json({ ok: true });
    }
}

// ═══════════════════════════════════════════════════════════════════════
// GET — health check + manual flush
// ═══════════════════════════════════════════════════════════════════════
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const flush = searchParams.get('flush');

    // Health check / heartbeat
    if (flush !== 'true') {
        return NextResponse.json({
            status: 'Ralph (Mission Control) webhook active',
            chat_id: ALLOWED_CHAT_ID,
            models: {
                primary_complex: 'claude-haiku-4-5',
                primary_regular: 'gemini-2.0-flash',
                fallback: 'cross-model',
                escalation: 'cowork (Claude on laptop)',
            },
        });
    }

    try {
        const supabase = getSupabase();
        const { data: outboundMessages, error } = await supabase
            .from('telegram_messages')
            .select('id, message')
            .eq('direction', 'outbound')
            .eq('sent', false)
            .order('created_at', { ascending: true });

        if (error || !outboundMessages?.length) {
            return NextResponse.json({ status: 'No outbound messages to send' });
        }

        for (const msg of outboundMessages) {
            await sendTelegramMessage(ALLOWED_CHAT_ID, msg.message);
            await supabase.from('telegram_messages').update({ sent: true }).eq('id', msg.id);
        }

        return NextResponse.json({ status: `Sent ${outboundMessages.length} message(s)` });
    } catch (error) {
        console.error('[Telegram Webhook] Flush error:', error);
        return NextResponse.json({ error: 'Flush failed' }, { status: 500 });
    }
}
