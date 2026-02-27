// Force dynamic rendering — this route must never be statically cached
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ALLOWED_CHAT_ID = parseInt(process.env.TELEGRAM_CHAT_ID || '0', 10);
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendTelegramMessage(chatId: number, text: string) {
    // Split long messages into chunks (Telegram limit: 4096 chars)
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

export async function POST(request: NextRequest) {
    try {
        // Parse the incoming Telegram update
        const body = await request.json();

        const message = body?.message;
        if (!message) {
            // Not a message update (could be edited_message, etc.) — acknowledge and ignore
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

        const supabase = await createClient();

        // 1. Store inbound message in Supabase
        const { error: insertError } = await supabase.from('telegram_messages').insert({
            chat_id: chatId,
            from_name: fromName,
            message: text,
            direction: 'inbound',
        });

        if (insertError) {
            console.error('[Telegram Webhook] Failed to store inbound message:', insertError);
            // Still return 200 to Telegram so it doesn't retry
            return NextResponse.json({ ok: true });
        }

        console.log(`[Telegram Webhook] Stored inbound message from ${fromName}: ${text.slice(0, 80)}`);

        // 2. Check for unsent outbound messages and send them back to Telegram
        const { data: outboundMessages, error: fetchError } = await supabase
            .from('telegram_messages')
            .select('id, message')
            .eq('direction', 'outbound')
            .eq('sent', false)
            .order('created_at', { ascending: true });

        if (!fetchError && outboundMessages && outboundMessages.length > 0) {
            for (const msg of outboundMessages) {
                await sendTelegramMessage(ALLOWED_CHAT_ID, msg.message);

                // Mark as sent
                await supabase
                    .from('telegram_messages')
                    .update({ sent: true })
                    .eq('id', msg.id);
            }
            console.log(`[Telegram Webhook] Sent ${outboundMessages.length} outbound message(s) to Telegram`);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[Telegram Webhook] Unhandled error:', error);
        // Always return 200 to Telegram to prevent retry loops
        return NextResponse.json({ ok: true });
    }
}

// GET endpoint to manually trigger outbound message flush
// Useful for testing: GET /api/telegram/webhook?flush=true
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const flush = searchParams.get('flush');

    if (flush !== 'true') {
        return NextResponse.json({ status: 'Telegram webhook active', chat_id: ALLOWED_CHAT_ID });
    }

    try {
        const supabase = await createClient();
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
