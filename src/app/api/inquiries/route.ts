import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rangeId, name, email, phone, subject, message } = body;

    if (!rangeId || !name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: range, error: rangeError } = await supabase.from('ranges').select('id, name, email, subscription_tier, subscription_expires_at').eq('id', rangeId).single();

    if (rangeError || !range) {
      return NextResponse.json({ error: 'Range not found' }, { status: 404 });
    }

    const tier = range.subscription_tier;
    const isExpired = range.subscription_expires_at && new Date(range.subscription_expires_at) < new Date();

    if (tier === 'free' || isExpired) {
      return NextResponse.json({ error: 'Contact form not available for this listing' }, { status: 403 });
    }

    if (!range.email) {
      return NextResponse.json({ error: 'This listing does not have an email address configured.' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Archery Ranges Canada <noreply@archeryrangescanada.ca>',
      to: range.email,
      replyTo: email.trim().toLowerCase(),
      subject: `New Inquiry from Archery Ranges Canada: ${subject || 'General Question'}`,
      html: `
        <h2>New Inquiry for ${range.name}</h2>
        <p><strong>From:</strong> ${name.trim()} (${email.trim().toLowerCase()})</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone.trim()}</p>` : ''}
        <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
        <hr />
        <p style="white-space: pre-wrap;">${message.trim()}</p>
        <hr />
        <p><small>This message was sent via your listing on <a href="https://archeryrangescanada.ca">Archery Ranges Canada</a>. Reply directly to this email to respond to the sender.</small></p>
      `,
    });

    if (error) {
      console.error('Error sending email via Resend:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error('Inquiry API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
