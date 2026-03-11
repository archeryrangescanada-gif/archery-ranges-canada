import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CATEGORIES } from '@/lib/categories'
import {
  GraduationCap, BookOpen, Target, PartyPopper,
  Store, Users, Home, ChevronRight
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  GraduationCap, BookOpen, Target, PartyPopper, Store, Users,
}

export const metadata: Metadata = {
  title: 'Browse by Category | Archery Ranges Canada',
  description: 'Find archery ranges by program type: youth programs, lessons, 3D tournaments, birthday parties, pro shops, and more across Canada.',
}

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-stone-500">
            <Link href="/" className="hover:text-emerald-600 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-stone-800 font-medium">Categories</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Browse by Category
          </h1>
          <p className="text-xl text-yellow-100 max-w-2xl mx-auto">
            Find archery ranges by program type or facility feature
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((category) => {
            const IconComponent = iconMap[category.icon]
            return (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group bg-white rounded-xl border border-stone-200 p-6 hover:shadow-lg hover:border-yellow-400 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  {IconComponent && (
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-yellow-700" />
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-stone-800 group-hover:text-yellow-700 transition-colors">
                    {category.name}
                  </h2>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {category.description}
                </p>
                <p className="mt-3 text-yellow-600 font-medium text-sm group-hover:underline">
                  Browse ranges &rarr;
                </p>
              </Link>
            )
          })}
        </div>
      </main>

      <Footer />
    </div>
  )
}
