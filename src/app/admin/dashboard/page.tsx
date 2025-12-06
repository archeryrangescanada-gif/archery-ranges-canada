'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalListings: 0,
    totalClaims: 0,
    totalAds: 0,
    totalUsers: 0,
    pendingClaims: 0,
    activeAds: 0
  })

  useEffect(() => {
    // Fetch dashboard stats from your API
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const chartData = [
    { month: 'Jan', listings: 40, claims: 24, ads: 24 },
    { month: 'Feb', listings: 30, claims: 13, ads: 22 },
    { month: 'Mar', listings: 20, claims: 98, ads: 29 },
    { month: 'Apr', listings: 27, claims: 39, ads: 20 },
    { month: 'May', listings: 18, claims: 48, ads: 40 },
    { month: 'Jun', listings: 23, claims: 38, ads: 25 }
  ]

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your platform.</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Listings</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalListings}</p>
          <p className="text-gray-600 text-xs mt-2">↑ 2.5% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Claims</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalClaims}</p>
          <p className="text-gray-600 text-xs mt-2">↑ 1.2% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <h3 className="text-gray-500 text-sm font-medium">Active Ads</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeAds}</p>
          <p className="text-gray-600 text-xs mt-2">↑ 0.8% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
          <p className="text-gray-600 text-xs mt-2">↑ 3.1% from last month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Line Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Listings & Claims Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="listings" stroke="#3b82f6" />
              <Line type="monotone" dataKey="claims" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="listings" fill="#3b82f6" />
              <Bar dataKey="ads" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Demo Credentials */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-xs text-blue-900 font-semibold mb-2">Demo Credentials:</h3>
        <p className="text-xs text-blue-800 font-mono">Email: admin@archeryranges.com</p>
        <p className="text-xs text-blue-800 font-mono">Password: password123</p>
        <p className="text-xs text-gray-600 mt-2">© 2024 Archery Ranges Canada. All rights reserved.</p>
      </div>
    </div>
  )
}