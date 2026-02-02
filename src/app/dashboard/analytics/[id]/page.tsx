'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Eye, TrendingUp, MousePointer, Calendar, BarChart3, Phone, Mail, Globe, Navigation, MapPin } from 'lucide-react'

interface Range {
    id: string
    name: string
    view_count: number
    click_count: number
    inquiry_count: number
    subscription_tier: string
}

interface AnalyticsEvent {
    id: string
    event_type: string
    created_at: string
    referrer?: string
}

interface DailyStats {
    date: string
    views: number
    clicks: number
}

interface ClickBreakdown {
    phone_clicks: number
    email_clicks: number
    website_clicks: number
    directions_clicks: number
}

export default function AnalyticsPage() {
    const router = useRouter()
    const params = useParams()
    const rangeId = params.id as string
    const supabase = createClient()

    const [range, setRange] = useState<Range | null>(null)
    const [loading, setLoading] = useState(true)
    const [monthlyViews, setMonthlyViews] = useState(0)
    const [clickBreakdown, setClickBreakdown] = useState<ClickBreakdown>({
        phone_clicks: 0,
        email_clicks: 0,
        website_clicks: 0,
        directions_clicks: 0
    })
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
    const [recentEvents, setRecentEvents] = useState<AnalyticsEvent[]>([])

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/auth/login')
                return
            }

            // Fetch range info with stats
            const { data: rangeData } = await supabase
                .from('ranges')
                .select('id, name, view_count, click_count, inquiry_count, subscription_tier')
                .eq('id', rangeId)
                .eq('owner_id', user.id)
                .single()

            if (!rangeData) {
                router.push('/dashboard')
                return
            }

            setRange(rangeData)

            // Fetch analytics events from the last 30 days
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const { data: analyticsData } = await supabase
                .from('range_analytics')
                .select('id, event_type, created_at, referrer')
                .eq('range_id', rangeId)
                .gte('created_at', thirtyDaysAgo.toISOString())
                .order('created_at', { ascending: false })

            if (analyticsData && analyticsData.length > 0) {
                const typedAnalytics = analyticsData as AnalyticsEvent[]

                // Calculate monthly views
                const viewEvents = typedAnalytics.filter(e => e.event_type === 'view')
                setMonthlyViews(viewEvents.length)

                // Calculate click breakdown
                const breakdown: ClickBreakdown = {
                    phone_clicks: typedAnalytics.filter(e => e.event_type === 'phone_click').length,
                    email_clicks: typedAnalytics.filter(e => e.event_type === 'email_click').length,
                    website_clicks: typedAnalytics.filter(e => e.event_type === 'website_click').length,
                    directions_clicks: typedAnalytics.filter(e => e.event_type === 'get_directions_click' || e.event_type === 'apple_maps_click').length
                }
                setClickBreakdown(breakdown)

                // Calculate daily stats for chart
                const dailyMap = new Map<string, { views: number; clicks: number }>()

                // Initialize last 14 days
                for (let i = 13; i >= 0; i--) {
                    const date = new Date()
                    date.setDate(date.getDate() - i)
                    const dateStr = date.toISOString().split('T')[0]
                    dailyMap.set(dateStr, { views: 0, clicks: 0 })
                }

                // Count events by day
                typedAnalytics.forEach(event => {
                    const dateStr = event.created_at.split('T')[0]
                    if (dailyMap.has(dateStr)) {
                        const stats = dailyMap.get(dateStr)!
                        if (event.event_type === 'view') {
                            stats.views++
                        } else {
                            stats.clicks++
                        }
                    }
                })

                const daily = Array.from(dailyMap.entries()).map(([date, stats]) => ({
                    date,
                    views: stats.views,
                    clicks: stats.clicks
                }))
                setDailyStats(daily)

                // Set recent events (last 10)
                setRecentEvents(typedAnalytics.slice(0, 10))
            } else {
                // Initialize empty daily stats for chart
                const daily: DailyStats[] = []
                for (let i = 13; i >= 0; i--) {
                    const date = new Date()
                    date.setDate(date.getDate() - i)
                    daily.push({
                        date: date.toISOString().split('T')[0],
                        views: 0,
                        clicks: 0
                    })
                }
                setDailyStats(daily)
            }

            setLoading(false)
        }

        loadData()
    }, [router, supabase, rangeId])

    const totalClicks = clickBreakdown.phone_clicks + clickBreakdown.email_clicks +
                        clickBreakdown.website_clicks + clickBreakdown.directions_clicks

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const getEventIcon = (eventType: string) => {
        switch (eventType) {
            case 'view': return <Eye className="w-4 h-4 text-blue-500" />
            case 'phone_click': return <Phone className="w-4 h-4 text-emerald-500" />
            case 'email_click': return <Mail className="w-4 h-4 text-blue-500" />
            case 'website_click': return <Globe className="w-4 h-4 text-purple-500" />
            case 'get_directions_click': return <Navigation className="w-4 h-4 text-amber-500" />
            case 'apple_maps_click': return <MapPin className="w-4 h-4 text-red-500" />
            default: return <MousePointer className="w-4 h-4 text-stone-400" />
        }
    }

    const getEventLabel = (eventType: string) => {
        switch (eventType) {
            case 'view': return 'Page View'
            case 'phone_click': return 'Phone Click'
            case 'email_click': return 'Email Click'
            case 'website_click': return 'Website Click'
            case 'get_directions_click': return 'Get Directions'
            case 'apple_maps_click': return 'Apple Maps'
            default: return eventType
        }
    }

    // Find max value for chart scaling
    const maxValue = Math.max(...dailyStats.map(d => Math.max(d.views, d.clicks)), 1)

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-stone-500">Loading...</div>
            </div>
        )
    }

    const isPaidTier = range?.subscription_tier !== 'free'

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Header */}
            <header className="bg-white border-b border-stone-200">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-stone-800">Analytics</h1>
                    <p className="text-stone-600">{range?.name}</p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Stats Overview */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 border border-stone-200">
                        <div className="flex items-center gap-3 mb-2">
                            <Eye className="w-5 h-5 text-blue-500" />
                            <span className="text-sm text-stone-500">Total Views</span>
                        </div>
                        <p className="text-3xl font-bold text-stone-800">
                            {range?.view_count?.toLocaleString() || 0}
                        </p>
                        <p className="text-sm text-stone-400 mt-1">All time</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-stone-200">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            <span className="text-sm text-stone-500">This Month</span>
                        </div>
                        <p className="text-3xl font-bold text-stone-800">
                            {monthlyViews.toLocaleString()}
                        </p>
                        <p className="text-sm text-stone-400 mt-1">Page views (30 days)</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-stone-200">
                        <div className="flex items-center gap-3 mb-2">
                            <MousePointer className="w-5 h-5 text-amber-500" />
                            <span className="text-sm text-stone-500">Clicks</span>
                        </div>
                        <p className="text-3xl font-bold text-stone-800">
                            {totalClicks.toLocaleString()}
                        </p>
                        <p className="text-sm text-stone-400 mt-1">Contact & directions (30 days)</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-stone-200">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-5 h-5 text-purple-500" />
                            <span className="text-sm text-stone-500">Inquiries</span>
                        </div>
                        <p className="text-3xl font-bold text-stone-800">
                            {range?.inquiry_count?.toLocaleString() || 0}
                        </p>
                        <p className="text-sm text-stone-400 mt-1">Contact requests</p>
                    </div>
                </div>

                {/* Click Breakdown */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl border border-stone-200 p-6">
                        <h2 className="text-lg font-semibold text-stone-800 mb-4">Click Breakdown (30 Days)</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-emerald-500" />
                                    <span className="text-stone-600">Phone Clicks</span>
                                </div>
                                <span className="font-semibold text-stone-800">{clickBreakdown.phone_clicks}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-blue-500" />
                                    <span className="text-stone-600">Email Clicks</span>
                                </div>
                                <span className="font-semibold text-stone-800">{clickBreakdown.email_clicks}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-purple-500" />
                                    <span className="text-stone-600">Website Clicks</span>
                                </div>
                                <span className="font-semibold text-stone-800">{clickBreakdown.website_clicks}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Navigation className="w-5 h-5 text-amber-500" />
                                    <span className="text-stone-600">Directions Clicks</span>
                                </div>
                                <span className="font-semibold text-stone-800">{clickBreakdown.directions_clicks}</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl border border-stone-200 p-6">
                        <h2 className="text-lg font-semibold text-stone-800 mb-4">Recent Activity</h2>
                        {recentEvents.length > 0 ? (
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {recentEvents.map((event) => (
                                    <div key={event.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                                        <div className="flex items-center gap-3">
                                            {getEventIcon(event.event_type)}
                                            <span className="text-sm text-stone-600">{getEventLabel(event.event_type)}</span>
                                        </div>
                                        <span className="text-xs text-stone-400">
                                            {new Date(event.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-stone-400">
                                <MousePointer className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No recent activity</p>
                                <p className="text-xs mt-1">Events will appear here as visitors interact with your listing</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Views Over Time Chart */}
                <div className="bg-white rounded-xl border border-stone-200 p-6 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart3 className="w-5 h-5 text-stone-400" />
                        <h2 className="text-lg font-semibold text-stone-800">Views & Clicks (Last 14 Days)</h2>
                    </div>

                    <div className="h-64">
                        {/* Simple bar chart */}
                        <div className="flex items-end justify-between h-48 gap-1 mb-4">
                            {dailyStats.map((day, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                                    <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '100%' }}>
                                        {/* Views bar */}
                                        <div
                                            className="w-full bg-blue-500 rounded-t transition-all"
                                            style={{
                                                height: `${(day.views / maxValue) * 100}%`,
                                                minHeight: day.views > 0 ? '4px' : '0'
                                            }}
                                            title={`Views: ${day.views}`}
                                        />
                                        {/* Clicks bar */}
                                        <div
                                            className="w-full bg-emerald-500 rounded-b transition-all"
                                            style={{
                                                height: `${(day.clicks / maxValue) * 100}%`,
                                                minHeight: day.clicks > 0 ? '4px' : '0'
                                            }}
                                            title={`Clicks: ${day.clicks}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* X-axis labels */}
                        <div className="flex justify-between text-xs text-stone-400">
                            {dailyStats.filter((_, i) => i % 2 === 0).map((day, index) => (
                                <span key={index}>{formatDate(day.date)}</span>
                            ))}
                        </div>
                        {/* Legend */}
                        <div className="flex items-center justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded" />
                                <span className="text-sm text-stone-500">Views</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-emerald-500 rounded" />
                                <span className="text-sm text-stone-500">Clicks</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upgrade CTA - only show for free tier */}
                {!isPaidTier && (
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Unlock Advanced Analytics</h3>
                                <p className="text-blue-100">Upgrade to Pro to track detailed visitor insights and click events</p>
                            </div>
                            <Link
                                href="/pricing"
                                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                Upgrade Now
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
