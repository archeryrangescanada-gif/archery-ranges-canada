import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

const validEventTypes = [
  'category_selected',
  'province_selected',
  'search_performed',
  'filter_applied',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, metadata } = body;

    if (!eventType || !validEventTypes.includes(eventType)) {
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

    const { error } = await supabase.from('site_analytics').insert({
      event_type: eventType,
      metadata: metadata || {},
      referrer: referrer.substring(0, 500),
      user_agent: userAgent.substring(0, 500),
      ip_hash: ipHash,
    });

    if (error) {
      console.error('Error tracking site event:', error);
      return NextResponse.json({ success: true, tracked: false });
    }

    return NextResponse.json({ success: true, tracked: true });
  } catch (error) {
    console.error('Site analytics API error:', error);
    return NextResponse.json({ success: true, tracked: false });
  }
}
