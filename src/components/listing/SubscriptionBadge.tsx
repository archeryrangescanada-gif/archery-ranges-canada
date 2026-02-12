import { Award, Star, Crown } from 'lucide-react';

interface SubscriptionBadgeProps {
  type: 'featured' | 'bronze' | 'silver' | 'gold';
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
  bronze: {
    icon: Award,
    label: 'Bronze',
    bgGradient: 'from-orange-400 to-orange-700',
    shadowColor: 'shadow-orange-500/30',
    iconBg: 'bg-orange-300/30',
  },
  silver: {
    icon: Star,
    label: 'Silver',
    bgGradient: 'from-slate-300 to-slate-500',
    shadowColor: 'shadow-slate-400/30',
    iconBg: 'bg-slate-200/30',
  },
  gold: {
    icon: Crown,
    label: 'Gold',
    bgGradient: 'from-amber-400 via-amber-200 to-amber-600',
    shadowColor: 'shadow-amber-500/30',
    iconBg: 'bg-amber-300/30',
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

export function SubscriptionBadgeInline({ type }: { type: 'featured' | 'bronze' | 'silver' | 'gold' }) {
  return <SubscriptionBadge type={type} size="sm" />;
}

export function SubscriptionBadgeHero({ type }: { type: 'featured' | 'bronze' | 'silver' | 'gold' }) {
  return <SubscriptionBadge type={type} size="lg" />;
}