'use client'

export const dynamic = 'force-dynamic'

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
    Star,
    Lock,
    Loader2
} from 'lucide-react'
import { canAccessAnalytics, getUserSubscriptionTier, getUpgradeLink, getUpgradeMessage } from '@/lib/subscription-utils'
// Custom interface for dashboard (some fields use different names)
interface Range {
    id: string
    name: string
    slug: string
    address?: string | null
    subscription_tier?: string | null
    owner_id?: string | null
    city?: { name: string; slug: string } | null
    province?: { name: string; slug: string } | null
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
    const [loadingMessage, setLoadingMessage] = useState('Initializing...')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true

        async function loadData() {
            try {
                // 1. Auth Check with Timeout
                setLoadingMessage('Checking authentication...')

                const authPromise = supabase.auth.getUser()
                const authTimeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Authentication check timed out')), 10000)
                )

                const { data: { user }, error: authError } = await Promise.race([
                    authPromise,
                    authTimeout
                ]) as any

                if (!mounted) return

                if (authError || !user) {
                    console.log('Auth check failed or no user, redirecting to login')
                    router.push('/auth/login')
                    return
                }

                setUser(user)

                // 2. Data Fetch with Timeout
                setLoadingMessage('Loading your ranges...')

                const dataPromise = fetch('/api/dashboard/ranges')
                const dataTimeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Data loading timed out')), 15000)
                )

                const response = await Promise.race([
                    dataPromise,
                    dataTimeout
                ]) as Response

                if (!response.ok) {
                    throw new Error(`Failed to fetch ranges: ${response.statusText}`)
                }

                const data = await response.json()

                if (mounted) {
                    setRanges((data.ranges as Range[]) || [])
                    setLoading(false)
                }
            } catch (err: any) {
                console.error('Error loading dashboard:', err)
                if (mounted) {
                    setError(err.message || 'An unexpected error occurred')
                    setLoading(false)
                }
            }
        }

        loadData()

        return () => {
            mounted = false
        }
    }, [router, supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
                    <div className="text-stone-600 font-medium">{loadingMessage}</div>
                    <div className="text-stone-400 text-sm mt-2">This should only take a moment</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200 max-w-md w-full text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogOut className="w-6 h-6 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-stone-800 mb-2">Something went wrong</h2>
                    <p className="text-stone-600 mb-6">{error}</p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
                        >
                            Try Again
                        </button>
                        <Link
                            href="/"
                            className="text-stone-500 hover:text-stone-700 text-sm"
                        >
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Header */}
            <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
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
                                                {(() => {
                                                    const tier = getUserSubscriptionTier(range)
                                                    return (
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${tier === 'gold'
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : tier === 'silver'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : tier === 'bronze'
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : 'bg-stone-100 text-stone-600'
                                                            }`}>
                                                            {tier === 'gold' && <Star className="w-3 h-3" />}
                                                            {tier.charAt(0).toUpperCase() + tier.slice(1)}
                                                        </span>
                                                    )
                                                })()}
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
                                        {canAccessAnalytics(getUserSubscriptionTier(range)) ? (
                                            <Link
                                                href={`/dashboard/analytics/${range.id}`}
                                                className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                                                title="View analytics"
                                            >
                                                <BarChart3 className="w-5 h-5" />
                                            </Link>
                                        ) : (
                                            <>
                                                <div
                                                    className="p-2 text-stone-300 cursor-not-allowed group relative"
                                                    title="Upgrade for Advanced Analytics"
                                                >
                                                    <Lock className="w-4 h-4" />
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-stone-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                                                        Upgrade for Advanced Analytics
                                                    </div>
                                                </div>
                                                <a
                                                    href={getUpgradeLink(getUserSubscriptionTier(range), range.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded shadow-sm transition-colors whitespace-nowrap"
                                                >
                                                    Upgrade
                                                </a>
                                            </>
                                        )}
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

                {/* Upgrade CTA for free/bronze users */}
                {ranges.some(r => {
                    const tier = getUserSubscriptionTier(r);
                    return tier === 'free' || tier === 'bronze';
                }) && (
                        <div className="mt-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">
                                        {getUpgradeMessage(getUserSubscriptionTier(ranges.find(r => {
                                            const tier = getUserSubscriptionTier(r);
                                            return tier === 'free' || tier === 'bronze';
                                        })!))}
                                    </h3>
                                    <p className="text-emerald-50">Get more visibility, add photos, and attract more customers</p>
                                </div>
                                <a
                                    href={getUpgradeLink(getUserSubscriptionTier(ranges.find(r => {
                                        const tier = getUserSubscriptionTier(r);
                                        return tier === 'free' || tier === 'bronze';
                                    })!), ranges.find(r => {
                                        const tier = getUserSubscriptionTier(r);
                                        return tier === 'free' || tier === 'bronze';
                                    })?.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg whitespace-nowrap"
                                >
                                    Upgrade Now
                                </a>
                            </div>
                        </div>
                    )}
            </main>
        </div>
    )
}
