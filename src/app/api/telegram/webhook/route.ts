// Force dynamic rendering — this route must never be statically cached
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
async function askHaiku(userMessage: string): Promise<string> {
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
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userMessage }],
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
async function askGemini(userMessage: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ parts: [{ text: userMessage }] }],
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
    userMessage: string,
    useComplexModel: boolean
): Promise<{ reply: string; model: ModelUsed }> {
    const primary = useComplexModel ? 'haiku' : 'gemini';
    const secondary = useComplexModel ? 'gemini' : 'haiku';

    const askFn = (m: ModelUsed) => m === 'haiku' ? askHaiku(userMessage) : askGemini(userMessage);

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

        // 1. Store inbound message
        await supabase.from('telegram_messages').insert({
            chat_id: chatId,
            from_name: fromName,
            message: text,
            direction: 'inbound',
            processed: true,
        });

        // 2. Route to the right model
        const complex = isComplexQuery(text);
        console.log(`[Telegram Webhook] Message from ${fromName} (${complex ? 'complex→haiku' : 'regular→gemini'}): ${text.slice(0, 80)}`);

        const { reply, model } = await getAIReply(text, complex);

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
