import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  try {
    // 1. Initialize Stripe INSIDE the function to prevent build crashes
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing Stripe Secret Key')
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    })

    // 2. Initialize Supabase using the secure admin client
    const supabaseAdmin = getSupabaseAdmin()

    const { sessionId, rangeId } = await request.json()

    if (!sessionId || !rangeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Get plan from metadata and map to database tier
    const planId = session.metadata?.planId || 'silver'

    // Map Stripe plan IDs to database subscription tiers
    const PLAN_TO_TIER: Record<string, string> = {
      silver: 'silver',
      gold: 'gold',
      // Backwards compatibility with old names
      basic: 'silver',
      pro: 'gold',
      premium: 'gold',
    }

    const subscriptionTier = PLAN_TO_TIER[planId] || 'silver'

    // Update the range with subscription info
    const { error: updateError } = await supabaseAdmin
      .from('ranges')
      .update({
        subscription_tier: subscriptionTier,
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