'use client';

import { Phone, Mail, Globe } from 'lucide-react';

interface ContactSectionProps {
  phone?: string;
  email?: string;
  website?: string;
  rangeId: string;
}

export function ContactSection({ phone, email, website, rangeId }: ContactSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-6 bg-emerald-600">
        <h3 className="text-lg font-semibold text-white">Contact Information</h3>
      </div>
      <div className="p-6 space-y-4">
        {phone && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50">
            <Phone className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm text-stone-500">Phone</p>
              <p className="font-semibold text-stone-800">{phone}</p>
            </div>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50">
            <Mail className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-stone-500">Email</p>
              <p className="font-semibold text-stone-800">{email}</p>
            </div>
          </div>
        )}
        {website && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50">
            <Globe className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-stone-500">Website</p>
              <p className="font-semibold text-stone-800">{website}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}