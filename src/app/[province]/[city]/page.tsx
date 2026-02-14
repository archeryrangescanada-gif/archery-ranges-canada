import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Range } from '@/types/range';
import { RangeCard, RangeCardFeatured } from '@/components/listing/RangeCard';
import { MapPin, Filter, ArrowLeft, Target, Home, ChevronRight, Calendar, Scale, DollarSign, HelpCircle, Building2, TreePine } from 'lucide-react';
import { Province } from '@/types/database';
import { ClaimListingBanner } from '@/components/listing/ClaimListingBanner';

// Enable ISR - revalidate every 5 minutes
export const revalidate = 300;

interface PageProps {
  params: {
    province: string;
    city: string;
  };
}

interface CityData {
  id: string;
  name: string;
  slug: string;
  province: { id: string; name: string; slug: string };
}

// City-specific SEO data - can be expanded or moved to database
const cityLocalInfo: Record<string, {
  backyardLegal: string;
  freeRange: string | null;
  lessonPrices: { intro: string; private: string; packages: string };
  famousOutdoorSpot: string;
}> = {
  'toronto': {
    backyardLegal: 'No - Toronto Municipal Code prohibits the discharge of bows and arrows outside designated facilities.',
    freeRange: 'E.T. Seton Park offers a designated public archery range.',
    lessonPrices: { intro: '$45-$66', private: '$55-$115+', packages: '$175-$420' },
    famousOutdoorSpot: 'the Muskoka region'
  },
  'ottawa': {
    backyardLegal: 'No - Ottawa bylaws prohibit discharging weapons including bows in residential areas.',
    freeRange: null,
    lessonPrices: { intro: '$40-$60', private: '$60-$100', packages: '$150-$350' },
    famousOutdoorSpot: 'Gatineau Park'
  },
  'vancouver': {
    backyardLegal: 'No - Vancouver bylaws prohibit the discharge of projectile weapons in urban areas.',
    freeRange: null,
    lessonPrices: { intro: '$50-$70', private: '$70-$120', packages: '$200-$450' },
    famousOutdoorSpot: 'the Fraser Valley'
  },
  'calgary': {
    backyardLegal: 'No - Calgary Community Standards Bylaw prohibits discharging projectiles in urban areas.',
    freeRange: null,
    lessonPrices: { intro: '$45-$65', private: '$60-$100', packages: '$175-$400' },
    famousOutdoorSpot: 'the Rocky Mountain foothills'
  },
  'edmonton': {
    backyardLegal: 'No - Edmonton bylaws prohibit weapon discharge in residential areas and driveways as they are considered public spaces.',
    freeRange: null,
    lessonPrices: { intro: '$40-$55', private: '$55-$90', packages: '$150-$350' },
    famousOutdoorSpot: 'Elk Island National Park'
  },
  'montreal': {
    backyardLegal: 'No - Montreal municipal regulations prohibit archery in residential areas for safety reasons.',
    freeRange: null,
    lessonPrices: { intro: '$35-$45', private: '$50-$85', packages: '$130-$320' },
    famousOutdoorSpot: 'the Laurentian Mountains'
  },
  'winnipeg': {
    backyardLegal: 'No - Winnipeg Park By-law 85/2009 prohibits bows in parks, and Neighbourhood Liveability By-law restricts archery near residences.',
    freeRange: null,
    lessonPrices: { intro: '$35-$50', private: '$50-$80', packages: '$130-$300' },
    famousOutdoorSpot: 'Whiteshell Provincial Park'
  },
  'mississauga': {
    backyardLegal: 'No - Mississauga bylaws prohibit discharging projectile weapons in residential areas.',
    freeRange: null,
    lessonPrices: { intro: '$45-$60', private: '$55-$100', packages: '$160-$380' },
    famousOutdoorSpot: 'the Halton Hills'
  },
  'hamilton': {
    backyardLegal: 'No - Hamilton bylaws restrict weapon discharge outside designated facilities.',
    freeRange: null,
    lessonPrices: { intro: '$40-$55', private: '$50-$90', packages: '$145-$350' },
    famousOutdoorSpot: 'the Niagara Escarpment'
  },
  'default': {
    backyardLegal: 'In most urban areas of Canada, municipal bylaws prohibit the discharge of weapons—including bows and arrows—outside of designated facilities.',
    freeRange: null,
    lessonPrices: { intro: '$40-$60', private: '$60-$100', packages: '$150-$400' },
    famousOutdoorSpot: 'nearby conservation areas'
  }
};

async function getCityData(provinceSlug: string, citySlug: string): Promise<CityData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cities')
    .select(`
      id,
      name,
      slug,
      provinces!inner (
        id,
        name,
        slug
      )
    `)
    .eq('slug', citySlug)
    .eq('provinces.slug', provinceSlug)
    .single();

  if (error || !data) return null;

  const provincesData = data.provinces as any;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    province: {
      id: provincesData.id,
      name: provincesData.name,
      slug: provincesData.slug,
    },
  };
}

async function getRangesInCity(cityId: string): Promise<Range[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ranges')
    .select('*')
    .eq('city_id', cityId)
    .order('subscription_tier', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching ranges:', error);
    return [];
  }

  // Post-process the data to handle TEXT columns that should be arrays/JSON
  // Import the normalizer at the top of the file, or if not possible, use the inline logic
  const normalizeToArray = (input: any): string[] => {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    if (typeof input === 'string') {
      const trimmed = input.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          return JSON.parse(trimmed);
        } catch {
          return [];
        }
      }
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const inner = trimmed.slice(1, -1);
        if (!inner) return [];
        return inner.split(',').map(item => {
          const t = item.trim();
          return t.startsWith('"') && t.endsWith('"') ? t.slice(1, -1) : t;
        }).filter(Boolean);
      }
      return [trimmed];
    }
    return [];
  };

  return (data as any[]).map(item => ({
    ...item,
    post_images: normalizeToArray(item.post_images),
    post_tags: normalizeToArray(item.post_tags),
    bow_types_allowed: normalizeToArray(item.bow_types_allowed),
    business_hours: typeof item.business_hours === 'string'
      ? (() => {
        try {
          return JSON.parse(item.business_hours);
        } catch (e) {
          return item.business_hours;
        }
      })()
      : item.business_hours
  })) as Range[];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const city = await getCityData(params.province, params.city);

  if (!city) {
    return { title: 'City Not Found | Archery Ranges Canada' };
  }

  const rangeCount = (await getRangesInCity(city.id)).length;
  const countText = rangeCount > 0 ? `${rangeCount} Best` : 'Top';

  return {
    title: `${countText} Archery Ranges in ${city.name}, ${city.province.name} (2025 Guide & Prices)`,
    description: `Find the best archery ranges in ${city.name}. Compare indoor & outdoor clubs, lesson prices, and public ranges. Plus: Is backyard archery legal in ${city.name}? Read our 2025 guide.`,
    openGraph: {
      title: `${countText} Archery Ranges in ${city.name}, ${city.province.name}`,
      description: `Discover archery ranges, lessons, and clubs in ${city.name}. Indoor & outdoor options with pricing.`,
      type: 'website',
    },
    robots: {
      index: rangeCount > 0,
      follow: rangeCount > 0,
    }
  };
}

export default async function CityPage({ params }: PageProps) {
  const city = await getCityData(params.province, params.city);

  if (!city) {
    notFound();
  }

  const ranges = await getRangesInCity(city.id);
  const localInfo = cityLocalInfo[city.slug.toLowerCase()] || cityLocalInfo['default'];

  const featuredRanges = ranges.filter((r) => r.subscription_tier === 'gold' || r.subscription_tier === 'silver');
  const regularRanges = ranges.filter((r) => r.subscription_tier === 'bronze' || r.subscription_tier === 'free' || !r.subscription_tier);

  const indoorCount = ranges.filter((r) => r.facility_type === 'indoor' || r.facility_type === 'both').length;
  const outdoorCount = ranges.filter((r) => r.facility_type === 'outdoor' || r.facility_type === 'both').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      {/* Header */}
      <Header />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ol className="flex items-center gap-1 py-4 text-sm overflow-x-auto">
              <li className="flex items-center">
                <Link href="/" className="flex items-center gap-1.5 text-stone-600 hover:text-emerald-600 transition-colors">
                  <Home className="w-4 h-4" />
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="w-4 h-4 text-stone-400 mx-2" />
                <Link href={`/${params.province}`} className="text-stone-600 hover:text-emerald-600 transition-colors">
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
            <Link href={`/${params.province}`} className="inline-flex items-center gap-2 text-emerald-200 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to {city.province.name}
            </Link>

            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-emerald-300" />
              <span className="text-emerald-200">{city.province.name}, Canada</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">Best Archery Ranges in {city.name}, {city.province.name}</h1>

            <p className="text-xl text-emerald-100 max-w-3xl mb-8">
              Looking for a place to shoot in <strong>{city.name}</strong>? Whether you&apos;re a bowhunter preparing for the season
              or looking for a unique date night idea, {city.name} has a vibrant archery scene. Below is our curated list of the
              top archery clubs, ranges, and pro shops in {city.name}.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                <p className="text-3xl font-bold">{ranges.length}</p>
                <p className="text-sm text-emerald-200">Total Ranges</p>
              </div>
              {indoorCount > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-emerald-300" />
                  <div>
                    <p className="text-3xl font-bold">{indoorCount}</p>
                    <p className="text-sm text-emerald-200">Indoor</p>
                  </div>
                </div>
              )}
              {outdoorCount > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-3">
                  <TreePine className="w-6 h-6 text-emerald-300" />
                  <div>
                    <p className="text-3xl font-bold">{outdoorCount}</p>
                    <p className="text-sm text-emerald-200">Outdoor</p>
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
              <h2 className="text-2xl font-bold text-stone-800 mb-3">No ranges found in {city.name}</h2>
              <p className="text-stone-600 mb-6 max-w-md mx-auto">We don&apos;t have any archery ranges listed in {city.name} yet. Know of one? Help us grow our directory!</p>
              <Link href="/submit-range" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors">
                Submit a Range
              </Link>
            </div>
          ) : (
            <>
              {/* Top Rated Ranges Section */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-stone-800 mb-2">Top Rated Archery Ranges & Clubs in {city.name}</h2>
                <p className="text-stone-600 mb-8">Compare {ranges.length} archery facilities with verified information on pricing, amenities, and lessons.</p>

                {featuredRanges.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">⭐ Featured</span>
                    </div>
                    <div className="space-y-6">
                      {featuredRanges.map((range) => (
                        <RangeCardFeatured key={range.id} range={range} provinceSlug={params.province} citySlug={params.city} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-stone-800">{featuredRanges.length > 0 ? 'All Ranges' : ''}</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-stone-200 text-stone-600 hover:border-stone-300 transition-colors">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(featuredRanges.length > 0 ? regularRanges : ranges).map((range) => (
                    <RangeCard key={range.id} range={range} provinceSlug={params.province} citySlug={params.city} />
                  ))}
                </div>
              </section>

              {/* Local Archery Guide Section */}
              <section className="bg-white rounded-2xl border border-stone-200 p-8 mb-12">
                <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">📍</span>
                  Local Archery Guide: What You Need to Know in {city.name}
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Indoor vs Outdoor Seasons */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      Indoor vs. Outdoor Seasons
                    </h3>
                    <div className="text-stone-600 space-y-2">
                      <p>In {city.province.name}, the outdoor season typically runs from <strong className="text-stone-800">May to October</strong>. During these months, 3D archery courses are very popular in {localInfo.famousOutdoorSpot}.</p>
                      <p><strong className="text-stone-800">Winter Strategy:</strong> From November to April, most archers in {city.name} move indoors.{indoorCount > 0 && ` With ${indoorCount} indoor ${indoorCount === 1 ? 'range' : 'ranges'} available, you can practice year-round.`}</p>
                    </div>
                  </div>

                  {/* Is Backyard Archery Legal */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                      <Scale className="w-5 h-5 text-emerald-600" />
                      Is Backyard Archery Legal in {city.name}?
                    </h3>
                    <div className="text-stone-600 space-y-2">
                      <p><strong className="text-stone-800">Short Answer:</strong> {localInfo.backyardLegal.includes('No') ? 'Generally No.' : 'It Depends.'}</p>
                      <p>{localInfo.backyardLegal}</p>
                      <div className="text-amber-700 bg-amber-50 p-3 rounded-lg text-sm border border-amber-200">
                        ⚠️ <strong>Warning:</strong> Even if you have a large backyard, you could face fines. Always verify with {city.name} bylaw services before setting up a target at home.
                      </div>
                    </div>
                  </div>

                  {/* PAL License */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-emerald-600" />
                      Do I Need a License (PAL) to Buy a Bow?
                    </h3>
                    <div className="text-stone-600 space-y-2">
                      <p><strong className="text-stone-800">No!</strong> You do <strong className="text-stone-800">not</strong> need a Possession and Acquisition Licence (PAL) to buy or own a standard bow or crossbow in Canada.</p>
                      <p className="text-sm text-stone-500 italic">Exception: High-velocity crossbows (over 500mm length) may have restrictions.</p>
                    </div>
                  </div>

                  {/* Free Shooting Options */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      Where Can I Shoot for Free?
                    </h3>
                    <div className="text-stone-600 space-y-2">
                      {localInfo.freeRange ? (
                        <p className="text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">✓ {localInfo.freeRange}</p>
                      ) : (
                        <p>Currently, there are no designated free public archery ranges in {city.name}. Shooting in public parks is illegal. The most affordable option is a &quot;Drop-in&quot; pass at a local range, typically around <strong className="text-stone-800">$20-$25</strong>.</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* FAQ Section */}
              <section className="bg-white rounded-2xl border border-stone-200 p-8 mb-12">
                <h2 className="text-2xl font-bold text-stone-800 mb-6">Frequently Asked Questions</h2>

                <div className="space-y-6">
                  <div className="border-b border-stone-100 pb-6">
                    <h3 className="font-semibold text-stone-800 mb-2">How much do archery lessons cost in {city.name}?</h3>
                    <p className="text-stone-600">Introductory group lessons typically range from <strong>{localInfo.lessonPrices.intro}</strong> per hour and usually include equipment rental. Private coaching ranges from <strong>{localInfo.lessonPrices.private}</strong> per hour. Multi-lesson packages cost <strong>{localInfo.lessonPrices.packages}</strong>.</p>
                  </div>

                  <div className="border-b border-stone-100 pb-6">
                    <h3 className="font-semibold text-stone-800 mb-2">Can I rent a bow in {city.name}?</h3>
                    <p className="text-stone-600">Yes! Almost all indoor ranges in {city.name} offer rental recurve or compound bows. Expect to pay $5-$15 per session for equipment rental.</p>
                  </div>

                  <div className="border-b border-stone-100 pb-6">
                    <h3 className="font-semibold text-stone-800 mb-2">Is archery a good date idea?</h3>
                    <p className="text-stone-600">Absolutely! Archery is low-pressure, competitive, and easy to learn—perfect for couples. Many ranges in {city.name} offer &quot;Date Night&quot; packages with instruction included.</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-stone-800 mb-2">What&apos;s the best age to start archery?</h3>
                    <p className="text-stone-600">Most ranges accept beginners from age 8+, though some offer programs for children as young as 6. Archery is suitable for all ages and fitness levels.</p>
                  </div>
                </div>
              </section>

              {/* CTA Block */}
              <section className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white text-center">
                <h2 className="text-2xl font-bold mb-3">Own an Archery Range in {city.name}?</h2>
                <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">Get listed on Canada&apos;s #1 Archery Directory. Reach thousands of local archers looking for a place to shoot.</p>
                <Link href="/pricing" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors">
                  Add Your Business
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </section>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}