'use client';

import { Phone, Mail, Globe } from 'lucide-react';
import { trackPhoneClick, trackEmailClick, trackWebsiteClick, RangeContext } from '@/lib/analytics';

interface ContactSectionProps {
  phone?: string;
  email?: string;
  website?: string;
  rangeId: string;
  rangeName: string;
}

export function ContactSection({ phone, email, website, rangeId, rangeName }: ContactSectionProps) {
  const rangeContext: RangeContext = {
    range_id: rangeId,
    range_name: rangeName,
  };

  const handlePhoneClick = () => {
    if (phone) {
      trackPhoneClick(rangeContext, phone);
    }
  };

  const handleEmailClick = () => {
    if (email) {
      trackEmailClick(rangeContext, email);
    }
  };

  const handleWebsiteClick = () => {
    if (website) {
      trackWebsiteClick(rangeContext, website);
    }
  };

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
