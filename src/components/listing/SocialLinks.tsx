'use client';

import { Globe, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

interface SocialLinksProps {
  website?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
}

const normalizeUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

export function SocialLinks({
  website,
  facebook,
  instagram,
  youtube,
  twitter,
}: SocialLinksProps) {
  const socials = [
    { key: 'website', label: 'Website', url: website, icon: Globe },
    { key: 'facebook', label: 'Facebook', url: facebook, icon: Facebook },
    { key: 'instagram', label: 'Instagram', url: instagram, icon: Instagram },
    { key: 'youtube', label: 'YouTube', url: youtube, icon: Youtube },
    { key: 'twitter', label: 'X (Twitter)', url: twitter, icon: Twitter },
  ];

  const activeSocials = socials.filter((s) => s.url);

  if (activeSocials.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">
        Follow Us
      </h3>

      <div className="flex flex-wrap gap-3">
        {activeSocials.map((social) => {
          const Icon = social.icon;
          return (
            <a
              key={social.key}
              href={normalizeUrl(social.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-sm font-medium text-stone-700 transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{social.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
