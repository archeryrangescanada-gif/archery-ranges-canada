// src/app/admin/analytics/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Eye, MousePointerClick, Users, MapPin } from 'lucide-react'

interface AnalyticsData {
  pageViews: {
    total: number
    change: number
    data: { date: string; views: number }[]
  }
  adPerformance: {
    impressions: number
    clicks: number
    ctr: number
    change: number
  }
  topListings: {
    id: string
    name: string
    views: number
    clicks: number
  }[]
  topAds: {
    id: string
    title: string
    impressions: number
    clicks: number
    ctr: number
  }[]
  userActivity: {
    newUsers: number
    activeUsers: number
    change: number
  }
  provinceStats: {
    province: string
    listings: number
    views: number
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
    // TODO: Fetch from Supabase
    setAnalytics({
      pageViews: {
        total: 45623,
        change: 12.5,
        data: [
          { date: '2024-03-04', views: 6234 },
          { date: '2024-03-05', views: 6891 },
          { date: '2024-03-06', views: 5987 },
          { date: '2024-03-07', views: 7123 },
          { date: '2024-03-08', views: 6745 },
          { date: '2024-03-09', views: 7234 },
          { date: '2024-03-10', views: 7409 }
        ]
      },
      adPerformance: {
        impressions: 36789,
        clicks: 1234,
        ctr: 3.36,
        change: 8.2
      },
      topListings: [
        { id: '1', name: 'Toronto Archery Range', views: 5432, clicks: 432 },
        { id: '2', name: 'Vancouver Archery Club', views: 4321, clicks: 387 },
        { id: '3', name: 'Calgary Indoor Range', views: 3987, clicks: 298 },
        { id: '4', name: 'Montreal Archery Center', views: 3654, clicks: 276 },
        { id: '5', name: 'Ottawa Outdoor Range', views: 3211, clicks: 245 }
      ],
      topAds: [
        { id: '1', title: 'Hoyt Archery - Spring Sale', impressions: 15234, clicks: 432, ctr: 2.84 },
        { id: '2', title: 'Mathews Bows - New V3X', impressions: 8945, clicks: 234, ctr: 2.62 },
        { id: '3', title: 'PSE Archery Banner', impressions: 12450, clicks: 189, ctr: 1.52 }
      ],
      userActivity: {
        newUsers: 234,
        activeUsers: 1847,
        change: 15.3
      },
      provinceStats: [
        { province: 'Ontario', listings: 145, views: 18234 },
        { province: 'British Columbia', listings: 98, views: 12456 },
        { province: 'Alberta', listings: 67, views: 8234 },
        { province: 'Quebec', listings: 54, views: 6789 },
        { province: 'Manitoba', listings: 32, views: 3456 }
      ]
    })
    setLoading(false)
  }

  if (loading || !analytics) {
    return <div>Loading...</div>
  }

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
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{analytics.pageViews.change}%</span>
              </div>
            </div>
            <Eye className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ad Impressions</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.adPerformance.impressions.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{analytics.adPerformance.change}%</span>
              </div>
            </div>
            <Eye className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ad Clicks</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.adPerformance.clicks.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">CTR: {analytics.adPerformance.ctr}%</span>
              </div>
            </div>
            <MousePointerClick className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.userActivity.activeUsers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{analytics.userActivity.change}%</span>
              </div>
            </div>
            <Users className="w-10 h-10 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Page Views Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Page Views Trend</h2>
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
                      style={{ width: `${(day.views / 8000) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-16 text-right">
                  {day.views.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Province Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Top Provinces by Views</h2>
          <div className="space-y-3">
            {analytics.provinceStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
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
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Listings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Top Performing Listings</h2>
          <div className="space-y-3">
            {analytics.topListings.map((listing, index) => (
              <div key={listing.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{listing.name}</p>
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
        </div>

        {/* Top Ads */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Top Performing Ads</h2>
          <div className="space-y-3">
            {analytics.topAds.map((ad, index) => (
              <div key={ad.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ad.title}</p>
                    <p className="text-xs text-gray-500">
                      {ad.impressions.toLocaleString()} impressions • CTR: {ad.ctr}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MousePointerClick className="w-4 h-4 mr-1" />
                  {ad.clicks}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}