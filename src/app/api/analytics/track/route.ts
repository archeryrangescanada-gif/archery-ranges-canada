import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
        body = await request.json();
    } catch(e) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { rangeId, eventType } = body;

    if (!rangeId || !eventType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (typeof rangeId !== 'string' || typeof eventType !== 'string') {
        return NextResponse.json({ error: 'Invalid field types' }, { status: 400 });
    }

    const validEventTypes = ['view', 'click', 'inquiry', 'phone_click', 'email_click', 'website_click'];
    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
    const referrer = headersList.get('referer') || '';

    const ipHash = crypto
      .createHash('sha256')
      .update(ip + (process.env.IP_SALT || 'salt'))
      .digest('hex')
      .substring(0, 16);

    const supabase = await createClient();

    const { data: range, error: rangeError } = await supabase.from('ranges').select('id, subscription_tier').eq('id', rangeId).single();

    if (rangeError || !range) {
      return NextResponse.json({ error: 'Range not found' }, { status: 404 });
    }

    if (range.subscription_tier === 'free') {
      return NextResponse.json({ success: true, tracked: false });
    }

    const { error } = await supabase.from('range_analytics').insert({
      range_id: rangeId,
      event_type: eventType,
      referrer: referrer.substring(0, 500),
      user_agent: userAgent.substring(0, 500),
      ip_hash: ipHash,
    });

    if (error) {
      logger.error('Error tracking analytics:', error);
    }

    if (eventType === 'view') {
      await supabase.rpc('increment_view_count', { range_uuid: rangeId });
    }

    return NextResponse.json({ success: true, tracked: true });
  } catch (error) {
    logger.error('Analytics API error:', error);
    return NextResponse.json({ success: true, tracked: false });
  }
}
