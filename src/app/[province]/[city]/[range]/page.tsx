import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Range, getTierLimits, getBadgeType, canShowCarousel, canShowVideo } from '@/types/range';
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
import { normalizeToArray } from '@/lib/utils/data-normalization';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface PageProps {
  params: {
    province: string;
    city: string;
    range: string;
  };
}



async function getRange(provinceSlug: string, citySlug: string, rangeSlug: string): Promise<Range | null> {
  const supabase = await createClient();

  // Query the range with city/province relationships
  const { data, error } = await supabase
    .from('ranges')
    .select(`
      *,
      cities (
        name,
        slug,
        provinces (
          name,
          slug
        )
      )
    `)
    .eq('slug', rangeSlug)
    .single();

  if (error || !data) {
    console.error('Range not found:', rangeSlug, error);
    return null;
  }

  // Cast to handle Supabase's nested relationship types
  const cities = data.cities as any;

  // Validate the URL matches the city/province in the database
  const cityMatches = cities?.slug === citySlug;
  const provinceMatches = cities?.provinces?.slug === provinceSlug;

  if (!cityMatches || !provinceMatches) {
    console.error('URL mismatch for range:', {
      rangeSlug,
      expectedCity: citySlug,
      actualCity: cities?.slug,
      expectedProvince: provinceSlug,
      actualProvince: cities?.provinces?.slug
    });
    return null;
  }

  // Increment view count
  await supabase.rpc('increment_view_count', { range_uuid: data.id });

  // Map city/province names and normalize string-encoded arrays
  return {
    ...data,
    city: cities?.name || '',
    province: cities?.provinces?.name || '',
    cities: cities,
    post_images: normalizeToArray(data.post_images),
    video_urls: normalizeToArray(data.video_urls),
    post_tags: typeof data.post_tags === 'string'
      ? data.post_tags.split(',').map((s: string) => s.trim()).filter(Boolean)
      : Array.isArray(data.post_tags) ? data.post_tags : [],
    bow_types_allowed: typeof data.bow_types_allowed === 'string'
      ? data.bow_types_allowed.split(',').map((s: string) => s.trim()).filter(Boolean)
      : Array.isArray(data.bow_types_allowed) ? data.bow_types_allowed : [],
    business_hours: typeof data.business_hours === 'string' && data.business_hours.startsWith('{')
      ? (() => {
        try {
          return JSON.parse(data.business_hours);
        } catch (e) {
          return data.business_hours;
        }
      })()
      : data.business_hours
  } as Range;
}

async function getReviews(rangeId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url
      )
    `)
    .eq('listing_id', rangeId)
    .order('created_at', { ascending: false })
    .limit(10);

  return data || [];
}

async function getEvents(rangeId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('range_events')
    .select('*')
    .eq('range_id', rangeId)
    .eq('is_published', true)
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true })
    .limit(5);

  return data || [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const range = await getRange(params.province, params.city, params.range);

  if (!range) {
    return { title: 'Range Not Found | Archery Ranges Canada' };
  }

  const features: string[] = [];
  if (range.facility_type === 'indoor') features.push('Indoor');
  if (range.facility_type === 'outdoor') features.push('Outdoor');
  if (range.facility_type === 'both') features.push('Indoor & Outdoor');
  if (range.lessons_available) features.push('Lessons');
  if (range.has_pro_shop) features.push('Pro Shop');
  if (range.equipment_rental_available) features.push('Rentals');

  const featureText = features.length > 0 ? features.join(', ') + '. ' : '';
  const description = `${range.name} - ${featureText}${range.facility_type ? range.facility_type.charAt(0).toUpperCase() + range.facility_type.slice(1) : 'Archery'} range in ${range.cities?.name || range.city}, ${range.cities?.provinces?.name || range.province}. Hours, prices, reviews & directions.`;

  return {
    title: `${range.name} | ${range.facility_type === 'indoor' ? 'Indoor' : range.facility_type === 'outdoor' ? 'Outdoor' : ''} Archery Range in ${range.city} (2025)`,
    description: description.substring(0, 160),
    openGraph: {
      title: `${range.name} - Archery Range in ${range.city}`,
      description,
      images: range.post_images?.[0] ? [range.post_images[0]] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: range.name,
      description,
    },
  };
}

export default async function RangeDetailPage({ params }: PageProps) {
  const range = await getRange(params.province, params.city, params.range);

  if (!range) {
    notFound();
  }

  const tierLimits = getTierLimits(range.subscription_tier);
  const badgeType = getBadgeType(range.subscription_tier);
  const showCarousel = canShowCarousel(range.subscription_tier);
  const showVideo = canShowVideo(range.subscription_tier);

  // Note: We need to use 'reviews' table instead of 'range_reviews' for the new system if we migrated completely
  // But getReviews function above was updated to use 'reviews' table? 
  // Wait, I updated getReviews block in this file content to use 'reviews' table and join 'profiles'.
  const reviews = tierLimits.hasReviews ? await getReviews(range.id) : [];
  const events = tierLimits.hasEvents ? await getEvents(range.id) : [];

  // Check user and favorite status
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isFavorited = false;
  if (user) {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', range.id)
      .single();
    isFavorited = !!data;
  }

  return (
    <>
      <Header />
      <RangeAnalyticsProvider
        rangeId={range.id}
        rangeName={range.name}
        province={range.cities?.provinces?.name || range.province}
        city={range.cities?.name || range.city}
      >
        <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
          {/* Breadcrumb Navigation */}
          <BreadcrumbNav
            province={{ name: range.cities?.provinces?.name || range.province, slug: params.province }}
            city={{ name: range.cities?.name || range.city, slug: params.city }}
            rangeName={range.name}
          />

          {/* Hero Section with Media */}
          <section className="relative">
            <MediaSection
              images={normalizeToArray(range.post_images)}
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
                  action={<FavoriteButton listingId={range.id} initialIsFavorited={isFavorited} />}
                />

                {/* Social Links */}
                {(range.facebook_url || range.instagram_url || range.youtube_url || range.twitter_url) && (
                  <SocialLinks
                    facebook={range.facebook_url}
                    instagram={range.instagram_url}
                    youtube={range.youtube_url}
                    twitter={range.twitter_url}
                  />
                )}

                {/* Description */}
                {range.post_content && (
                  <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                    <h2 className="text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                      About {range.name}
                    </h2>
                    <div className="text-stone-600 leading-relaxed whitespace-pre-line">
                      {range.post_content}
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

                {/* FAQ Section (Silver/Basic and above only) */}
                {tierLimits.hasClickableContact && (
                  <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                    <h2 className="text-xl font-semibold text-stone-800 mb-6">
                      Frequently Asked Questions about {range.name}
                    </h2>

                    <div className="space-y-4">
                      <div className="border-b border-stone-100 pb-4">
                        <h3 className="font-medium text-stone-800 mb-2">Where is {range.name} located?</h3>
                        <p className="text-stone-600 text-sm">
                          {range.name} is located at {range.address || range.city}, {range.province}, Canada.
                          {range.latitude && range.longitude && ' View the map above for exact directions.'}
                        </p>
                      </div>

                      {range.facility_type && (
                        <div className="border-b border-stone-100 pb-4">
                          <h3 className="font-medium text-stone-800 mb-2">Is {range.name} an indoor or outdoor range?</h3>
                          <p className="text-stone-600 text-sm">
                            {range.name} is {range.facility_type === 'both' ? 'both an indoor and outdoor' : `an ${range.facility_type}`} archery facility.
                          </p>
                        </div>
                      )}

                      {range.lessons_available && (
                        <div className="border-b border-stone-100 pb-4">
                          <h3 className="font-medium text-stone-800 mb-2">Does {range.name} offer archery lessons?</h3>
                          <p className="text-stone-600 text-sm">
                            Yes! {range.name} offers archery lessons for beginners and experienced archers.
                            {range.lesson_price_range && ` Lesson prices range from ${range.lesson_price_range}.`}
                          </p>
                        </div>
                      )}

                      {range.equipment_rental_available && (
                        <div className="border-b border-stone-100 pb-4">
                          <h3 className="font-medium text-stone-800 mb-2">Can I rent equipment at {range.name}?</h3>
                          <p className="text-stone-600 text-sm">
                            Yes, {range.name} offers equipment rental so you can try archery without owning your own gear.
                          </p>
                        </div>
                      )}

                      <div>
                        <h3 className="font-medium text-stone-800 mb-2">How do I contact {range.name}?</h3>
                        <p className="text-stone-600 text-sm">
                          You can contact {range.name} {range.phone_number ? `by phone at ${range.phone_number}` : ''}
                          {range.email ? `${range.phone_number ? ' or' : ''} by email at ${range.email}` : ''}.
                          {range.website && ' Visit their website for more information.'}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Related Ranges CTA */}
                <section className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
                  <h3 className="font-semibold text-stone-800 mb-2">Looking for more options?</h3>
                  <p className="text-stone-600 text-sm mb-4">
                    Explore all archery ranges in {range.city} to find the perfect fit for you.
                  </p>
                  <Link
                    href={`/${params.province}/${params.city}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                  >
                    View All Ranges in {range.city} →
                  </Link>
                </section>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Contact Card */}
                <ContactSection
                  phone={range.phone_number}
                  email={range.email}
                  website={range.website}
                  rangeId={range.id}
                  rangeName={range.name}
                  tier={range.subscription_tier}
                  isOwner={!!user && user.id === range.owner_id}
                />

                {/* Business Hours */}
                {range.business_hours && (
                  <BusinessHoursDisplay hours={range.business_hours} />
                )}

                {/* Contact Form (Basic+) */}
                {tierLimits.hasContactForm && (
                  <ContactForm rangeId={range.id} rangeName={range.name} />
                )}



                {/* Upgrade CTA for claimed free tier listings */}
                {range.subscription_tier === 'free' && range.owner_id && (
                  <UpgradeCTA
                    rangeId={range.id}
                    rangeName={range.name}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </RangeAnalyticsProvider>
      <Footer />
    </>
  );
}