'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Check, X, Star, Crown, FileText } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { STRIPE_CONFIG } from '@/config/stripe'
import { useLanguage } from '@/lib/i18n/LanguageContext'

type BillingPeriod = 'monthly' | 'yearly'

export default function PricingPage() {
  const { t } = useLanguage()
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')

  const tiers = [
    {
      id: 'bronze',
      name: t('pricingPage.tiers.bronze.name'),
      tagline: t('pricingPage.tiers.bronze.tagline'),
      description: t('pricingPage.tiers.bronze.description'),
      badge: '/bronze-badge.png',
      monthlyPrice: 0,
      yearlyPrice: 0,
      searchRank: t('pricingPage.tiers.bronze.searchRank'),
      features: [
        { text: t('pricingPage.tiers.bronze.features.0'), included: true },
        { text: t('pricingPage.tiers.bronze.features.1'), included: true },
        { text: t('pricingPage.tiers.bronze.features.2'), included: true },
        { text: t('pricingPage.tiers.bronze.features.3'), included: true },
        { text: t('pricingPage.tiers.bronze.features.4'), included: true },
      ],
      cta: t('pricingPage.tiers.bronze.cta'),
      ctaLink: '/auth/signup',
      highlighted: false,
    },
    {
      id: 'silver',
      name: t('pricingPage.tiers.silver.name'),
      tagline: t('pricingPage.tiers.silver.tagline'),
      description: t('pricingPage.tiers.silver.description'),
      badge: '/silver-badge.png',
      monthlyPrice: 49.99,
      yearlyPrice: 499,
      searchRank: t('pricingPage.tiers.silver.searchRank'),
      features: [
        { text: t('pricingPage.tiers.silver.features.0'), included: true },
        { text: t('pricingPage.tiers.silver.features.1'), included: true },
        { text: t('pricingPage.tiers.silver.features.2'), included: true },
        { text: t('pricingPage.tiers.silver.features.3'), included: true },
        { text: t('pricingPage.tiers.silver.features.4'), included: true },
        { text: t('pricingPage.tiers.silver.features.5'), included: true },
        { text: t('pricingPage.tiers.silver.features.6'), included: true },
      ],
      cta: t('pricingPage.tiers.silver.cta'),
      ctaLink: STRIPE_CONFIG.silver.baseUrl,
      highlighted: true,
      popularLabel: t('pricingPage.tiers.silver.popular'),
    },
    {
      id: 'gold',
      name: t('pricingPage.tiers.gold.name'),
      tagline: t('pricingPage.tiers.gold.tagline'),
      description: t('pricingPage.tiers.gold.description'),
      badge: '/gold-badge.png',
      monthlyPrice: 129.99,
      yearlyPrice: 1299,
      searchRank: t('pricingPage.tiers.gold.searchRank'),
      features: [
        { text: t('pricingPage.tiers.gold.features.0'), included: true },
        { text: t('pricingPage.tiers.gold.features.1'), included: true },
        { text: t('pricingPage.tiers.gold.features.2'), included: true },
        { text: t('pricingPage.tiers.gold.features.3'), included: true },
        { text: t('pricingPage.tiers.gold.features.4'), included: true },
        { text: t('pricingPage.tiers.gold.features.5'), included: true },
        { text: t('pricingPage.tiers.gold.features.6'), included: true },
      ],
      cta: t('pricingPage.tiers.gold.cta'),
      ctaLink: STRIPE_CONFIG.gold.baseUrl,
      highlighted: false,
    },
  ]

  const comparisonFeatures = [
    {
      category: t('pricingPage.comparison.catVisibility'),
      features: [
        { name: t('pricingPage.comparison.features.badgeType'), bronze: 'bronze-badge', silver: 'silver-badge', gold: 'gold-badge' },
        { name: t('pricingPage.comparison.features.searchRanking'), bronze: t('pricingPage.comparison.values.boosted'), silver: t('pricingPage.comparison.values.priority'), gold: t('pricingPage.comparison.values.pinnedTop') },
        { name: t('pricingPage.comparison.features.homeFeature'), bronze: false, silver: false, gold: true },
      ],
    },
    {
      category: t('pricingPage.comparison.catContact'),
      features: [
        { name: t('pricingPage.comparison.features.mapPin'), bronze: true, silver: true, gold: true },
        { name: t('pricingPage.comparison.features.unclickableInfo'), bronze: true, silver: true, gold: true },
        { name: t('pricingPage.comparison.features.clickableWeb'), bronze: false, silver: true, gold: true },
        { name: t('pricingPage.comparison.features.clickablePhone'), bronze: false, silver: true, gold: true },
        { name: t('pricingPage.comparison.features.clickableEmail'), bronze: false, silver: true, gold: true },
        { name: t('pricingPage.comparison.features.socialLinks'), bronze: false, silver: true, gold: true },
        { name: t('pricingPage.comparison.features.whatsappLink'), bronze: false, silver: true, gold: true },
        { name: t('pricingPage.comparison.features.directMessage'), bronze: false, silver: false, gold: true },
      ],
    },
    {
      category: t('pricingPage.comparison.catContent'),
      features: [
        { name: t('pricingPage.comparison.features.photos'), bronze: '1', silver: '5', gold: t('pricingPage.comparison.values.unlimited') },
        { name: t('pricingPage.comparison.features.descLength'), bronze: t('pricingPage.comparison.values.words100'), silver: t('pricingPage.comparison.values.words200'), gold: t('pricingPage.comparison.values.words300') },
        { name: t('pricingPage.comparison.features.displayAmenities'), bronze: true, silver: true, gold: true },
        { name: t('pricingPage.comparison.features.showPricing'), bronze: false, silver: true, gold: true },
        { name: t('pricingPage.comparison.features.youtubeIntegration'), bronze: false, silver: false, gold: t('pricingPage.comparison.values.video1') },
        { name: t('pricingPage.comparison.features.eventsCalendar'), bronze: false, silver: false, gold: true },
        { name: t('pricingPage.comparison.features.faqSection'), bronze: false, silver: false, gold: true },
      ],
    },
    {
      category: t('pricingPage.comparison.catReviews'),
      features: [
        { name: t('pricingPage.comparison.features.receiveReviews'), bronze: false, silver: true, gold: true },
        { name: t('pricingPage.comparison.features.responseReviews'), bronze: false, silver: true, gold: true },
      ],
    },
    {
      category: t('pricingPage.comparison.catAnalytics'),
      features: [
        { name: t('pricingPage.comparison.features.analyticsDash'), bronze: false, silver: true, gold: true },
      ],
    },
  ]

  const faqs = [
    {
      q: t('pricingPage.faq.items.0.q'),
      a: t('pricingPage.faq.items.0.a'),
    },
    {
      q: t('pricingPage.faq.items.1.q'),
      a: t('pricingPage.faq.items.1.a'),
    },
    {
      q: t('pricingPage.faq.items.2.q'),
      a: t('pricingPage.faq.items.2.a'),
    },
    {
      q: t('pricingPage.faq.items.3.q'),
      a: t('pricingPage.faq.items.3.a'),
    },
    {
      q: t('pricingPage.faq.items.4.q'),
      a: t('pricingPage.faq.items.4.a'),
    },
    {
      q: t('pricingPage.faq.items.5.q'),
      a: t('pricingPage.faq.items.5.a'),
    },
  ]

  const getPrice = (tier: typeof tiers[0]) => {
    if (tier.monthlyPrice === 0) return t('pricingPage.freeLabel')
    return billingPeriod === 'monthly'
      ? `$${tier.monthlyPrice}`
      : `$${tier.yearlyPrice}`
  }

  const getPeriodLabel = (tier: typeof tiers[0]) => {
    if (tier.monthlyPrice === 0) return t('pricingPage.foreverLabel')
    return billingPeriod === 'monthly' ? t('pricingPage.monthLabel') : t('pricingPage.yearLabel')
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
            {t('pricingPage.heroTitle')}
          </h1>
          <p className="text-xl text-stone-600 mb-8">
            {t('pricingPage.heroSubtitle')}
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
              {t('pricingPage.monthly')}
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${billingPeriod === 'yearly'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-800'
                }`}
            >
              {t('pricingPage.yearly')}
              <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {t('pricingPage.save')}
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
                id={tier.id}
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
                    {tier.badge ? (
                      <Image
                        src={tier.badge}
                        alt={tier.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 mx-auto object-contain"
                      />
                    ) : (
                      <div className="h-16 w-16 mx-auto bg-stone-100 rounded-full flex items-center justify-center border border-stone-200">
                        <Star className="w-8 h-8 text-stone-400" />
                      </div>
                    )}
                    <h3 className="text-2xl font-bold text-stone-800 mt-2">{tier.name}</h3>
                    <p className="text-emerald-600 font-medium">{tier.tagline}</p>
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
                        {t('pricingPage.savePrefix')}{getSavings(tier)}{t('pricingPage.saveSuffix')}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-stone-600 text-center mb-6">
                    {tier.description}
                  </p>

                  {/* Search Rank */}
                  <div className="bg-stone-50 rounded-lg p-3 mb-6">
                    <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">{t('pricingPage.searchRankLabel')}</p>
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
            {t('pricingPage.comparison.title')}
          </h2>
          <p className="text-stone-600 text-center mb-12">
            {t('pricingPage.comparison.subtitle')}
          </p>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-stone-200">
            {/* Table Header */}
            <div className="grid grid-cols-4 bg-stone-800 text-white">
              <div className="p-4 text-center font-semibold text-stone-700">{t('pricingPage.comparison.colFeature')}</div>
              <div className="p-4 text-center font-semibold text-stone-300">
                <div className="flex items-center justify-center gap-2">
                  <Image src="/bronze-badge.png" alt="Bronze" width={24} height={24} className="h-6 w-6 object-contain" />
                  <span>{t('pricingPage.tiers.bronze.name')}</span>
                </div>
              </div>
              <div className="p-4 text-center font-semibold bg-green-700">
                <div className="flex items-center justify-center gap-2">
                  <Image src="/silver-badge.png" alt="Silver" width={24} height={24} className="h-6 w-6 object-contain" />
                  <span>{t('pricingPage.tiers.silver.name')}</span>
                </div>
              </div>
              <div className="p-4 text-center font-semibold text-stone-700">
                <div className="flex items-center justify-center gap-2">
                  <Image src="/gold-badge.png" alt="Gold" width={24} height={24} className="h-6 w-6 object-contain" />
                  <span>{t('pricingPage.tiers.gold.name')}</span>
                </div>
              </div>
            </div>

            {/* Price Row */}
            <div className="grid grid-cols-4 border-b border-stone-200 bg-stone-50">
              <div className="p-4 font-semibold text-stone-700">{t('pricingPage.comparison.colPrice')}</div>
              <div className="p-4 text-center font-bold text-stone-800">{t('pricingPage.freeLabel')}</div>
              <div className="p-4 text-center font-bold text-green-600 bg-green-50">$49.99/mo</div>
              <div className="p-4 text-center font-bold text-stone-800">$129.99/mo</div>
            </div>

            {/* Feature Categories */}
            {comparisonFeatures.map((category, catIdx) => (
              <div key={catIdx}>
                {/* Category Header */}
                <div className="grid grid-cols-4 bg-stone-100 border-b border-stone-200">
                  <div className="col-span-4 p-3 font-semibold text-stone-700">
                    {category.category}
                  </div>
                </div>

                {/* Features */}
                {category.features.map((feature, featIdx) => (
                  <div
                    key={featIdx}
                    className="grid grid-cols-4 border-b border-stone-100 hover:bg-stone-50"
                  >
                    <div className="p-4 text-stone-600">{feature.name}</div>
                    {['bronze', 'silver', 'gold'].map((tier) => {
                      const value = feature[tier as keyof typeof feature]
                      return (
                        <div
                          key={tier}
                          className={`p-4 text-center ${tier === 'silver' ? 'bg-green-50/50' : ''}`}
                        >
                          {typeof value === 'boolean' ? (
                            value ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-stone-300 mx-auto" />
                            )
                          ) : value === 'bronze-badge' ? (
                            <div className="flex items-center justify-center gap-2">
                              <Image src="/bronze-badge.png" alt="Bronze" width={24} height={24} className="h-6 w-6 object-contain" />
                              <span className="text-stone-700 font-medium hidden sm:inline">{t('pricingPage.tiers.bronze.name')}</span>
                            </div>
                          ) : value === 'silver-badge' ? (
                            <div className="flex items-center justify-center gap-2">
                              <Image src="/silver-badge.png" alt="Silver" width={24} height={24} className="h-6 w-6 object-contain" />
                              <span className="text-stone-700 font-medium hidden sm:inline">{t('pricingPage.tiers.silver.name')}</span>
                            </div>
                          ) : value === 'gold-badge' ? (
                            <div className="flex items-center justify-center gap-2">
                              <Image src="/gold-badge.png" alt="Gold" width={24} height={24} className="h-6 w-6 object-contain" />
                              <span className="text-stone-700 font-medium hidden sm:inline">{t('pricingPage.tiers.gold.name')}</span>
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


      {/* FAQ Section */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-stone-800 text-center mb-12">
            {t('pricingPage.faq.title')}
          </h2>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
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
            {t('pricingPage.ctaBottom.title')}
          </h2>
          <p className="text-xl text-stone-600 mb-8">
            {t('pricingPage.ctaBottom.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors shadow-lg"
            >
              {t('pricingPage.ctaBottom.btn1')}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-700 px-8 py-4 rounded-xl font-semibold transition-colors border border-stone-300"
            >
              {t('pricingPage.ctaBottom.btn2')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}