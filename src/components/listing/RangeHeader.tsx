import { MapPin, Star, Building2, TreePine, Home } from 'lucide-react';
import { FacilityType } from '@/types/range';

interface RangeHeaderProps {
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  facilityType?: FacilityType | string;
  rating: number | null;
  reviewCount: number;
}

const facilityIcons: Record<FacilityType, React.ReactNode> = {
  indoor: <Building2 className="w-4 h-4" />,
  outdoor: <TreePine className="w-4 h-4" />,
  both: <Home className="w-4 h-4" />,
};

const facilityLabels: Record<FacilityType, string> = {
  indoor: 'Indoor Range',
  outdoor: 'Outdoor Range',
  both: 'Indoor & Outdoor',
};

export function RangeHeader({
  name,
  address,
  city,
  province,
  postalCode,
  facilityType,
  rating,
  reviewCount,
}: RangeHeaderProps) {
  const fullAddress = [address, city, province, postalCode].filter(Boolean).join(', ');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
      {facilityType && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 text-sm font-medium mb-4">
          {facilityIcons[facilityType as FacilityType] || <Building2 className="w-4 h-4" />}
          {facilityLabels[facilityType as FacilityType] || facilityType}
        </div>
      )}

      <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4 tracking-tight leading-tight">
        {name}
      </h1>

      <div className="flex items-start gap-2 text-stone-600 mb-4">
        <MapPin className="w-5 h-5 mt-0.5 text-emerald-500 flex-shrink-0" />
        <address className="not-italic text-base md:text-lg">{fullAddress}</address>
      </div>

      {rating !== null && reviewCount > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-stone-300'
                    }`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-stone-800">{rating.toFixed(1)}</span>
          </div>
          <span className="text-stone-500">
            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      )}

      {(rating === null || reviewCount === 0) && (
        <div className="flex items-center gap-2 text-stone-400">
          <Star className="w-5 h-5" />
          <span className="text-sm">No reviews yet</span>
        </div>
      )}
    </div>
  );
}