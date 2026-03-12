'use client'

import Link from 'next/link'
import { Range } from '@/types/range'
import { RangeCard, RangeCardFeatured } from '@/components/listing/RangeCard'
import { MapPin, Filter, ArrowLeft, Target, Home, ChevronRight, Calendar, Scale, DollarSign, HelpCircle, Building2, TreePine } from 'lucide-react'
import { ClaimListingBanner } from '@/components/listing/ClaimListingBanner'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface CityClientProps {
  city: {
    id: string
    name: string
    slug: string
    province: {
        id: string
        name: string
        slug: string
    }
  }
  provinceSlug: string
  citySlug: string
  ranges: Range[]
  localInfo: {
    backyardLegal: string
    freeRange: string | null
    lessonPrices: { intro: string; private: string; packages: string }
    famousOutdoorSpot: string
  }
}

export default function CityClient({ city, provinceSlug, citySlug, ranges, localInfo }: CityClientProps) {
  const { t } = useLanguage()

  // Sort ranges by tier preference (Gold > Silver > Bronze > Free)
  const sortedRanges = [...ranges].sort((a, b) => {
    const getTierWeight = (tier: string | undefined | null) => {
      if (tier === 'gold') return 100
      if (tier === 'silver') return 50
      if (tier === 'bronze') return 20
      return 0
    }
    return getTierWeight(b.subscription_tier) - getTierWeight(a.subscription_tier)
  });

  const featuredRanges = sortedRanges.filter((r) => r.is_featured || r.subscription_tier === 'gold' || r.subscription_tier === 'silver');
  const regularRanges = sortedRanges.filter((r) => !featuredRanges.includes(r));

  const indoorCount = ranges.filter((r) => r.facility_type === 'indoor' || r.facility_type === 'both').length;
  const outdoorCount = ranges.filter((r) => r.facility_type === 'outdoor' || r.facility_type === 'both').length;

  return (
    <main className="flex-1">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-1 py-4 text-sm overflow-x-auto">
            <li className="flex items-center">
              <Link href="/" className="flex items-center gap-1.5 text-stone-600 hover:text-emerald-600 transition-colors">
                <Home className="w-4 h-4" />
                {t('breadcrumb.home')}
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 text-stone-400 mx-2" />
              <Link href={`/${provinceSlug}`} className="text-stone-600 hover:text-emerald-600 transition-colors">
                {city.province.name}
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 text-stone-400 mx-2" />
              <span className="text-stone-800 font-medium">{city.name}</span>
            </li>
          </ol>
        </div>
      </nav>

      {/* Claim CTA Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ClaimListingBanner />
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <Link href={`/${provinceSlug}`} className="inline-flex items-center gap-2 text-emerald-200 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t('cityPage.backTo', { province: city.province.name })}
          </Link>

          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-emerald-300" />
            <span className="text-emerald-200">{city.province.name}, Canada</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('cityPage.bestRangesIn', { city: city.name, province: city.province.name })}</h1>

          <p className="text-xl text-emerald-100 max-w-3xl mb-8 whitespace-pre-line">
            {t('cityPage.introDesc', { city: city.name })}
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
              <p className="text-3xl font-bold">{ranges.length}</p>
              <p className="text-sm text-emerald-200">{t('cityPage.totalRanges')}</p>
            </div>
            {indoorCount > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-emerald-300" />
                <div>
                  <p className="text-3xl font-bold">{indoorCount}</p>
                  <p className="text-sm text-emerald-200">{t('cityPage.indoor')}</p>
                </div>
              </div>
            )}
            {outdoorCount > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-3">
                <TreePine className="w-6 h-6 text-emerald-300" />
                <div>
                  <p className="text-3xl font-bold">{outdoorCount}</p>
                  <p className="text-sm text-emerald-200">{t('cityPage.outdoor')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {ranges.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-stone-200 flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-stone-400" />
            </div>
            <h2 className="text-2xl font-bold text-stone-800 mb-3">{t('cityPage.noRangesTitle', { city: city.name })}</h2>
            <p className="text-stone-600 mb-6 max-w-md mx-auto">{t('cityPage.noRangesDesc', { city: city.name })}</p>
            <Link href="/submit-range" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors">
              {t('cityPage.submitRange')}
            </Link>
          </div>
        ) : (
          <>
            {/* Top Rated Ranges Section */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-stone-800 mb-2">{t('cityPage.topRatedIn', { city: city.name })}</h2>
              <p className="text-stone-600 mb-8">{t('cityPage.compareCount', { count: ranges.length })}</p>

              {featuredRanges.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">⭐ {t('cityPage.featured')}</span>
                  </div>
                  <div className="space-y-6">
                    {featuredRanges.map((range) => (
                      <RangeCardFeatured key={range.id} range={range} provinceSlug={provinceSlug} citySlug={citySlug} />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-stone-800">{featuredRanges.length > 0 ? t('cityPage.allRanges') : ''}</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-stone-200 text-stone-600 hover:border-stone-300 transition-colors">
                  <Filter className="w-4 h-4" />
                  {t('cityPage.filter')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(featuredRanges.length > 0 ? regularRanges : sortedRanges).map((range) => (
                  <RangeCard key={range.id} range={range} provinceSlug={provinceSlug} citySlug={citySlug} />
                ))}
              </div>
            </section>

            {/* Local Archery Guide Section */}
            <section className="bg-white rounded-2xl border border-stone-200 p-8 mb-12">
              <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">📍</span>
                {t('cityPage.localGuideTitle', { city: city.name })}
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Indoor vs Outdoor Seasons */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    {t('cityPage.indoorVsOutdoor')}
                  </h3>
                  <div className="text-stone-600 space-y-2">
                    <p>{t('cityPage.outdoorSeasonIs', { province: city.province.name, spot: localInfo.famousOutdoorSpot })}</p>
                    <p>
                      <strong className="text-stone-800">{t('cityPage.winterStrategy')}</strong> {t('cityPage.winterStrategyDesc', { 
                        city: city.name, 
                        indoorString: indoorCount > 0 ? t('cityPage.winterIndoorString', { count: indoorCount, ranges: indoorCount === 1 ? 'range' : 'ranges' }) : '' 
                      })}
                    </p>
                  </div>
                </div>

                {/* Is Backyard Archery Legal */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-emerald-600" />
                    {t('cityPage.isBackyardLegal', { city: city.name })}
                  </h3>
                  <div className="text-stone-600 space-y-2">
                    <p><strong className="text-stone-800">{t('cityPage.shortAnswer')}</strong> {localInfo.backyardLegal.includes('No') ? t('cityPage.generallyNo') : t('cityPage.itDepends')}</p>
                    <p>{localInfo.backyardLegal}</p>
                    <div className="text-amber-700 bg-amber-50 p-3 rounded-lg text-sm border border-amber-200">
                      ⚠️ <strong>{t('cityPage.warning')}</strong> {t('cityPage.bylawWarning', { city: city.name })}
                    </div>
                  </div>
                </div>

                {/* PAL License */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-emerald-600" />
                    {t('cityPage.doINeedPal')}
                  </h3>
                  <div className="text-stone-600 space-y-2">
                    <p><strong className="text-stone-800">{t('cityPage.no')}</strong> {t('cityPage.palDesc')}</p>
                    <p className="text-sm text-stone-500 italic">{t('cityPage.palException')}</p>
                  </div>
                </div>

                {/* Free Shooting Options */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    {t('cityPage.whereShootFree')}
                  </h3>
                  <div className="text-stone-600 space-y-2">
                    {localInfo.freeRange ? (
                      <p className="text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">✓ {localInfo.freeRange}</p>
                    ) : (
                      <p>{t('cityPage.noFreeRangesDesc', { city: city.name })}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-white rounded-2xl border border-stone-200 p-8 mb-12">
              <h2 className="text-2xl font-bold text-stone-800 mb-6">{t('cityPage.faqTitle')}</h2>

              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-6">
                  <h3 className="font-semibold text-stone-800 mb-2">{t('cityPage.faqQ1', { city: city.name })}</h3>
                  <p className="text-stone-600 whitespace-pre-line">{t('cityPage.faqA1', localInfo.lessonPrices)}</p>
                </div>

                <div className="border-b border-stone-100 pb-6">
                  <h3 className="font-semibold text-stone-800 mb-2">{t('cityPage.faqQ2', { city: city.name })}</h3>
                  <p className="text-stone-600 whitespace-pre-line">{t('cityPage.faqA2', { city: city.name })}</p>
                </div>

                <div className="border-b border-stone-100 pb-6">
                  <h3 className="font-semibold text-stone-800 mb-2">{t('cityPage.faqQ3')}</h3>
                  <p className="text-stone-600 whitespace-pre-line">{t('cityPage.faqA3', { city: city.name })}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-stone-800 mb-2">{t('cityPage.faqQ4')}</h3>
                  <p className="text-stone-600 whitespace-pre-line">{t('cityPage.faqA4')}</p>
                </div>
              </div>
            </section>

            {/* CTA Block */}
            <section className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-3">{t('cityPage.ownARange', { city: city.name })}</h2>
              <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">{t('cityPage.ownARangeDesc')}</p>
              <Link href="/pricing" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors">
                {t('cityPage.addBusiness')}
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
