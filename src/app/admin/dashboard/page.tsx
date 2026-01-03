'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Loader2, ArrowUpRight, ArrowDownRight, Users, MapPin, UserCheck, Megaphone } from 'lucide-react'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    stats: {
      totalListings: 0,
      totalClaims: 0,
      totalAds: 0,
      totalUsers: 0,
      pendingClaims: 0,
      activeAds: 0
    },
    recentUsers: [] as any[],
    recentListings: [] as any[],
    chartData: [] as any[]
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Use real data if available, otherwise fallback to empty or processed in API
  const chartData = data.chartData || []

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="mb-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Live overview of platform performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Listings</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.stats.totalListings}</p>
          <div className="flex items-center mt-2 text-xs text-green-600">
            <span className="font-medium">Live Data</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Pending Claims</h3>
            <div className="p-2 bg-green-50 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.stats.pendingClaims}</p>
          <p className="text-xs text-gray-500 mt-2">Total Claims: {data.stats.totalClaims}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Active Ads</h3>
            <div className="p-2 bg-orange-50 rounded-lg">
              <Megaphone className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.stats.activeAds}</p>
          <p className="text-xs text-gray-500 mt-2">Targeting active campaigns</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.stats.totalUsers}</p>
          <div className="flex items-center mt-2 text-xs text-green-600">
            <span className="font-medium">Registered Accounts</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Activity Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="listings" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="claims" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[300px]">
            {data.recentUsers.map((user, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-gray-900 font-medium">New User Joined</p>
                  <p className="text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {data.recentListings.map((listing, i) => (
              <div key={'l-' + i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 flex-shrink-0" />
                <div>
                  <p className="text-gray-900 font-medium">New Listing Added</p>
                  <p className="text-gray-500">{listing.name} ({listing.city || 'Unknown'})</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(listing.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}

            {data.recentUsers.length === 0 && data.recentListings.length === 0 && (
              <p className="text-gray-500 italic text-center py-4">No recent activity found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}