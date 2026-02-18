// src/app/admin/analytics/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Eye, MousePointerClick, Users, MapPin, Phone, Mail, Globe, Navigation, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface RangeData {
  id: string
  name: string
  view_count: number | null
  click_count: number | null
  inquiry_count: number | null
}

interface AnalyticsEvent {
  event_type: string
  created_at: string
}

interface SiteEvent {
  event_type: string
  metadata: Record<string, string> | null
  created_at: string
}

interface AnalyticsData {
  pageViews: {
    total: number
    change: number
    data: { date: string; views: number }[]
  }
  clickStats: {
    total: number
    phone: number
    email: number
    website: number
    directions: number
  }
  topListings: {
    id: string
    name: string
    views: number
    clicks: number
  }[]
  userActivity: {
    totalUsers: number
    newUsers: number
    activeListings: number
  }
  provinceStats: {
    province: string
    listings: number
    views: number
  }[]
  categoryStats: {
    name: string
    slug: string
    clicks: number
  }[]
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7days')

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

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

      // 1. Fetch total views from ranges table
      const { data: rangesData } = await supabase
        .from('ranges')
        .select('id, name, view_count, click_count, inquiry_count')
        .order('view_count', { ascending: false })

      const typedRanges = (rangesData || []) as RangeData[]
      const totalViews = typedRanges.reduce((sum, r) => sum + (r.view_count || 0), 0)
      const totalClicks = typedRanges.reduce((sum, r) => sum + (r.click_count || 0), 0)

      // 2. Fetch click breakdown from range_analytics
      const { data: analyticsEvents } = await supabase
        .from('range_analytics')
        .select('event_type, created_at')
        .gte('created_at', startDate.toISOString())

      const typedEvents = (analyticsEvents || []) as AnalyticsEvent[]
      const clickBreakdown = {
        phone: typedEvents.filter(e => e.event_type === 'phone_click').length,
        email: typedEvents.filter(e => e.event_type === 'email_click').length,
        website: typedEvents.filter(e => e.event_type === 'website_click').length,
        directions: typedEvents.filter(e => e.event_type === 'get_directions_click' || e.event_type === 'apple_maps_click').length
      }

      // 3. Calculate daily views for chart (last 7 days)
      const dailyViews: { date: string; views: number }[] = []
      const viewEvents = typedEvents.filter(e => e.event_type === 'view')

      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const dayViews = viewEvents.filter(e => e.created_at.startsWith(dateStr)).length
        dailyViews.push({ date: dateStr, views: dayViews })
      }

      // 4. Fetch Province Stats with listing counts and views
      const { data: provincesData } = await supabase
        .from('provinces')
        .select('id, name, slug')

      const provinceStats = []
      if (provincesData) {
        for (const province of provincesData) {
          const { data: provinceRanges } = await supabase
            .from('ranges')
            .select('id, view_count')
            .eq('province', province.name)

          const listingCount = provinceRanges?.length || 0
          const typedProvinceRanges = (provinceRanges || []) as { id: string; view_count: number | null }[]
          const provinceViews = typedProvinceRanges.reduce((sum, r) => sum + (r.view_count || 0), 0)

          provinceStats.push({
            province: province.name,
            listings: listingCount,
            views: provinceViews
          })
        }
      }

      // Sort provinces by views descending
      provinceStats.sort((a, b) => b.views - a.views)

      // 5. Fetch user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // 6. Get active listings count
      const activeListings = typedRanges.length

      // 7. Top listings by views
      const topListings = typedRanges.slice(0, 5).map(r => ({
        id: r.id,
        name: r.name,
        views: r.view_count || 0,
        clicks: r.click_count || 0
      }))

      // 8. Fetch category click stats from site_analytics
      const { data: siteEvents } = await supabase
        .from('site_analytics')
        .select('event_type, metadata, created_at')
        .eq('event_type', 'category_selected')
        .gte('created_at', startDate.toISOString())

      const typedSiteEvents = (siteEvents || []) as SiteEvent[]
      const categoryCountMap = new Map<string, { name: string; clicks: number }>()
      for (const event of typedSiteEvents) {
        const slug = event.metadata?.category_slug || 'unknown'
        const name = event.metadata?.category_name || slug
        const existing = categoryCountMap.get(slug)
        if (existing) {
          existing.clicks++
        } else {
          categoryCountMap.set(slug, { name, clicks: 1 })
        }
      }
      const categoryStats = Array.from(categoryCountMap.entries())
        .map(([slug, data]) => ({ slug, name: data.name, clicks: data.clicks }))
        .sort((a, b) => b.clicks - a.clicks)

      setAnalytics({
        pageViews: {
          total: totalViews,
          change: 0, // Could calculate by comparing periods
          data: dailyViews
        },
        clickStats: {
          total: clickBreakdown.phone + clickBreakdown.email + clickBreakdown.website + clickBreakdown.directions,
          phone: clickBreakdown.phone,
          email: clickBreakdown.email,
          website: clickBreakdown.website,
          directions: clickBreakdown.directions
        },
        topListings,
        userActivity: {
          totalUsers: userCount || 0,
          newUsers: 0, // Would need created_at tracking
          activeListings
        },
        provinceStats,
        categoryStats
      })
    } catch (err) {
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    )
  }

  // Find max views for chart scaling
  const maxViews = Math.max(...analytics.pageViews.data.map(d => d.views), 1)

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Platform performance and insights</p>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Page Views</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.pageViews.total.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <Eye className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Clicks</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.clickStats.total.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Contact interactions</p>
            </div>
            <MousePointerClick className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Listings</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.userActivity.activeListings.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Published ranges</p>
            </div>
            <MapPin className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Registered Users</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.userActivity.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Business accounts</p>
            </div>
            <Users className="w-10 h-10 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Click Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Click Breakdown</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-500" />
                <span className="text-gray-700">Phone Clicks</span>
              </div>
              <span className="font-semibold text-gray-900">{analytics.clickStats.phone.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700">Email Clicks</span>
              </div>
              <span className="font-semibold text-gray-900">{analytics.clickStats.email.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-purple-500" />
                <span className="text-gray-700">Website Clicks</span>
              </div>
              <span className="font-semibold text-gray-900">{analytics.clickStats.website.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Navigation className="w-5 h-5 text-amber-500" />
                <span className="text-gray-700">Directions Clicks</span>
              </div>
              <span className="font-semibold text-gray-900">{analytics.clickStats.directions.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Page Views Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Page Views (Last 7 Days)</h2>
          {analytics.pageViews.data.some(d => d.views > 0) ? (
            <div className="space-y-2">
              {analytics.pageViews.data.map((day, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-sm text-gray-600 w-24">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-4 relative">
                      <div
                        className="bg-blue-500 rounded-full h-4"
                        style={{ width: `${(day.views / maxViews) * 100}%`, minWidth: day.views > 0 ? '4px' : '0' }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    {day.views.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400">
              <div className="text-center">
                <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No view data yet</p>
                <p className="text-xs mt-1">Views will appear as visitors browse listings</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Clicks */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-yellow-500" />
          Category Clicks
        </h2>
        {analytics.categoryStats.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {analytics.categoryStats.map((cat) => (
              <div key={cat.slug} className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
                <p className="text-2xl font-bold text-yellow-700">{cat.clicks.toLocaleString()}</p>
                <p className="text-sm text-yellow-600 mt-1">{cat.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 text-gray-400">
            <div className="text-center">
              <Tag className="w-6 h-6 mx-auto mb-1 opacity-50" />
              <p className="text-sm">No category clicks yet</p>
            </div>
          </div>
        )}
      </div>

      {/* Province Stats & Top Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Province Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Listings by Province</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analytics.provinceStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center flex-1">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{stat.province}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-gray-500">
                    {stat.listings} listings
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {stat.views.toLocaleString()} views
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Listings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Top Performing Listings</h2>
          {analytics.topListings.length > 0 ? (
            <div className="space-y-3">
              {analytics.topListings.map((listing, index) => (
                <div key={listing.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{listing.name}</p>
                      <p className="text-xs text-gray-500">{listing.clicks} clicks</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Eye className="w-4 h-4 mr-1" />
                    {listing.views.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400">
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No listings yet</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
