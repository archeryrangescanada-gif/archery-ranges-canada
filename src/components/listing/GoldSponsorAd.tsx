import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { normalizeToArray } from '@/lib/utils/data-normalization';

interface GoldSponsorAdProps {
    provinceSlug: string;
    currentRangeId: string;
}

export async function GoldSponsorAd({ provinceSlug, currentRangeId }: GoldSponsorAdProps) {
    const supabase = await createClient();

    // Query all gold tier ranges (will filter in memory to easily handle the joins securely)
    const { data: ranges } = await supabase
        .from('ranges')
        .select(`
      id,
      name,
      slug,
      post_images,
      cities!inner (
        name,
        slug,
        provinces!inner (
          name,
          slug
        )
      )
    `)
        .in('subscription_tier', ['gold', 'premium'])
        .neq('id', currentRangeId);

    if (!ranges || ranges.length === 0) return null;

    // Filter for same province
    const provinceRanges = ranges.filter((r: any) => r.cities?.provinces?.slug === provinceSlug);

    if (provinceRanges.length === 0) return null;

    // Pick a random one
    const randomSponsor = provinceRanges[Math.floor(Math.random() * provinceRanges.length)];
    const sponsorImages = normalizeToArray(randomSponsor.post_images);
    const sponsorImage = sponsorImages.length > 0 ? sponsorImages[0] : null;

    return (
        <section className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-2xl shadow-sm border border-yellow-200 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-2">
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-white/60 px-2 py-1 rounded backdrop-blur-sm">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Sponsored
                </span>
            </div>

            {sponsorImage && (
                <div className="h-32 w-full relative">
                    <Image
                        src={sponsorImage}
                        alt={randomSponsor.name}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
            )}

            <div className="p-5">
                <h3 className="font-semibold text-stone-900 mb-1 leading-tight">
                    {randomSponsor.name}
                </h3>
                <p className="text-sm text-stone-600 mb-4 line-clamp-2">
                    Featured Gold archery range located in {(randomSponsor.cities as any)?.name}, {(randomSponsor.cities as any)?.provinces?.name}. Check them out today!
                </p>
                <Link
                    href={`/${(randomSponsor.cities as any)?.provinces?.slug}/${(randomSponsor.cities as any)?.slug}/${randomSponsor.slug}`}
                    className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium text-sm"
                >
                    View Range Profile →
                </Link>
            </div>
        </section>
    );
}
