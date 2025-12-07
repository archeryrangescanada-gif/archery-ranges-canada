'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
    MapPin,
    Eye,
    TrendingUp,
    Settings,
    Plus,
    LogOut,
    ExternalLink,
    BarChart3,
    Star
} from 'lucide-react'

interface Range {
    id: string
    name: string
    slug: string
    address: string
    subscription_tier: string
    city?: { name: string; slug: string }
    province?: { name: string; slug: string }
}

interface User {
    id: string
    email?: string
    user_metadata?: {
        full_name?: string
    }
}

export default function DashboardPage() {
    const router = useRouter()
    const supabase = createClient()

    const [user, setUser] = useState<User | null>(null)
    const [ranges, setRanges] = useState<Range[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/auth/login')
                return
            }

            setUser(user)

            // Fetch user's ranges
            const { data: rangesData } = await supabase
                .from('ranges')
                .select(`
          id, 
          name, 
          slug,
          address, 
          subscription_tier,
          city:cities(name, slug),
          province:provinces(name, slug)
        `)
                .eq('owner_id', user.id)

            setRanges((rangesData as any) || [])
            setLoading(false)
        }

        loadData()
    }, [router, supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-stone-500">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Header */}
            <header className="bg-white border-b border-stone-200">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold text-emerald-600">
                        Archery Ranges Canada
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-stone-600 text-sm">
                            {user?.user_metadata?.full_name || user?.email}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-stone-500 hover:text-stone-700 text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-stone-800">
                        Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}!
                    </h1>
                    <p className="text-stone-600 mt-1">Manage your archery range listings</p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 border border-stone-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-stone-800">{ranges.length}</p>
                                <p className="text-sm text-stone-500">Active Listings</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-stone-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Eye className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-stone-800">--</p>
                                <p className="text-sm text-stone-500">Monthly Views</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-stone-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-stone-800">--</p>
                                <p className="text-sm text-stone-500">Inquiries</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Listings Section */}
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                    <div className="p-6 border-b border-stone-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-stone-800">Your Listings</h2>
                        <Link
                            href="/dashboard/onboarding"
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Listing
                        </Link>
                    </div>

                    {ranges.length === 0 ? (
                        <div className="p-12 text-center">
                            <MapPin className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-stone-700 mb-2">No listings yet</h3>
                            <p className="text-stone-500 mb-6">Create your first listing to start attracting customers</p>
                            <Link
                                href="/dashboard/onboarding"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Add Your First Range
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-200">
                            {ranges.map((range) => (
                                <div key={range.id} className="p-6 flex items-center justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-stone-800">{range.name}</h3>
                                            <p className="text-sm text-stone-500">
                                                {range.address}
                                                {range.city && `, ${range.city.name}`}
                                                {range.province && `, ${range.province.name}`}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${range.subscription_tier === 'premium'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : range.subscription_tier === 'pro'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : range.subscription_tier === 'basic'
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : 'bg-stone-100 text-stone-600'
                                                    }`}>
                                                    {range.subscription_tier === 'premium' && <Star className="w-3 h-3" />}
                                                    {range.subscription_tier?.charAt(0).toUpperCase() + range.subscription_tier?.slice(1) || 'Free'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/${range.province?.slug}/${range.city?.slug}/${range.slug}`}
                                            target="_blank"
                                            className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                                            title="View listing"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </Link>
                                        <Link
                                            href={`/dashboard/analytics/${range.id}`}
                                            className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                                            title="View analytics"
                                        >
                                            <BarChart3 className="w-5 h-5" />
                                        </Link>
                                        <Link
                                            href={`/dashboard/settings/${range.id}`}
                                            className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                                            title="Edit listing"
                                        >
                                            <Settings className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upgrade CTA for free users */}
                {ranges.some(r => !r.subscription_tier || r.subscription_tier === 'free') && (
                    <div className="mt-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Upgrade Your Listing</h3>
                                <p className="text-emerald-100">Get more visibility, add photos, and attract more customers</p>
                            </div>
                            <Link
                                href="/pricing"
                                className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
                            >
                                View Plans
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
