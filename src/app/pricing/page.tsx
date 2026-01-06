'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, X, Star, Shield, TrendingUp, Crown, MapPin, Phone, Mail, Globe, Camera, Calendar, MessageSquare, BarChart3, FileText, Users } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type BillingPeriod = 'monthly' | 'yearly'

const tiers = [
  {
    id: 'bronze',
    name: 'Bronze',
    tagline: 'The Guest',
    description: 'Entry-level listing to get on the map',
    badge: '/bronze-badge.png',
    monthlyPrice: 0,
    yearlyPrice: 0,
    searchRank: 'Standard (Bottom)',
    features: [
      { text: 'Bronze Badge', included: true },
      { text: 'Map Pin Visibility', included: true },
      { text: 'Basic Listing Card', included: true },
      { text: '1 Photo (Thumbnail)', included: true },
      { text: '150 Word Description', included: true },
      { text: 'Basic Amenity Tags', included: true },
      { text: 'Clickable Website Link', included: false },
      { text: 'Phone Number Display', included: false },
      { text: 'Email Address Display', included: false },
      { text: 'Social Media Links', included: false },
      { text: 'Analytics Dashboard', included: false },
    ],
    cta: 'Get Started Free',
    ctaLink: '/auth/signup',
    highlighted: false,
  },
  {
    id: 'silver',
    name: 'Silver',
    tagline: 'The Member',
    description: 'Your digital business card for clubs and small ranges',
    badge: '/silver-badge.png',
    monthlyPrice: 49,
    yearlyPrice: 499,
    searchRank: 'Boosted (Above Bronze)',
    features: [
      { text: 'Silver Badge', included: true },
      { text: 'Boosted Search Ranking', included: true },
      { text: 'Clickable Website Link', included: true },
      { text: 'Phone Number Display', included: true },
      { text: 'Email Address Display', included: true },
      { text: 'Facebook & Instagram Links', included: true },
      { text: '5 Photo Gallery', included: true },
      { text: '350 Word Description', included: true },
      { text: 'Basic Analytics (Profile Views)', included: true },
      { text: 'Events Calendar', included: false },
      { text: 'Review Management', included: false },
    ],
    cta: 'Start Silver',
    ctaLink: '/auth/signup?plan=silver',
    highlighted: false,
  },
  {
    id: 'gold',
    name: 'Gold',
    tagline: 'The Marketer',
    description: 'Growth package for commercial ranges driving traffic',
    badge: '/gold-badge.png',
    monthlyPrice: 149,
    yearlyPrice: 1500,
    searchRank: 'Priority (Top of Results)',
    features: [
      { text: 'Gold Badge', included: true },
      { text: 'Priority Search Placement', included: true },
      { text: 'All Silver Features', included: true },
      { text: '"Message Range" Lead Form', included: true },
      { text: 'Read & Reply to Reviews', included: true },
      { text: 'Unlimited Photo Gallery', included: true },
      { text: 'YouTube Video Embed', included: true },
      { text: 'Events Calendar & Global Feed', included: true },
      { text: 'Advanced Analytics', included: true },
      { text: 'Track Clicks (Web, Call, Directions)', included: true },
      { text: 'Home Page Feature', included: false },
    ],
    cta: 'Start Gold',
    ctaLink: '/auth/signup?plan=gold',
    highlighted: true,
    popularLabel: 'Most Popular',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    tagline: 'The Partner',
    description: 'Dominance package with exclusive visibility + SaaS tools',
    badge: '/platinum-badge.png',
    monthlyPrice: 399,
    yearlyPrice: 3999,
    searchRank: 'Maximum (Pinned Above All)',
    features: [
      { text: 'Platinum Badge + Verified ✓', included: true },
      { text: 'Pinned Top of All Searches', included: true },
      { text: 'All Gold Features', included: true },
      { text: 'Home Page Hero (50km radius)', included: true },
      { text: 'No Competitor Ads on Profile', included: true },
      { text: 'Digital Waiver System', included: true },
      { text: 'iPad Kiosk Mode', included: true },
      { text: 'Waiver Dashboard & Search', included: true },
      { text: 'Expiry Tracking & Auto-Emails', included: true },
      { text: 'PDF Export of Waivers', included: true },
      { text: 'Priority Phone Support', included: true },
    ],
    cta: 'Start Platinum',
    ctaLink: '/auth/signup?plan=platinum',
    highlighted: false,
  },
]

const comparisonFeatures = [
  {
    category: 'Visibility & Search',
    features: [
      { name: 'Badge Type', bronze: 'bronze-badge', silver: 'silver-badge', gold: 'gold-badge', platinum: 'platinum-badge' },
      { name: 'Search Ranking', bronze: 'Bottom', silver: 'Middle', gold: 'Top', platinum: 'Pinned Top' },
      { name: 'Home Page Feature (50km)', bronze: false, silver: false, gold: false, platinum: true },
      { name: 'No Competitor Ads', bronze: false, silver: false, gold: false, platinum: true },
    ],
  },
  {
    category: 'Contact Information',
    features: [
      { name: 'Map Pin', bronze: true, silver: true, gold: true, platinum: true },
      { name: 'Clickable Website Link', bronze: false, silver: true, gold: true, platinum: true },
      { name: 'Phone Number', bronze: false, silver: true, gold: true, platinum: true },
      { name: 'Email Address', bronze: false, silver: true, gold: true, platinum: true },
      { name: 'Social Media Links', bronze: false, silver: true, gold: true, platinum: true },
      { name: '"Message Range" Lead Form', bronze: false, silver: false, gold: true, platinum: true },
    ],
  },
  {
    category: 'Content & Media',
    features: [
      { name: 'Photos', bronze: '1', silver: '5', gold: 'Unlimited', platinum: 'Unlimited' },
      { name: 'Description Length', bronze: '150 words', silver: '350 words', gold: 'Unlimited', platinum: 'Unlimited' },
      { name: 'Video Embed', bronze: false, silver: false, gold: true, platinum: true },
      { name: 'Events Calendar', bronze: false, silver: false, gold: true, platinum: true },
    ],
  },
  {
    category: 'Reviews & Engagement',
    features: [
      { name: 'Receive Reviews', bronze: true, silver: true, gold: true, platinum: true },
      { name: 'Reply to Reviews', bronze: false, silver: false, gold: true, platinum: true },
    ],
  },
  {
    category: 'Analytics',
    features: [
      { name: 'Profile Views', bronze: false, silver: true, gold: true, platinum: true },
      { name: 'Website Clicks', bronze: false, silver: false, gold: true, platinum: true },
      { name: 'Call Button Clicks', bronze: false, silver: false, gold: true, platinum: true },
      { name: 'Direction Clicks', bronze: false, silver: false, gold: true, platinum: true },
    ],
  },
  {
    category: 'SaaS Tools (Waiver System)',
    features: [
      { name: 'Digital Waiver System', bronze: false, silver: false, gold: false, platinum: true },
      { name: 'iPad Kiosk Mode', bronze: false, silver: false, gold: false, platinum: true },
      { name: 'Waiver Dashboard', bronze: false, silver: false, gold: false, platinum: true },
      { name: 'Expiry Tracking & Emails', bronze: false, silver: false, gold: false, platinum: true },
      { name: 'PDF Export', bronze: false, silver: false, gold: false, platinum: true },
    ],
  },
]

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')

  const getPrice = (tier: typeof tiers[0]) => {
    if (tier.monthlyPrice === 0) return 'Free'
    return billingPeriod === 'monthly'
      ? `$${tier.monthlyPrice}`
      : `$${tier.yearlyPrice}`
  }

  const getPeriodLabel = (tier: typeof tiers[0]) => {
    if (tier.monthlyPrice === 0) return 'forever'
    return billingPeriod === 'monthly' ? '/month' : '/year'
  }

  const getSavings = (tier: typeof tiers[0]) => {
    if (tier.monthlyPrice === 0) return null
    const monthlyCost = tier.monthlyPrice * 12
    const yearlyCost = tier.yearlyPrice
    const savings = monthlyCost - yearlyCost
    return savings
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-stone-800 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-stone-600 mb-8">
            Choose the plan that fits your range. Upgrade or downgrade anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-white rounded-full p-2 shadow-md border border-stone-200">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${billingPeriod === 'monthly'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-800'
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${billingPeriod === 'yearly'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-800'
                }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                Save up to 17%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${tier.highlighted
                  ? 'border-green-500 ring-4 ring-green-100'
                  : 'border-stone-200'
                  }`}
              >
                {tier.popularLabel && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-md">
                      {tier.popularLabel}
                    </span>
                  </div>
                )}

                <div className="p-6">
                  {/* Badge & Name */}
                  <div className="text-center mb-4">
                    <img src={tier.badge} alt={tier.name} className="h-16 w-16 mx-auto object-contain" />
                    <h3 className="text-2xl font-bold text-stone-800 mt-2">{tier.name}</h3>
                    <p className="text-green-600 font-medium">{tier.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-stone-800">
                        {getPrice(tier)}
                      </span>
                      <span className="text-stone-500">{getPeriodLabel(tier)}</span>
                    </div>
                    {billingPeriod === 'yearly' && getSavings(tier) && (
                      <p className="text-sm text-green-600 mt-1">
                        Save ${getSavings(tier)}/year
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-stone-600 text-center mb-6">
                    {tier.description}
                  </p>

                  {/* Search Rank */}
                  <div className="bg-stone-50 rounded-lg p-3 mb-6">
                    <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Search Ranking</p>
                    <p className="text-sm font-semibold text-stone-700">{tier.searchRank}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-stone-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-stone-700' : 'text-stone-400'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={tier.ctaLink}
                    className={`block w-full text-center py-3 px-4 rounded-lg font-semibold transition-colors ${tier.highlighted
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : tier.monthlyPrice === 0
                        ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        : 'bg-stone-800 hover:bg-stone-900 text-white'
                      }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-stone-800 text-center mb-4">
            Full Feature Comparison
          </h2>
          <p className="text-stone-600 text-center mb-12">
            See exactly what's included in each plan
          </p>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-stone-200">
            {/* Table Header */}
            <div className="grid grid-cols-5 bg-stone-800 text-white">
              <div className="p-4 font-semibold">Feature</div>
              <div className="p-4 text-center font-semibold">
                <div className="flex items-center justify-center gap-2">
                  <img src="/bronze-badge.png" alt="Bronze" className="h-6 w-6 object-contain" />
                  <span>Bronze</span>
                </div>
              </div>
              <div className="p-4 text-center font-semibold">
                <div className="flex items-center justify-center gap-2">
                  <img src="/silver-badge.png" alt="Silver" className="h-6 w-6 object-contain" />
                  <span>Silver</span>
                </div>
              </div>
              <div className="p-4 text-center font-semibold bg-green-700">
                <div className="flex items-center justify-center gap-2">
                  <img src="/gold-badge.png" alt="Gold" className="h-6 w-6 object-contain" />
                  <span>Gold</span>
                </div>
              </div>
              <div className="p-4 text-center font-semibold">
                <div className="flex items-center justify-center gap-2">
                  <img src="/platinum-badge.png" alt="Platinum" className="h-6 w-6 object-contain" />
                  <span>Platinum</span>
                </div>
              </div>
            </div>

            {/* Price Row */}
            <div className="grid grid-cols-5 border-b border-stone-200 bg-stone-50">
              <div className="p-4 font-semibold text-stone-700">Price</div>
              <div className="p-4 text-center font-bold text-stone-800">Free</div>
              <div className="p-4 text-center font-bold text-stone-800">$49/mo</div>
              <div className="p-4 text-center font-bold text-green-600 bg-green-50">$149/mo</div>
              <div className="p-4 text-center font-bold text-stone-800">$399/mo</div>
            </div>

            {/* Feature Categories */}
            {comparisonFeatures.map((category, catIdx) => (
              <div key={catIdx}>
                {/* Category Header */}
                <div className="grid grid-cols-5 bg-stone-100 border-b border-stone-200">
                  <div className="col-span-5 p-3 font-semibold text-stone-700">
                    {category.category}
                  </div>
                </div>

                {/* Features */}
                {category.features.map((feature, featIdx) => (
                  <div
                    key={featIdx}
                    className="grid grid-cols-5 border-b border-stone-100 hover:bg-stone-50"
                  >
                    <div className="p-4 text-stone-600">{feature.name}</div>
                    {['bronze', 'silver', 'gold', 'platinum'].map((tier) => {
                      const value = feature[tier as keyof typeof feature]
                      return (
                        <div
                          key={tier}
                          className={`p-4 text-center ${tier === 'gold' ? 'bg-green-50/50' : ''}`}
                        >
                          {typeof value === 'boolean' ? (
                            value ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-stone-300 mx-auto" />
                            )
                          ) : value === 'bronze-badge' ? (
                            <div className="flex items-center justify-center gap-2">
                              <img src="/bronze-badge.png" alt="Bronze" className="h-6 w-6 object-contain" />
                              <span className="text-stone-700 font-medium">Bronze</span>
                            </div>
                          ) : value === 'silver-badge' ? (
                            <div className="flex items-center justify-center gap-2">
                              <img src="/silver-badge.png" alt="Silver" className="h-6 w-6 object-contain" />
                              <span className="text-stone-700 font-medium">Silver</span>
                            </div>
                          ) : value === 'gold-badge' ? (
                            <div className="flex items-center justify-center gap-2">
                              <img src="/gold-badge.png" alt="Gold" className="h-6 w-6 object-contain" />
                              <span className="text-stone-700 font-medium">Gold</span>
                            </div>
                          ) : value === 'platinum-badge' ? (
                            <div className="flex items-center justify-center gap-2">
                              <img src="/platinum-badge.png" alt="Platinum" className="h-6 w-6 object-contain" />
                              <span className="text-stone-700 font-medium">Platinum + Verified</span>
                            </div>
                          ) : (
                            <span className="text-stone-700 font-medium">{value}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platinum CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl"></div>

            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <img src="/platinum-badge.png" alt="Platinum" className="w-20 h-20 object-contain" />
                <div>
                  <h2 className="text-3xl font-bold">Platinum Partner Program</h2>
                  <p className="text-amber-400 font-medium">The Ultimate Range Management Solution</p>
                </div>
              </div>

              <p className="text-lg text-stone-300 mb-8 max-w-2xl">
                Get maximum visibility with pinned search results and Home Page hero placement,
                plus our complete Digital Waiver System to streamline your front desk operations.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/10 rounded-xl p-5">
                  <Crown className="w-8 h-8 text-amber-400 mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Exclusive Visibility</h3>
                  <p className="text-stone-400 text-sm">
                    Pinned to the top of all searches. Featured on the Home Page for users within 50km. No competitor ads on your profile.
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-5">
                  <FileText className="w-8 h-8 text-amber-400 mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Digital Waiver System</h3>
                  <p className="text-stone-400 text-sm">
                    iPad kiosk mode, searchable waiver database, expiry tracking with auto-emails, and one-click PDF exports.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/signup?plan=platinum"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg"
                >
                  Start Platinum - $399/mo
                </Link>
                <Link
                  href="/contact?subject=platinum"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold transition-all"
                >
                  Schedule a Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-stone-800 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: 'Can I upgrade or downgrade at any time?',
                a: 'Yes! You can change your plan at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, your new rate takes effect at the next billing cycle.',
              },
              {
                q: 'What happens to my listing if I cancel?',
                a: 'Your listing reverts to the Bronze (free) tier. You\'ll keep your basic listing but lose premium features like clickable contact info, additional photos, and analytics.',
              },
              {
                q: 'Is there a contract or commitment?',
                a: 'No contracts! Monthly plans can be canceled anytime. Yearly plans are paid upfront but can be refunded on a prorated basis within the first 30 days.',
              },
              {
                q: 'How does the Digital Waiver System work?',
                a: 'Our Platinum waiver system includes an iPad-friendly kiosk mode, a searchable database of all signed waivers, automatic expiry notifications, and PDF export capability. It\'s designed to replace paper waivers completely.',
              },
              {
                q: 'What is the "Home Page Hero" feature?',
                a: 'Platinum members are featured on the app/website home page for any user within 50km of their range. This gives you immediate visibility when archers in your area open the site.',
              },
              {
                q: 'Do you offer discounts for multiple locations?',
                a: 'Yes! Contact us for custom pricing if you operate multiple ranges. We offer volume discounts for 3+ locations.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
                <h3 className="font-semibold text-stone-800 mb-2">{faq.q}</h3>
                <p className="text-stone-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-stone-800 mb-4">
            Ready to grow your archery range?
          </h2>
          <p className="text-xl text-stone-600 mb-8">
            Join hundreds of ranges across Canada. Start free, upgrade when you're ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-700 px-8 py-4 rounded-xl font-semibold transition-colors border border-stone-300"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}