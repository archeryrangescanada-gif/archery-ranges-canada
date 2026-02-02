'use client';

import Link from 'next/link';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { trackClaimListingClick, RangeContext } from '@/lib/analytics';

interface UpgradeCTAProps {
  rangeId?: string;
  rangeName?: string;
}

export function UpgradeCTA({ rangeId, rangeName }: UpgradeCTAProps) {
  const handleClaimClick = () => {
    if (rangeId && rangeName) {
      const rangeContext: RangeContext = {
        range_id: rangeId,
        range_name: rangeName,
      };
      trackClaimListingClick(rangeContext);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/20 p-6 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-600/30 rounded-tr-full" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-emerald-200" />
          <span className="text-sm font-semibold text-emerald-100 uppercase tracking-wider">Claim This Listing</span>
        </div>

        <h3 className="text-xl font-bold mb-2">Is this your range?</h3>

        <p className="text-emerald-100 text-sm mb-4">Upgrade your listing to attract more customers and stand out from the competition.</p>

        <ul className="space-y-2 mb-5">
          {['Add photos & videos', 'Edit your description', 'Receive direct inquiries', 'Show in featured results', 'Track visitor analytics'].map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-200 flex-shrink-0" />
              <span className="text-emerald-50">{feature}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/pricing"
          onClick={handleClaimClick}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white hover:bg-stone-50 text-emerald-600 font-semibold rounded-xl transition-colors shadow-sm"
        >
          Claim Your Listing
          <ArrowRight className="w-4 h-4" />
        </Link>

        <p className="text-xs text-emerald-200 text-center mt-3">Starting at just $49/month</p>
      </div>
    </div>
  );
}

export function UpgradeCTAInline() {
  return (
    <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="font-semibold text-emerald-800">Own this range?</p>
          <p className="text-sm text-emerald-600">Claim & upgrade your listing</p>
        </div>
      </div>

      <Link href="/pricing" className="flex-shrink-0 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors text-sm">
        Claim Now
      </Link>
    </div>
  );
}