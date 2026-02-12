'use client';

import Link from 'next/link';
import { ArrowRight, Megaphone } from 'lucide-react';
import { trackClaimListingClick, RangeContext } from '@/lib/analytics';

interface ClaimListingBannerProps {
  rangeId?: string;
  rangeName?: string;
}

export function ClaimListingBanner({ rangeId, rangeName }: ClaimListingBannerProps) {
  const href = rangeId
    ? `/dashboard/onboarding?rangeId=${rangeId}`
    : '/dashboard/onboarding';

  const handleClick = () => {
    if (rangeId && rangeName) {
      const rangeContext: RangeContext = {
        range_id: rangeId,
        range_name: rangeName,
      };
      trackClaimListingClick(rangeContext);
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone className="w-6 h-6 text-orange-200" />
            <span className="text-sm font-bold uppercase tracking-wider text-orange-100">Range Owners</span>
          </div>
          <p className="text-orange-100 text-sm md:text-base">
            Already listed? Claim your business to manage your profile. Can&apos;t find your range? Click here to create a new listing and reach more archers.
          </p>
        </div>
        <Link
          href={href}
          onClick={handleClick}
          className="flex-shrink-0 flex items-center gap-2 px-8 py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-colors shadow-sm text-lg"
        >
          CLAIM YOUR LISTING
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
