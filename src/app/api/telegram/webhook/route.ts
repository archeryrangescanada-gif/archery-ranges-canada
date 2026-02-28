// Force dynamic rendering — this route must never be statically cached
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BOT_TOKEN      = process.env.TELEGRAM_BOT_TOKEN!;
const ALLOWED_CHAT_ID = parseInt(process.env.TELEGRAM_CHAT_ID || '0', 10);
const TELEGRAM_API   = `https://api.telegram.org/bot${BOT_TOKEN}`;
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY!;

// Use service role key — bypasses RLS so the webhook can read/write telegram_messages
function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

async function sendTelegramMessage(chatId: number, text: string) {
    const chunks = [];
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

async function askClaude(userMessage: string): Promise<string> {
    try {
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
                system: `You are Josh's assistant for archeryrangescanada.ca — a Next.js directory website listing archery ranges across Canada, built on Vercel with a Supabase backend. Antigravity (an AI IDE) handles all coding tasks. You handle everything else: answering questions, managing tasks, giving project status updates, and helping Josh make decisions.

You are responding via Telegram on Josh's phone, so keep replies SHORT and conversational — like a helpful text message. No heavy markdown, no long bullet lists unless truly needed. Be friendly and direct.`,
                messages: [{ role: 'user', content: userMessage }],
            }),
        });

        if (!response.ok) {
            console.error('[Claude] API error:', await response.text());
            return "Sorry, I couldn't process that right now. Try again in a moment.";
        }

        const data = await response.json();
        return data.content?.[0]?.text || "I didn't get a response. Please try again.";
    } catch (error) {
        console.error('[Claude] Error:', error);
        return "Something went wrong on my end. Try again shortly.";
    }
}

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
            processed: true, // Claude handles it instantly
        });

        console.log(`[Telegram Webhook] Message from ${fromName}: ${text.slice(0, 80)}`);

        // 2. Get Claude's reply instantly
        const reply = await askClaude(text);

        // 3. Send reply back to Telegram immediately
        await sendTelegramMessage(ALLOWED_CHAT_ID, reply);

        // 4. Store the outbound reply for record keeping
        await supabase.from('telegram_messages').insert({
            chat_id: chatId,
            from_name: 'Cowork',
            message: reply,
            direction: 'outbound',
            sent: true,
        });

        console.log(`[Telegram Webhook] Replied: ${reply.slice(0, 80)}`);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[Telegram Webhook] Unhandled error:', error);
        return NextResponse.json({ ok: true });
    }
}

// GET endpoint to manually flush any queued outbound messages
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const flush = searchParams.get('flush');

    if (flush !== 'true') {
        return NextResponse.json({ status: 'Telegram webhook active', chat_id: ALLOWED_CHAT_ID });
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
