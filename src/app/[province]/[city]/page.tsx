import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Range } from '@/types/range';
import CityClient from './CityClient';

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
    title: `${countText} Archery Ranges in ${city.name}, ${city.province.name} (${new Date().getFullYear()} Guide & Prices)`,
    description: `Find the best archery ranges in ${city.name}. Compare indoor & outdoor clubs, lesson prices, and public ranges. Plus: Is backyard archery legal in ${city.name}? Read our ${new Date().getFullYear()} guide.`,
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      {/* Header */}
      <Header />

      <CityClient
        city={city}
        provinceSlug={params.province}
        citySlug={params.city}
        ranges={ranges}
        localInfo={localInfo}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}