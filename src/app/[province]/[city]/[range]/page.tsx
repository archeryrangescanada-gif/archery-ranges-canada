import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Range, getTierLimits, getBadgeType, canShowCarousel, canShowVideo } from '@/types/range';
import { GoldSponsorAd } from '@/components/listing/GoldSponsorAd';
import { normalizeToArray } from '@/lib/utils/data-normalization';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RangeClient } from './RangeClient';

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
    post_tags: normalizeToArray(data.post_tags),
    bow_types_allowed: normalizeToArray(data.bow_types_allowed),
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
    title: `${range.name} | ${range.facility_type === 'indoor' ? 'Indoor' : range.facility_type === 'outdoor' ? 'Outdoor' : ''} Archery Range in ${range.city} (${new Date().getFullYear()})`,
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
      <RangeClient
        range={range}
        params={params}
        reviews={reviews}
        events={events}
        isFavorited={isFavorited}
        isOwner={!!user && user.id === range.owner_id}
        tierLimits={tierLimits}
        badgeType={badgeType}
        showCarousel={showCarousel}
        showVideo={showVideo}
        goldSponsorAd={
          <GoldSponsorAd
            provinceSlug={params.province}
            currentRangeId={range.id}
          />
        }
      />
      <Footer />
    </>
  );
}