import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    // 1. Initialize Stripe INSIDE the function to prevent build crashes
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing Stripe Secret Key')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover' as any,
    })

    // 2. Initialize Supabase INSIDE the function for the same reason
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase Admin Keys')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    let body;
    try {
        body = await request.json()
    } catch(e) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { sessionId, rangeId } = body

    if (!sessionId || !rangeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (typeof sessionId !== 'string' || typeof rangeId !== 'string') {
        return NextResponse.json({ error: 'Invalid field types' }, { status: 400 })
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Get plan from metadata
    const planId = session.metadata?.planId || 'basic'

    // Update the range with subscription info
    const { error: updateError } = await supabaseAdmin
      .from('ranges')
      .update({
        subscription_tier: planId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        subscription_status: 'active',
        subscription_updated_at: new Date().toISOString(),
      })
      .eq('id', rangeId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update subscription status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Verify session error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify session' },
      { status: 500 }
    )
  }
}
