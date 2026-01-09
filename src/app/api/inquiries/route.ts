import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting
    const ip = getClientIp()
    const { success, remaining, reset } = await rateLimit(ip, 5, 3600000) // 5 req/hour per IP for inquiries

    if (!success) {
        return NextResponse.json(
            { error: 'Too many inquiries. Please try again later.' },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': '5',
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': reset.toString()
                }
            }
        )
    }

    let body;
    try {
        body = await request.json();
    } catch(e) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { rangeId, name, email, phone, subject, message } = body;

    if (!rangeId || !name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (typeof rangeId !== 'string' || typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
        return NextResponse.json({ error: 'Invalid field types' }, { status: 400 });
    }

    // Length validation to prevent DoS
    if (message.length > 5000) {
        return NextResponse.json({ error: 'Message too long' }, { status: 400 });
    }
    if (name.length > 100 || email.length > 100 || (subject && subject.length > 200)) {
        return NextResponse.json({ error: 'Input too long' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: range, error: rangeError } = await supabase.from('ranges').select('id, subscription_tier, subscription_expires_at').eq('id', rangeId).single();

    if (rangeError || !range) {
      return NextResponse.json({ error: 'Range not found' }, { status: 404 });
    }

    const tier = range.subscription_tier;
    const isExpired = range.subscription_expires_at && new Date(range.subscription_expires_at) < new Date();

    if (tier === 'free' || isExpired) {
      return NextResponse.json({ error: 'Contact form not available for this listing' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('range_inquiries')
      .insert({
        range_id: rangeId,
        sender_name: name.trim(),
        sender_email: email.trim().toLowerCase(),
        sender_phone: phone?.trim() || null,
        subject: subject?.trim() || null,
        message: message.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating inquiry:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id }, {
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString()
      }
    });
  } catch (error) {
    console.error('Inquiry API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
