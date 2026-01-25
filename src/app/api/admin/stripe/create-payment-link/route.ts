import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    // Verify admin user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'admin_employee', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Initialize Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing Stripe Secret Key')
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    })

    // Map plan IDs to Stripe Price IDs
    const PRICE_IDS: Record<string, string> = {
      silver: process.env.STRIPE_SILVER_PRICE_ID || '',
      gold: process.env.STRIPE_GOLD_PRICE_ID || '',
      platinum: process.env.STRIPE_PLATNIUM_PRICE_ID || '',
      legacy: process.env.STRIPE_LEGACY_PRICE_ID || '',
    }

    const { rangeId, planId, customerEmail } = await request.json()

    if (!rangeId || !planId || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: rangeId, planId, customerEmail' },
        { status: 400 }
      )
    }

    const priceId = PRICE_IDS[planId]
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan or price not configured' },
        { status: 400 }
      )
    }

    // Get range details for the session
    const { data: range } = await supabase
      .from('ranges')
      .select('id, name, owner_id')
      .eq('id', rangeId)
      .single()

    if (!range) {
      return NextResponse.json({ error: 'Range not found' }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://archeryrangescanada.ca'

    // Create Stripe Checkout Session with admin metadata
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        rangeId,
        planId,
        adminCreated: 'true',
        createdBy: user.id,
      },
      success_url: `${baseUrl}/dashboard/subscribe/success?session_id={CHECKOUT_SESSION_ID}&range=${rangeId}`,
      cancel_url: `${baseUrl}/dashboard/subscribe?plan=${planId}&range=${rangeId}&canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Admin payment link error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment link' },
      { status: 500 }
    )
  }
}
