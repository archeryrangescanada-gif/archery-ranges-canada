import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
})

// Map plan IDs to Stripe Price IDs
const PRICE_IDS: Record<string, string> = {
  basic: process.env.STRIPE_BASIC_PRICE_ID || '',
  pro: process.env.STRIPE_PRO_PRICE_ID || '',
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || '',
}

export async function POST(request: Request) {
  try {
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
        { error: 'Invalid plan' },
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