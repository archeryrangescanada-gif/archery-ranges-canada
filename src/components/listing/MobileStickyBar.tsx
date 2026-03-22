'use client';

import { Phone, Navigation } from 'lucide-react';
import { trackGetDirectionsClick } from '@/lib/analytics';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface MobileStickyBarProps {
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  rangeId: string;
  rangeName: string;
}

/**
 * Sticky bottom bar shown only on mobile screens.
 * Provides one-tap access to the two most important actions:
 * calling the range and getting directions.
 */
export function MobileStickyBar({
  phone,
  latitude,
  longitude,
  address,
  rangeId,
  rangeName,
}: MobileStickyBarProps) {
  const { t } = useLanguage();

  const hasActions = phone || address || (latitude && longitude);
  if (!hasActions) return null;

  // Use ONLY the street address — business name can match the wrong location
  const directionsUrl = address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
    : latitude && longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      : null;

  const handleDirections = () => {
    if (latitude && longitude) {
      trackGetDirectionsClick({ range_id: rangeId, range_name: rangeName });
    }
  };

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex gap-2 p-3">
        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm active:bg-emerald-700 transition-colors"
          >
            <Phone className="w-4 h-4" />
            {t('rangePage.call') || 'Call'}
          </a>
        )}
        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDirections}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-colors ${
              phone
                ? 'bg-stone-100 text-stone-700 active:bg-stone-200'
                : 'flex-1 bg-emerald-600 text-white active:bg-emerald-700'
            }`}
          >
            <Navigation className="w-4 h-4" />
            {phone ? (t('rangePage.directions') || 'Directions') : (t('rangePage.getDirections') || 'Get Directions')}
          </a>
        )}
      </div>
    </div>
  );
}
