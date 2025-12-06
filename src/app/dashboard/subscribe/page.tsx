'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, ArrowLeft, Loader2, Shield } from 'lucide-react'
import Link from 'next/link'

const plans = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 29,
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || 'price_basic',
    features: [
      '1 Photo',
      'Contact Form',
      'Basic Analytics',
      'Featured Badge',
      'Email Support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 79,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro',
    popular: true,
    features: [
      '5 Photos + 1 Video',
      'Reviews & Events',
      'Advanced Analytics',
      'Top Ranges Feature',
      '48hr Support Response',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 149,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || 'price_premium',
    features: [
      'Unlimited Photos & Videos',
      'Homepage Feature',
      'Social Media Promotion',
      'Custom Design Options',
      '24hr Phone Support',
    ],
  },
}

export default function SubscribePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  
  const planId = searchParams.get('plan') as keyof typeof plans
  const rangeId = searchParams.get('range')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [range, setRange] = useState<{ id: string; name: string } | null>(null)
  const [user, setUser] = useState<any>(null)

  const plan = plans[planId]

  useEffect(() => {
    async function loadData() {
      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // Get range details
      if (rangeId) {
        const { data: rangeData } = await supabase
          .from('ranges')
          .select('id, name')
          .eq('id', rangeId)
          .single()
        
        if (rangeData) {
          setRange(rangeData)
        }
      }
    }
    loadData()
  }, [rangeId])

  const handleSubscribe = async () => {
    if (!plan || !rangeId || !user) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          priceId: plan.priceId,
          rangeId: rangeId,
          userId: user.id,
          userEmail: user.email,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout')
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    // Keep free tier and go to dashboard
    router.push('/dashboard')
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-stone-800 mb-4">Invalid Plan</h1>
          <p className="text-stone-600 mb-6">The selected plan is not valid.</p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-stone-800">Complete Your Subscription</h1>
          <p className="text-stone-600 mt-1">
            {range ? `Upgrade "${range.name}" to ${plan.name}` : `Subscribe to ${plan.name}`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Plan Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-stone-800">{plan.name} Plan</h2>
                {plan.popular && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                    Most Popular
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-stone-800">${plan.price}</span>
                <span className="text-stone-500">/month</span>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-6">
              <h3 className="font-semibold text-stone-800 mb-4">What's included:</h3>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-stone-600">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {range && (
              <div className="mt-6 p-4 bg-stone-50 rounded-lg">
                <p className="text-sm text-stone-600">
                  <span className="font-medium">Listing:</span> {range.name}
                </p>
              </div>
            )}
          </div>

          {/* Checkout */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <h2 className="text-xl font-bold text-stone-800 mb-6">Payment Details</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Order Summary */}
            <div className="border border-stone-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-stone-600">{plan.name} Plan</span>
                <span className="font-medium text-stone-800">${plan.price}/mo</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-stone-200">
                <span className="font-semibold text-stone-800">Total</span>
                <span className="font-bold text-stone-800">${plan.price}/month</span>
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg mb-6">
              <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-800">
                <p className="font-medium">Secure Payment</p>
                <p className="text-emerald-700">
                  You'll be redirected to Stripe's secure checkout. Your payment details are never stored on our servers.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-400 text-white font-semibold rounded-lg transition-colors mb-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  Subscribe for ${plan.price}/month
                </>
              )}
            </button>

            <button
              onClick={handleSkip}
              disabled={loading}
              className="w-full px-6 py-3 text-stone-600 hover:text-stone-800 font-medium transition-colors"
            >
              Skip for now (keep free tier)
            </button>

            {/* Terms */}
            <p className="mt-6 text-xs text-stone-500 text-center">
              By subscribing, you agree to our{' '}
              <Link href="/terms" className="text-emerald-600 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>.
              You can cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}