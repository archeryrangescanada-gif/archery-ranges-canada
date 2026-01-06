import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Building2, TreePine, ImageIcon } from 'lucide-react';
import { Range, getBadgeType, FacilityType } from '@/types/range';
import { SubscriptionBadgeInline } from './SubscriptionBadge';

interface RangeCardProps {
  range: Range;
  provinceSlug: string;
  citySlug: string;
}

const facilityIcons: Record<FacilityType, React.ReactNode> = {
  indoor: <Building2 className="w-3.5 h-3.5" />,
  outdoor: <TreePine className="w-3.5 h-3.5" />,
  both: <Building2 className="w-3.5 h-3.5" />,
};

export function RangeCard({ range, provinceSlug, citySlug }: RangeCardProps) {
  const badgeType = getBadgeType(range.subscription_tier);
  const hasImage = range.post_images && range.post_images.length > 0;
  const imageUrl = hasImage ? range.post_images![0] : null;

  const shortDescription = range.post_content
    ? range.post_content.substring(0, 120) + (range.post_content.length > 120 ? '...' : '')
    : range.description
      ? range.description.substring(0, 120) + (range.description.length > 120 ? '...' : '')
      : null;

  return (
    <Link
      href={`/${provinceSlug}/${citySlug}/${range.slug}`}
      className="group block bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-lg hover:border-stone-300 transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={range.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
            <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
            <span className="text-sm">No photo</span>
          </div>
        )}

        {badgeType && (
          <div className="absolute top-3 left-3 z-10">
            <SubscriptionBadgeInline type={badgeType} />
          </div>
        )}

        {range.facility_type && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
              {facilityIcons[range.facility_type as FacilityType]}
              {range.facility_type === 'both' ? 'Indoor/Outdoor' : range.facility_type.charAt(0).toUpperCase() + range.facility_type.slice(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-stone-800 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">{range.name}</h3>

        <div className="flex items-center gap-1.5 text-stone-500 text-sm mb-3">
          <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="truncate">
            {range.address ? `${range.address}, ` : ''}
            {range.city}, {range.province}
          </span>
        </div>

        {shortDescription && <p className="text-sm text-stone-600 mb-4 line-clamp-2">{shortDescription}</p>}

        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          {range.phone_number && (
            <div className="flex items-center gap-1.5 text-sm text-stone-500">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{range.phone_number}</span>
              <span className="sm:hidden">Call</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {range.has_pro_shop && <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">Pro Shop</span>}
            {range.lessons_available && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Lessons</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Featured/Large Card Variant
export function RangeCardFeatured({ range, provinceSlug, citySlug }: RangeCardProps) {
  const badgeType = getBadgeType(range.subscription_tier);
  const hasImage = range.post_images && range.post_images.length > 0;
  const imageUrl = hasImage ? range.post_images![0] : null;

  return (
    <Link
      href={`/${provinceSlug}/${citySlug}/${range.slug}`}
      className="group block bg-white rounded-2xl shadow-md border border-stone-200 overflow-hidden hover:shadow-xl transition-all duration-300 md:flex"
    >
      {/* Image Section */}
      <div className="relative h-64 md:h-auto md:w-2/5 bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={range.name}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
            <ImageIcon className="w-16 h-16 mb-2 opacity-50" />
            <span className="text-sm">No photo available</span>
          </div>
        )}

        {badgeType && (
          <div className="absolute top-4 left-4 z-10">
            <SubscriptionBadgeInline type={badgeType} />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 md:w-3/5 md:flex md:flex-col md:justify-center">
        {range.facility_type && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-medium w-fit mb-3">
            {facilityIcons[range.facility_type as FacilityType]}
            {range.facility_type === 'both' ? 'Indoor & Outdoor' : range.facility_type.charAt(0).toUpperCase() + range.facility_type.slice(1)} Range
          </span>
        )}

        <h3 className="text-2xl font-bold text-stone-800 mb-2 group-hover:text-emerald-600 transition-colors">{range.name}</h3>

        <div className="flex items-center gap-1.5 text-stone-500 mb-4">
          <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>
            {range.address}, {range.city}, {range.province}
          </span>
        </div>

        {range.post_content && <p className="text-stone-600 mb-4 line-clamp-3">{range.post_content}</p>}

        <div className="flex flex-wrap gap-2 mb-4">
          {range.has_pro_shop && <span className="text-xs px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 font-medium">🏪 Pro Shop</span>}
          {range.has_3d_course && <span className="text-xs px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 font-medium">🎯 3D Course</span>}
          {range.lessons_available && <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-medium">📚 Lessons</span>}
          {range.equipment_rental_available && <span className="text-xs px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 font-medium">🏹 Rentals</span>}
        </div>

        <span className="inline-flex items-center gap-2 text-emerald-600 font-semibold group-hover:gap-3 transition-all">
          View Details
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

// Compact/List Card Variant
export function RangeCardCompact({ range, provinceSlug, citySlug }: RangeCardProps) {
  const badgeType = getBadgeType(range.subscription_tier);

  return (
    <Link
      href={`/${provinceSlug}/${citySlug}/${range.slug}`}
      className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-200 hover:border-emerald-300 hover:shadow-md transition-all"
    >
      {/* Small Image */}
      <div className="relative w-20 h-20 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0">
        {range.post_images?.[0] ? (
          <Image
            src={range.post_images[0]}
            alt={range.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-stone-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-stone-800 truncate group-hover:text-emerald-600 transition-colors">{range.name}</h4>
          {badgeType && <SubscriptionBadgeInline type={badgeType} />}
        </div>

        <div className="flex items-center gap-1 text-sm text-stone-500 mb-1">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">
            {range.city}, {range.province}
          </span>
        </div>

        {range.facility_type && <span className="text-xs text-stone-500 capitalize">{range.facility_type} range</span>}
      </div>

      {/* Arrow */}
      <svg className="w-5 h-5 text-stone-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}