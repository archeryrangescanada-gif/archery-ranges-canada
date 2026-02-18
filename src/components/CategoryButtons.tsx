'use client'

import Link from 'next/link'
import {
  GraduationCap, BookOpen, Target, PartyPopper,
  Store, Users
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { trackCategorySelected } from '@/lib/analytics'

const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  BookOpen,
  Target,
  PartyPopper,
  Store,
  Users,
}

const categories = [
  { slug: 'youth-programs', shortName: 'Youth Programs', icon: 'GraduationCap' },
  { slug: 'lessons-coaching', shortName: 'Lessons', icon: 'BookOpen' },
  { slug: '3d-tournaments', shortName: '3D/Tournaments', icon: 'Target' },
  { slug: 'birthday-parties', shortName: 'Birthdays', icon: 'PartyPopper' },
  { slug: 'pro-shop-rental', shortName: 'Pro Shop/Rental', icon: 'Store' },
  { slug: 'womens-programs', shortName: "Women's", icon: 'Users' },
]

interface CategoryButtonsProps {
  variant?: 'hero' | 'section'
}

export function CategoryButtons({ variant = 'section' }: CategoryButtonsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {categories.map((cat) => {
        const IconComponent = iconMap[cat.icon]
        return (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            onClick={() => trackCategorySelected(cat.slug, cat.shortName)}
            className={
              variant === 'hero'
                ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900 hover:bg-yellow-300 transition-colors shadow-sm'
                : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900 hover:bg-yellow-300 transition-colors shadow-sm border border-yellow-500/20'
            }
          >
            {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
            {cat.shortName}
          </Link>
        )
      })}
    </div>
  )
}
