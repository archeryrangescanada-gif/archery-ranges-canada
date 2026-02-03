'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Eye, TrendingUp, MousePointer, Calendar, BarChart3, Phone, Mail, Globe, Navigation, MapPin } from 'lucide-react'

interface Range {
    id: string
    name: string
    slug: string
    city: string
    province: string
    view_count: number
    click_count: number
    inquiry_count: number
    subscription_tier: string
    owner_id: string | null
}

interface AnalyticsEvent {
    id: string
    event_type: string
    created_at: string
    referrer?: string
    ip_hash?: string
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

export default function AdminRangeAnalyticsPage() {
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
    const [dateRange, setDateRange] = useState('30days')

    useEffect(() => {
        if (rangeId) {
            loadData()
        }
    }, [rangeId, dateRange])

    const loadData = async () => {
        setLoading(true)

        try {
            // Fetch range info (admin can view any range)
            const { data: rangeData, error: rangeError } = await supabase
                .from('ranges')
                .select('id, name, slug, city, province, view_count, click_count, inquiry_count, subscription_tier, owner_id')
                .eq('id', rangeId)
                .maybeSingle()

            if (rangeError) {
                console.error('Error fetching range:', rangeError)
                setLoading(false)
                return
            }

            if (!rangeData) {
                console.log('No range data found for ID:', rangeId)
                setLoading(false)
                return
            }

            // Map the data to our expected format
            setRange({
                id: rangeData.id,
                name: rangeData.name,
                slug: rangeData.slug || '',
                city: rangeData.city || '',
                province: rangeData.province || '',
                view_count: rangeData.view_count || 0,
                click_count: rangeData.click_count || 0,
                inquiry_count: rangeData.inquiry_count || 0,
                subscription_tier: rangeData.subscription_tier || 'free',
                owner_id: rangeData.owner_id
            })
        } catch (err) {
            console.error('Exception fetching range:', err)
            setLoading(false)
            return
        }

        // Calculate date range
        const now = new Date()
        let startDate = new Date()
        switch (dateRange) {
            case '7days':
                startDate.setDate(now.getDate() - 7)
                break
            case '30days':
                startDate.setDate(now.getDate() - 30)
                break
            case '90days':
                startDate.setDate(now.getDate() - 90)
                break
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1)
                break
        }

        // Fetch analytics events
        const { data: analyticsData } = await supabase
            .from('range_analytics')
            .select('id, event_type, created_at, referrer, ip_hash')
            .eq('range_id', rangeId)
            .gte('created_at', startDate.toISOString())
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

            // Calculate daily stats for chart (last 14 days)
            const dailyMap = new Map<string, { views: number; clicks: number }>()

            for (let i = 13; i >= 0; i--) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const dateStr = date.toISOString().split('T')[0]
                dailyMap.set(dateStr, { views: 0, clicks: 0 })
            }

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

            // Set recent events (last 20 for admin)
            setRecentEvents(typedAnalytics.slice(0, 20))
        } else {
            // Initialize empty daily stats
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
            setClickBreakdown({
                phone_clicks: 0,
                email_clicks: 0,
                website_clicks: 0,
                directions_clicks: 0
            })
            setMonthlyViews(0)
            setRecentEvents([])
        }

        setLoading(false)
    }

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

    const getTierBadge = (tier: string) => {
        switch (tier) {
            case 'premium': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">Premium</span>
            case 'pro': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Pro</span>
            case 'basic': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Basic</span>
            default: return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">Free</span>
        }
    }

    // Find max value for chart scaling
    const maxValue = Math.max(...dailyStats.map(d => Math.max(d.views, d.clicks)), 1)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading analytics...</div>
            </div>
        )
    }

    if (!range) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Range not found</p>
                <Link href="/admin/listings" className="text-blue-600 hover:underline mt-4 inline-block">
                    Back to Listings
                </Link>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/admin/listings"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Listings
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{range.name}</h1>
                        <p className="text-gray-600 mt-1">{range.city}, {range.province}</p>
                        <div className="flex items-center gap-3 mt-2">
                            {getTierBadge(range.subscription_tier)}
                            {range.owner_id ? (
                                <span className="text-xs text-green-600">✓ Claimed</span>
                            ) : (
                                <span className="text-xs text-gray-400">Unclaimed</span>
                            )}
                        </div>
                    </div>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="year">Last Year</option>
                    </select>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Eye className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-500">Total Views</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {range.view_count?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">All time</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm text-gray-500">Period Views</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {monthlyViews.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Selected period</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <MousePointer className="w-5 h-5 text-amber-500" />
                        <span className="text-sm text-gray-500">Period Clicks</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {totalClicks.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Contact interactions</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-purple-500" />
                        <span className="text-sm text-gray-500">Inquiries</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {range.inquiry_count?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Contact form submissions</p>
                </div>
            </div>

            {/* Click Breakdown & Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Click Breakdown</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-emerald-500" />
                                <span className="text-gray-600">Phone Clicks</span>
                            </div>
                            <span className="font-semibold text-gray-800">{clickBreakdown.phone_clicks}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-blue-500" />
                                <span className="text-gray-600">Email Clicks</span>
                            </div>
                            <span className="font-semibold text-gray-800">{clickBreakdown.email_clicks}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-purple-500" />
                                <span className="text-gray-600">Website Clicks</span>
                            </div>
                            <span className="font-semibold text-gray-800">{clickBreakdown.website_clicks}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Navigation className="w-5 h-5 text-amber-500" />
                                <span className="text-gray-600">Directions Clicks</span>
                            </div>
                            <span className="font-semibold text-gray-800">{clickBreakdown.directions_clicks}</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
                    {recentEvents.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {recentEvents.map((event) => (
                                <div key={event.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-3">
                                        {getEventIcon(event.event_type)}
                                        <div>
                                            <span className="text-sm text-gray-600">{getEventLabel(event.event_type)}</span>
                                            {event.referrer && (
                                                <p className="text-xs text-gray-400 truncate max-w-[200px]">{event.referrer}</p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">
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
                        <div className="text-center py-8 text-gray-400">
                            <MousePointer className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No activity in this period</p>
                            <p className="text-xs mt-1">Events appear as visitors interact with this listing</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Views Over Time Chart */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-800">Views & Clicks (Last 14 Days)</h2>
                </div>

                <div className="h-64">
                    {dailyStats.some(d => d.views > 0 || d.clicks > 0) ? (
                        <>
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
                            <div className="flex justify-between text-xs text-gray-400">
                                {dailyStats.filter((_, i) => i % 2 === 0).map((day, index) => (
                                    <span key={index}>{formatDate(day.date)}</span>
                                ))}
                            </div>
                            {/* Legend */}
                            <div className="flex items-center justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded" />
                                    <span className="text-sm text-gray-500">Views</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-emerald-500 rounded" />
                                    <span className="text-sm text-gray-500">Clicks</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <div className="text-center">
                                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No data for this period</p>
                                <p className="text-xs mt-1">Chart will populate as visitors interact with this listing</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
