import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  // 1. Initialize Stripe INSIDE the function
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing Stripe Secret Key')
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  })

  // 2. Initialize Supabase using the secure admin client
  const supabaseAdmin = getSupabaseAdmin()

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Map Stripe plan IDs to database subscription tiers
  // Bronze is the free claimed tier ($0), so we only map paid plans (Silver/Gold)
  const PLAN_TO_TIER: Record<string, string> = {
    silver: 'silver',
    gold: 'gold',
    // Fallback for previous IDs
    pro: 'silver',
    premium: 'gold',
  }

  try {
    switch (event.type) {
      // Handle successful checkout - apply subscription immediately
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.payment_status === 'paid') {
          // Check for rangeId in metadata OR client_reference_id
          const rangeId = session.metadata?.rangeId || session.client_reference_id

          if (rangeId) {
            // Default to 'silver' if no planId provided (since we're using a direct payment link for Silver)
            const planId = session.metadata?.planId || 'silver'
            const subscriptionTier = PLAN_TO_TIER[planId] || 'silver'

            console.log(`Checkout completed: Upgrading range ${rangeId} to ${subscriptionTier}`)

            const { error } = await supabaseAdmin
              .from('ranges')
              .update({
                subscription_tier: subscriptionTier,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                subscription_status: 'active',
                subscription_updated_at: new Date().toISOString(),
                is_featured: true, // All paid tiers are featured
              })
              .eq('id', rangeId)

            if (error) {
              console.error('Failed to update range subscription:', error)
            } else {
              console.log(`Successfully upgraded range ${rangeId} to ${subscriptionTier}`)
            }
          } else {
            console.warn('Checkout completed but no rangeId found in metadata or client_reference_id')
          }
        }
        break
      }

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
          // If subscription is canceled, revert to free tier
          const updates: Record<string, any> = {
            subscription_status: subscription.status,
            subscription_updated_at: new Date().toISOString(),
          }

          if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            updates.subscription_tier = 'bronze' // Revert to free/claimed tier
            updates.is_featured = false
          }

          await supabaseAdmin
            .from('ranges')
            .update(updates)
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
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}