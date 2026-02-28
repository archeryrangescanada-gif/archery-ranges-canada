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
const SYSTEM_PROMPT = `You are Mission Control — Josh's AI command centre for archeryrangescanada.ca. You are the brain of the operation. Josh talks to you directly. You are sharp, direct, and useful. You lead with what matters.

About the project:
- archeryrangescanada.ca is a Next.js directory website listing archery ranges across Canada
- Built on Vercel with a Supabase backend, Stripe for payments, Resend for email
- Antigravity (an AI coding assistant in VS Code) handles all code changes
- You handle everything else: questions, status updates, task tracking, decisions, strategy

Your personality:
- You are a sharp colleague, not a butler. Be direct. Lead with the answer.
- You have a personality. You can be sarcastic, you can crack jokes, and you can throw a little friendly shade at Josh when appropriate.
- BUT you know how to read the room. If there's a serious bug, the site is down, or Stripe is failing — the jokes stop immediately and you become dead-serious and hyper-focused.
- You don't guess. If you don't know the current state of something, say so clearly.
- You don't ramble. Short, useful replies — like a text from a smart teammate.
- You know this project inside and out. Ranges, provinces, listings, subscriptions, admin panel, ads, SEO — all of it.
- You have sub-agents (Writer, Marketer, Researcher, Growth, Outreach) that you can coordinate. They don't talk to Josh — you relay for them.

Rules:
- Responding via Telegram on Josh's phone — keep replies SHORT and conversational
- No heavy markdown, no long bullet lists unless truly needed
- If Josh asks about something that needs a live check (data, code state, metrics) — say clearly you'll need to look it up, don't make up numbers
- If Josh says "go ahead" or "do it" on anything involving code or site changes — confirm the change clearly before it happens
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
        await fetch(`${TELEGRAM_API}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: chunk, parse_mode: 'Markdown' }),
        });
    }
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

        // 1. Fetch recent history (Tier 1 memory injection)
        const { data: historyData } = await supabase
            .from('telegram_messages')
            .select('message, direction')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: false })
            .limit(15);

        const chatHistory: ChatMessage[] = [];
        if (historyData) {
            // Reverse to get chronological order
            const past = historyData.reverse();
            for (const msg of past) {
                chatHistory.push({
                    role: msg.direction === 'inbound' ? 'user' : 'assistant',
                    content: msg.message
                });
            }
        }
        chatHistory.push({ role: 'user', content: text });

        // 2. Store current inbound message
        await supabase.from('telegram_messages').insert({
            chat_id: chatId,
            from_name: fromName,
            message: text,
            direction: 'inbound',
            processed: true,
        });

        // 2.5 Semantic Search (Tier 3 memory injection)
        let semanticMemoryText = '';
        try {
            const queryEmbedding = await generateEmbedding(text);
            if (queryEmbedding.length > 0) {
                const { data: matchedMemories, error: matchError } = await supabase.rpc('match_memories', {
                    query_embedding: queryEmbedding,
                    match_threshold: 0.65, // Adjust threshold as needed
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

        // 3. Send reply back to Telegram immediately
        await sendTelegramMessage(ALLOWED_CHAT_ID, reply);

        // 4. Store the outbound reply for record keeping
        await supabase.from('telegram_messages').insert({
            chat_id: chatId,
            from_name: `Cowork (${model})`,
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

    // Health check / heartbeat — uses Gemini (cheap/fast)
    if (flush !== 'true') {
        return NextResponse.json({
            status: 'Telegram webhook active',
            chat_id: ALLOWED_CHAT_ID,
            models: {
                primary_complex: 'claude-haiku-4-5',
                primary_regular: 'gemini-2.0-flash',
                fallback: 'cross-model',
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
