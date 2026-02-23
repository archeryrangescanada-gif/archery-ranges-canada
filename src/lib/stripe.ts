import Stripe from 'stripe'

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

// Pricing tiers
// Support both naming conventions for backward compatibility
export const PRICING_TIERS = {
  bronze: {
    name: 'Bronze',
    monthly: {
      priceId: '',
      amount: 0,
    },
    yearly: {
      priceId: '',
      amount: 0,
    },
    features: [
      '1 photo',
      '100 words',
      'Shows amenities',
      'Non clickable website, email, phone',
      'Address',
      'Map location',
      'Bow types',
    ],
  },
  silver: {
    name: 'Silver',
    monthly: {
      priceId: process.env.STRIPE_SILVER_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID || '',
      amount: 4999, // $49.99 in cents
    },
    yearly: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_YEARLY_PRICE_ID || '',
      amount: 49990, // $499.90 in cents
    },
    features: [
      'Everything in bronze',
      '200 words',
      '5 photos',
      'Analytics',
      'Social media links',
      'Clickable phone, email, website',
      'Shows pricing',
      'Reply to reviews',
    ],
  },
  gold: {
    name: 'Gold',
    monthly: {
      priceId: process.env.STRIPE_GOLD_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || '',
      amount: 12999, // $129.99 in cents
    },
    yearly: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || '',
      amount: 129990, // $1299.90 in cents
    },
    features: [
      'Everything in silver',
      'Featured listing',
      'Ad of your club in free listings',
      'Calender-agenda',
      'Unlimited photos',
      '300 word description',
      'Youtube Video Integration',
      'Send a message',
    ],
  },
}

// Create checkout session
export async function createCheckoutSession(
  userId: string,
  rangeId: string,
  priceId: string,
  tier: string,
  billingCycle: 'monthly' | 'yearly'
) {
  const session = await stripe.checkout.sessions.create({
    customer_email: '', // Will be filled from user profile
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
    metadata: {
      userId,
      rangeId,
      tier,
      billingCycle,
    },
  })

  return session
}

// Create customer portal session
export async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing`,
  })

  return session
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })

  return subscription
}