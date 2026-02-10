'use client';

import { Phone, Mail, Globe, Lock } from 'lucide-react';
import { trackPhoneClick, trackEmailClick, trackWebsiteClick, RangeContext } from '@/lib/analytics';
import { SubscriptionTier, getTierLimits } from '@/types/range';
import Link from 'next/link';

interface ContactSectionProps {
  phone?: string;
  email?: string;
  website?: string;
  rangeId: string;
  rangeName: string;
  tier: SubscriptionTier;
}

function maskValue(value: string, type: 'phone' | 'email' | 'website'): string {
  if (type === 'phone') {
    // Show first 6 chars, mask the rest: (905) 55•-••••
    if (value.length <= 6) return value;
    return value.slice(0, 6) + value.slice(6).replace(/\d/g, '•');
  }
  if (type === 'email') {
    // Show first 3 chars + domain: joh•••@example.com
    const atIndex = value.indexOf('@');
    if (atIndex <= 3) return value.slice(0, 1) + '•••' + value.slice(atIndex);
    return value.slice(0, 3) + '•••' + value.slice(atIndex);
  }
  if (type === 'website') {
    // Show domain but mask path
    try {
      const url = new URL(value.startsWith('http') ? value : `https://${value}`);
      return url.hostname;
    } catch {
      return value.slice(0, 10) + '•••';
    }
  }
  return value;
}

export function ContactSection({ phone, email, website, rangeId, rangeName, tier }: ContactSectionProps) {
  const { hasClickableContact } = getTierLimits(tier);

  const rangeContext: RangeContext = {
    range_id: rangeId,
    range_name: rangeName,
  };

  const handlePhoneClick = () => {
    if (phone) trackPhoneClick(rangeContext, phone);
  };

  const handleEmailClick = () => {
    if (email) trackEmailClick(rangeContext, email);
  };

  const handleWebsiteClick = () => {
    if (website) trackWebsiteClick(rangeContext, website);
  };

  // Free tier: show masked contact info with upgrade prompt
  if (!hasClickableContact) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-6 bg-emerald-600">
          <h3 className="text-lg font-semibold text-white">Contact Information</h3>
        </div>
        <div className="p-6 space-y-4">
          {phone && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50 relative">
              <Phone className="w-5 h-5 text-stone-400" />
              <div>
                <p className="text-sm text-stone-500">Phone</p>
                <p className="font-semibold text-stone-400 select-none">{maskValue(phone, 'phone')}</p>
              </div>
              <Lock className="w-4 h-4 text-stone-300 absolute top-3 right-3" />
            </div>
          )}
          {email && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50 relative">
              <Mail className="w-5 h-5 text-stone-400" />
              <div>
                <p className="text-sm text-stone-500">Email</p>
                <p className="font-semibold text-stone-400 select-none">{maskValue(email, 'email')}</p>
              </div>
              <Lock className="w-4 h-4 text-stone-300 absolute top-3 right-3" />
            </div>
          )}
          {website && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50 relative">
              <Globe className="w-5 h-5 text-stone-400" />
              <div>
                <p className="text-sm text-stone-500">Website</p>
                <p className="font-semibold text-stone-400 select-none">{maskValue(website, 'website')}</p>
              </div>
              <Lock className="w-4 h-4 text-stone-300 absolute top-3 right-3" />
            </div>
          )}

          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700 text-center">
              <Lock className="w-3 h-3 inline mr-1 -mt-0.5" />
              Contact details are available when the owner claims this listing.
            </p>
            <Link
              href="/dashboard/onboarding"
              className="block mt-2 text-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Is this your range? Claim it now →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Paid tiers: full clickable contact links
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-6 bg-emerald-600">
        <h3 className="text-lg font-semibold text-white">Contact Information</h3>
      </div>
      <div className="p-6 space-y-4">
        {phone && (
          <a
            href={`tel:${phone.replace(/\D/g, '')}`}
            onClick={handlePhoneClick}
            className="block w-full"
          >
            <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50 hover:bg-emerald-50 transition-colors cursor-pointer group">
              <Phone className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm text-stone-500">Phone</p>
                <p className="font-semibold text-stone-800 group-hover:text-emerald-600 transition-colors">{phone}</p>
              </div>
            </div>
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            onClick={handleEmailClick}
            className="block w-full"
          >
            <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50 hover:bg-blue-50 transition-colors cursor-pointer group">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-stone-500">Email</p>
                <p className="font-semibold text-stone-800 group-hover:text-blue-600 transition-colors">{email}</p>
              </div>
            </div>
          </a>
        )}
        {website && (
          <a
            href={website.startsWith('http') ? website : `https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWebsiteClick}
            className="block w-full"
          >
            <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50 hover:bg-purple-50 transition-colors cursor-pointer group">
              <Globe className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-stone-500">Website</p>
                <p className="font-semibold text-stone-800 group-hover:text-purple-600 transition-colors">{website}</p>
              </div>
            </div>
          </a>
        )}
      </div>
    </div>
  );
}
