import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  // 1. Initialize Stripe INSIDE the function
  if (!process.env.STRIPE_SECRET_KEY) {
    logger.error('Missing Stripe Secret Key')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover' as any, // Cast to any if version is newer than types
  })

  // 2. Initialize Supabase INSIDE the function
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    logger.error('Missing Supabase Admin Keys')
     return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
      logger.error('Missing STRIPE_WEBHOOK_SECRET');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    logger.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Find range by stripe_subscription_id
        const { data: range } = await supabaseAdmin
          .from('ranges')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (range) {
          await supabaseAdmin
            .from('ranges')
            .update({
              subscription_status: subscription.status,
              subscription_updated_at: new Date().toISOString(),
            })
            .eq('id', range.id)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment succeeded for invoice:', invoice.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        // Find range and mark subscription as past_due
        if ((invoice as any).subscription) {
          const { data: range } = await supabaseAdmin
            .from('ranges')
            .select('id')
            .eq('stripe_subscription_id', (invoice as any).subscription)
            .single()

          if (range) {
            await supabaseAdmin
              .from('ranges')
              .update({
                subscription_status: 'past_due',
                subscription_updated_at: new Date().toISOString(),
              })
              .eq('id', range.id)
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    logger.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
