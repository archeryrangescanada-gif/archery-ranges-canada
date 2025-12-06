import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
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
        if (invoice.subscription) {
          const { data: range } = await supabaseAdmin
            .from('ranges')
            .select('id')
            .eq('stripe_subscription_id', invoice.subscription)
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