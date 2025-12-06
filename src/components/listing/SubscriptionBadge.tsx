import { Award, Star, Crown } from 'lucide-react';

interface SubscriptionBadgeProps {
  type: 'featured' | 'pro' | 'premium';
  size?: 'sm' | 'md' | 'lg';
}

const badgeConfig = {
  featured: {
    icon: Award,
    label: 'Featured',
    bgGradient: 'from-emerald-400 to-emerald-600',
    shadowColor: 'shadow-emerald-500/30',
    iconBg: 'bg-emerald-300/30',
  },
  pro: {
    icon: Star,
    label: 'Pro',
    bgGradient: 'from-amber-400 to-orange-500',
    shadowColor: 'shadow-amber-500/30',
    iconBg: 'bg-amber-300/30',
  },
  premium: {
    icon: Crown,
    label: 'Premium',
    bgGradient: 'from-blue-400 via-blue-500 to-indigo-600',
    shadowColor: 'shadow-blue-500/30',
    iconBg: 'bg-blue-300/30',
  },
};

const sizeConfig = {
  sm: {
    padding: 'px-2.5 py-1',
    iconSize: 'w-3.5 h-3.5',
    fontSize: 'text-xs',
    gap: 'gap-1',
    iconPadding: 'p-0.5',
  },
  md: {
    padding: 'px-3.5 py-1.5',
    iconSize: 'w-4 h-4',
    fontSize: 'text-sm',
    gap: 'gap-1.5',
    iconPadding: 'p-1',
  },
  lg: {
    padding: 'px-4 py-2',
    iconSize: 'w-5 h-5',
    fontSize: 'text-base',
    gap: 'gap-2',
    iconPadding: 'p-1.5',
  },
};

export function SubscriptionBadge({ type, size = 'md' }: SubscriptionBadgeProps) {
  const badge = badgeConfig[type];
  const sizing = sizeConfig[size];
  const Icon = badge.icon;

  return (
    <div
      className={`
        inline-flex items-center ${sizing.gap} ${sizing.padding}
        bg-gradient-to-r ${badge.bgGradient}
        text-white font-semibold ${sizing.fontSize}
        rounded-full shadow-lg ${badge.shadowColor}
        backdrop-blur-sm
      `}
    >
      <span className={`${badge.iconBg} rounded-full ${sizing.iconPadding}`}>
        <Icon className={sizing.iconSize} />
      </span>
      {badge.label}
    </div>
  );
}

export function SubscriptionBadgeInline({ type }: { type: 'featured' | 'pro' | 'premium' }) {
  return <SubscriptionBadge type={type} size="sm" />;
}

export function SubscriptionBadgeHero({ type }: { type: 'featured' | 'pro' | 'premium' }) {
  return <SubscriptionBadge type={type} size="lg" />;
}