// Force dynamic — never cache this route
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const ALLOWED_CHAT_ID = parseInt(process.env.TELEGRAM_CHAT_ID || '0', 10);
const GEMINI_KEY = process.env.GEMINI_API_KEY!;

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

async function sendTelegramMessage(text: string) {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: ALLOWED_CHAT_ID, text, parse_mode: 'Markdown' }),
    });
}

async function askGeminiHeartbeat(): Promise<string> {
    const now = new Date().toISOString();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

    const prompt = `You are Mission Control — Josh's AI assistant for archeryrangescanada.ca.
This is your 15-minute heartbeat check. Current time: ${now} UTC.

Do a quick status scan. Reply with ONE of:
1. Just "HEARTBEAT_OK" (no other text) if everything looks fine and there's nothing urgent
2. A short 1-2 sentence alert if there's something that needs Josh's attention

Keep it extremely brief. No fluff.`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 100 },
        }),
    });

    if (!response.ok) {
        throw new Error(`Gemini ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'HEARTBEAT_OK';
}

async function flushPendingMessages() {
    const supabase = getSupabase();
    const { data } = await supabase
        .from('telegram_messages')
        .select('id, message')
        .eq('direction', 'outbound')
        .eq('sent', false)
        .order('created_at', { ascending: true });

    if (data?.length) {
        for (const msg of data) {
            await sendTelegramMessage(msg.message);
            await supabase.from('telegram_messages').update({ sent: true }).eq('id', msg.id);
        }
        return data.length;
    }
    return 0;
}

export async function GET(request: NextRequest) {
    const startTime = Date.now();

    try {
        // 1. Flush any pending outbound messages first
        const flushed = await flushPendingMessages();

        // 2. Ask Gemini for a heartbeat status
        const status = await askGeminiHeartbeat();
        const silent = status === 'HEARTBEAT_OK';

        // 3. Only send to Telegram if there's something to report (or pending messages)
        if (!silent || flushed > 0) {
            const msg = flushed > 0
                ? `${status}\n_(+ ${flushed} queued message(s) delivered)_`
                : status;
            await sendTelegramMessage(msg);
        }

        const elapsed = Date.now() - startTime;
        console.log(`[Heartbeat] ${status} | flushed=${flushed} | ${elapsed}ms`);

        return NextResponse.json({
            ok: true,
            status,
            flushed,
            silent,
            elapsed_ms: elapsed,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('[Heartbeat] Error:', error);
        // Don't spam Telegram on heartbeat errors — just log
        return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
    }
}
