import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  try {
    // 1. Initialize Stripe INSIDE the function (Fixes the build crash)
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing Stripe Secret Key')
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    })

    // 2. Map plan IDs to your ACTUAL Vercel Environment Variables
    // (We map 'basic' -> 'SILVER' because that is what you saved in Vercel)
    const PRICE_IDS: Record<string, string> = {
      basic: process.env.STRIPE_SILVER_PRICE_ID || '',
      pro: process.env.STRIPE_GOLD_PRICE_ID || '',
      premium: process.env.STRIPE_PLATNIUM_PRICE_ID || '', // Note: 'PLATNIUM' matches your specific typo in Vercel
    }

    const { planId, rangeId, userId, userEmail } = await request.json()

    if (!planId || !rangeId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const priceId = PRICE_IDS[planId]
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan configuration' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        rangeId,
        userId,
        planId,
      },
      // Uses the baseUrl to ensure it goes to the live site, not localhost
      success_url: `${baseUrl}/dashboard/subscribe/success?session_id={CHECKOUT_SESSION_ID}&range=${rangeId}`,
      cancel_url: `${baseUrl}/dashboard/subscribe?plan=${planId}&range=${rangeId}&canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}