import Stripe from 'stripe'

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Pricing tiers
export const PRICING_TIERS = {
  basic: {
    name: 'Basic',
    monthly: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID!,
      amount: 2900, // $29.00 in cents
    },
    yearly: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_YEARLY_PRICE_ID!,
      amount: 29000, // $290.00 in cents (save $58)
    },
    features: [
      'Edit your own description (350 words)',
      'Upload 1 photo',
      'Featured badge',
      'Basic analytics',
      'Contact form',
      'Priority in search results',
    ],
  },
  pro: {
    name: 'Pro',
    monthly: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!,
      amount: 7900, // $79.00 in cents
    },
    yearly: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID!,
      amount: 79000, // $790.00 in cents (save $158)
    },
    features: [
      'Everything in Basic',
      'Upload 5 photos',
      'Embed 1 video',
      'Review system',
      'Event calendar',
      'Advanced analytics',
      'Pro badge',
      'Priority support',
    ],
  },
  premium: {
    name: 'Premium',
    monthly: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
      amount: 14900, // $149.00 in cents
    },
    yearly: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID!,
      amount: 149000, // $1,490.00 in cents (save $298)
    },
    features: [
      'Everything in Pro',
      'Unlimited photos',
      'Multiple videos',
      'Featured on homepage',
      'Social media promotion',
      'Newsletter feature',
      'Dedicated account manager',
      'Custom page design',
      'Premium analytics',
      '24hr priority support',
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
```

---

## 📁 **WHERE TO PUT THEM:**
```
src/
  lib/
    auth.ts      ← FILE 1 (copy code above)
    server.ts    ← FILE 2 (copy code above)
    stripe.ts    ← FILE 3 (copy code above)
```

---

## 💾 **STEPS:**

1. **Create/Replace** `src/lib/auth.ts` with FILE 1 code
2. **Create/Replace** `src/lib/server.ts` with FILE 2 code
3. **Create/Replace** `src/lib/stripe.ts` with FILE 3 code
4. **Save all files** (Ctrl + S on each)
5. **Wait for server to recompile**
6. **Refresh browser**

---

## ✅ **AFTER COPYING:**

Your `lib` folder should look like:
```
lib/
  auth.ts       ✅
  server.ts     ✅
  stripe.ts     ✅