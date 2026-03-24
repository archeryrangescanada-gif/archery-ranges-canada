'use client';

import { Range, BadgeType } from '@/types/range';
import { MediaSection } from '@/components/listing/MediaSection';
import { RangeHeader } from '@/components/listing/RangeHeader';
import { ContactSection } from '@/components/listing/ContactSection';
import { BusinessHoursDisplay } from '@/components/listing/BusinessHoursDisplay';
import { RangeSpecifications } from '@/components/listing/RangeSpecifications';
import { AmenitiesGrid } from '@/components/listing/AmenitiesGrid';
import { PricingInfo } from '@/components/listing/PricingInfo';
import { SocialLinks } from '@/components/listing/SocialLinks';
import { ReviewSection } from '@/components/listing/ReviewSection';
import { FavoriteButton } from '@/components/listing/FavoriteButton';
import { EventsSection } from '@/components/listing/EventsSection';
import { ContactForm } from '@/components/listing/ContactForm';
import { MapSection } from '@/components/listing/MapSection';
import { SubscriptionBadge } from '@/components/listing/SubscriptionBadge';
import { BreadcrumbNav } from '@/components/listing/BreadcrumbNav';
import { UpgradeCTA } from '@/components/listing/UpgradeCTA';
import { ClaimListingBanner } from '@/components/listing/ClaimListingBanner';
import { RangeAnalyticsProvider } from '@/components/RangeAnalyticsProvider';
import { MobileStickyBar } from '@/components/listing/MobileStickyBar';
import { normalizeToArray } from '@/lib/utils/data-normalization';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface RangeClientProps {
  range: Range;
  params: {
    province: string;
    city: string;
    range: string;
  };
  reviews: any[];
  events: any[];
  isFavorited: boolean;
  isOwner: boolean;
  tierLimits: any;
  badgeType: BadgeType | null;
  showCarousel: boolean;
  showVideo: boolean;
  goldSponsorAd?: React.ReactNode;
}

export function RangeClient({
  range,
  params,
  reviews,
  events,
  isFavorited,
  isOwner,
  tierLimits,
  badgeType,
  showCarousel,
  showVideo,
  goldSponsorAd
}: RangeClientProps) {
  const { t } = useLanguage();

  return (
      <RangeAnalyticsProvider
        rangeId={range.id}
        rangeName={range.name}
        province={range.cities?.provinces?.name || range.province}
        city={range.cities?.name || range.city}
      >
        <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 pb-24 md:pb-0">
          {/* Breadcrumb Navigation */}
          <BreadcrumbNav
            province={{ name: range.cities?.provinces?.name || range.province, slug: params.province }}
            city={{ name: range.cities?.name || range.city, slug: params.city }}
            rangeName={range.name}
          />

          {/* Hero Section with Media */}
          <section className="relative">
            <MediaSection
              images={tierLimits.maxPhotos !== -1 ? normalizeToArray(range.post_images).slice(0, tierLimits.maxPhotos) : normalizeToArray(range.post_images)}
              videos={normalizeToArray(range.video_urls)}
              rangeName={range.name}
              tier={range.subscription_tier}
              showCarousel={showCarousel}
              showVideo={showVideo}
            />

            {badgeType && (
              <div className="absolute top-4 right-4 z-10">
                <SubscriptionBadge type={badgeType} />
              </div>
            )}
          </section>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Claim Banner for unclaimed listings */}
            {!range.owner_id && (
              <div className="mb-8">
                <ClaimListingBanner
                  rangeId={range.id}
                  rangeName={range.name}
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Right Column - Sidebar (rendered first in DOM for mobile; visually reordered via order) */}
              <div className="space-y-6 order-first lg:order-last">
                {/* Google Calendar Embed */}
                {tierLimits.hasEvents && range.google_calendar_embed_url && (
                  <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                    <h2 className="text-xl font-semibold text-stone-800 mb-6 flex items-center gap-2 text-sm">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      {t('rangePage.calendarSchedule')}
                    </h2>
                    <div className="w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-50" style={{ height: '400px' }}>
                      <iframe
                        src={range.google_calendar_embed_url}
                        style={{ border: 0, width: '100%', height: '100%' }}
                        frameBorder="0"
                        scrolling="yes"
                        title={`${range.name} Events Calendar`}
                      ></iframe>
                    </div>
                  </section>
                )}

                {/* Contact Card — first on mobile */}
                <ContactSection
                  phone={range.phone_number}
                  email={range.email}
                  website={range.website}
                  rangeId={range.id}
                  rangeName={range.name}
                  tier={range.subscription_tier}
                  isOwner={isOwner}
                />

                {/* Business Hours */}
                {range.business_hours && (
                  <BusinessHoursDisplay hours={range.business_hours} />
                )}

                {/* Contact Form (Basic+) */}
                {tierLimits.hasContactForm && (
                  <ContactForm rangeId={range.id} rangeName={range.name} whatsappNumber={range.whatsapp_number} contactEmail={range.email} />
                )}

                {/* Gold Sponsor Ad (Free/Bronze only) */}
                {!tierLimits.featuredBadge && goldSponsorAd}

                {/* Upgrade CTA for claimed free tier listings */}
                {range.subscription_tier === 'free' && range.owner_id && (
                  <UpgradeCTA
                    rangeId={range.id}
                    rangeName={range.name}
                  />
                )}
              </div>

              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Header */}
                <RangeHeader
                  name={range.name}
                  address={range.address || ''}
                  city={range.cities?.name || range.city}
                  province={range.cities?.provinces?.name || range.province}
                  postalCode={range.postal_code || ''}
                  facilityType={range.facility_type}
                  rating={reviews.length > 0 ? reviews.reduce((sum: any, r: any) => sum + r.rating, 0) / reviews.length : null}
                  reviewCount={reviews.length}
                  isClaimed={!!range.owner_id}
                  isArcheryOntario={Array.isArray(range.post_tags) && range.post_tags.includes('archery_ontario')}
                  action={<FavoriteButton listingId={range.id} initialIsFavorited={isFavorited} />}
                />

                {/* Social Links (Silver+) */}
                {tierLimits.hasSocialLinks && (range.facebook_url || range.instagram_url || range.youtube_url || range.twitter_url) && (
                  <SocialLinks
                    facebook={range.facebook_url}
                    instagram={range.instagram_url}
                    youtube={range.youtube_url}
                    twitter={range.twitter_url}
                  />
                )}

                {/* Description */}
                {(range.post_content || range.description) && (
                  <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                    <h2 className="text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                      {t('rangePage.about', { name: range.name })}
                    </h2>
                    <div className="text-stone-600 leading-relaxed whitespace-pre-line">
                      {range.post_content || range.description}
                    </div>

                    {range.post_tags && (
                      (() => {
                        // Handle post_tags as either array or JSON string
                        const tags = Array.isArray(range.post_tags)
                          ? range.post_tags
                          : typeof range.post_tags === 'string'
                            ? (() => { try { return JSON.parse(range.post_tags); } catch { return []; } })()
                            : [];
                        return tags.length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {tags.map((tag: string, index: number) => (
                              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null;
                      })()
                    )}
                  </section>
                )}

                {/* Range Specifications */}
                <RangeSpecifications
                  lengthYards={range.range_length_yards}
                  numberOfLanes={range.number_of_lanes ?? undefined}
                  facilityType={range.facility_type}
                  bowTypesAllowed={range.bow_types_allowed}
                  maxDrawWeight={range.max_draw_weight}
                />

                {/* Amenities */}
                <AmenitiesGrid
                  hasProShop={range.has_pro_shop}
                  has3dCourse={range.has_3d_course}
                  hasFieldCourse={range.has_field_course}
                  equipmentRental={range.equipment_rental_available}
                  lessonsAvailable={range.lessons_available}
                  parkingAvailable={range.parking_available}
                  accessibility={range.accessibility}
                />

                {/* Pricing */}
                <PricingInfo
                  membershipRequired={range.membership_required}
                  membershipPrice={range.membership_price_adult}
                  dropInPrice={range.drop_in_price}
                  lessonPriceRange={range.lesson_price_range}
                  tier={range.subscription_tier}
                />

                {/* Reviews */}
                {tierLimits.hasReviews && (
                  <ReviewSection listingId={range.id} initialReviews={reviews} />
                )}

                {/* Events */}
                {tierLimits.hasEvents && events.length > 0 && (
                  <EventsSection events={events} rangeName={range.name} />
                )}

                {/* Map */}
                {range.latitude && range.longitude && (
                  <MapSection
                    latitude={range.latitude}
                    longitude={range.longitude}
                    name={range.name}
                    address={range.address || ''}
                    rangeId={range.id}
                    rangeName={range.name}
                  />
                )}

                {/* FAQ Section (Gold only) */}
                {tierLimits.goldBadge && (
                  <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                    <h2 className="text-xl font-semibold text-stone-800 mb-6">
                      {t('rangePage.faqTitle', { name: range.name })}
                    </h2>

                    <div className="space-y-4">
                      <div className="border-b border-stone-100 pb-4">
                        <h3 className="font-medium text-stone-800 mb-2">{t('rangePage.faqLocationQ', { name: range.name })}</h3>
                        <p className="text-stone-600 text-sm">
                          {t('rangePage.faqLocationA', {
                            name: range.name,
                            address: range.address || range.city,
                            province: range.province,
                            mapText: range.latitude && range.longitude ? t('rangePage.viewMapForDirections') : ''
                          })}
                        </p>
                      </div>

                      {range.facility_type && (
                        <div className="border-b border-stone-100 pb-4">
                          <h3 className="font-medium text-stone-800 mb-2">{t('rangePage.faqFacilityQ', { name: range.name })}</h3>
                          <p className="text-stone-600 text-sm">
                            {range.facility_type === 'both'
                              ? t('rangePage.faqFacilityABoth', { name: range.name })
                              : t('rangePage.faqFacilityA', { name: range.name, type: range.facility_type === 'indoor' ? t('rangePage.indoorRange').toLowerCase() : t('rangePage.outdoorRange').toLowerCase() })
                            }
                          </p>
                        </div>
                      )}

                      {range.lessons_available && (
                        <div className="border-b border-stone-100 pb-4">
                          <h3 className="font-medium text-stone-800 mb-2">{t('rangePage.faqLessonsQ', { name: range.name })}</h3>
                          <p className="text-stone-600 text-sm">
                            {t('rangePage.faqLessonsA', {
                              name: range.name,
                              priceText: range.lesson_price_range ? t('rangePage.lessonPricesRange', { prices: range.lesson_price_range }) : ''
                            })}
                          </p>
                        </div>
                      )}

                      {range.equipment_rental_available && (
                        <div className="border-b border-stone-100 pb-4">
                          <h3 className="font-medium text-stone-800 mb-2">{t('rangePage.faqRentalsQ', { name: range.name })}</h3>
                          <p className="text-stone-600 text-sm">
                            {t('rangePage.faqRentalsA', { name: range.name })}
                          </p>
                        </div>
                      )}

                      <div>
                        <h3 className="font-medium text-stone-800 mb-2">{t('rangePage.faqContactQ', { name: range.name })}</h3>
                        <p className="text-stone-600 text-sm">
                          {t('rangePage.faqContactA', {
                            name: range.name,
                            phoneText: range.phone_number ? t('rangePage.byPhoneAt', { phone: range.phone_number }) : '',
                            emailText: range.email ? (range.phone_number ? t('rangePage.orByEmailAt', { email: range.email }) : t('rangePage.byEmailAt', { email: range.email })) : '',
                            websiteText: range.website ? t('rangePage.visitWebsiteForMore') : ''
                          })}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Related Ranges CTA */}
                <section className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
                  <h3 className="font-semibold text-stone-800 mb-2">{t('rangePage.lookingForMore')}</h3>
                  <p className="text-stone-600 text-sm mb-4">
                    {t('rangePage.exploreAllInCity', { city: range.city })}
                  </p>
                  <Link
                    href={`/${params.province}/${params.city}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                  >
                    {t('rangePage.viewAllInCity', { city: range.city })}
                  </Link>
                </section>
              </div>
            </div>
          </div>

          {/* Mobile sticky call/directions bar */}
          <MobileStickyBar
            phone={range.phone_number}
            latitude={range.latitude}
            longitude={range.longitude}
            address={range.address}
            rangeId={range.id}
            rangeName={range.name}
          />
        </main>
      </RangeAnalyticsProvider>
  );
}
