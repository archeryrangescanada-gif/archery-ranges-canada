'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { ArrowUp, ArrowDown, Users, DollarSign, MousePointer } from 'lucide-react'

export default function AdAnalyticsPage() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalViews: 0,
        avgPrice: 0,
        totalRevenue: 0,
        ctr: 0
    })

    // Mock data generator for demo purposes if DB is empty
    const generateMockData = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        return days.map(day => ({
            name: day,
            views: Math.floor(Math.random() * 5000) + 1000,
            clicks: Math.floor(Math.random() * 200) + 20,
            price: Math.floor(Math.random() * 5) + 10
        }))
    }

    useEffect(() => {
        // Ideally fetch from 'page_analytics' and 'ad_campaigns' tables
        // For now, using mock data to demonstrate the dashboard view
        const mockData = generateMockData()
        setData(mockData)

        setStats({
            totalViews: mockData.reduce((acc, curr) => acc + curr.views, 0),
            avgPrice: mockData.reduce((acc, curr) => acc + curr.price, 0) / mockData.length,
            totalRevenue: mockData.reduce((acc, curr) => acc + (curr.views / 1000 * curr.price), 0),
            ctr: (mockData.reduce((acc, curr) => acc + curr.clicks, 0) / mockData.reduce((acc, curr) => acc + curr.views, 0)) * 100
        })

        setLoading(false)
    }, [])

    if (loading) return <div className="p-8">Loading analytics...</div>

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Ad Performance Analytics</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Total Views (7d)</h3>
                        <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                    <div className="text-xs text-green-500 flex items-center mt-1">
                        <ArrowUp className="w-3 h-3 mr-1" /> +12.5%
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Avg. CPM Price</h3>
                        <DollarSign className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold">${stats.avgPrice.toFixed(2)}</div>
                    <div className="text-xs text-gray-500 mt-1">Dynamic pricing active</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Est. Revenue</h3>
                        <DollarSign className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                    <div className="text-xs text-green-500 flex items-center mt-1">
                        <ArrowUp className="w-3 h-3 mr-1" /> +5.2%
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Avg. CTR</h3>
                        <MousePointer className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold">{stats.ctr.toFixed(2)}%</div>
                    <div className="text-xs text-red-500 flex items-center mt-1">
                        <ArrowDown className="w-3 h-3 mr-1" /> -1.2%
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Dynamic Pricing Trend */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing vs Traffic Trends</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="views" stroke="#3B82F6" name="Page Views" />
                                <Line yAxisId="right" type="monotone" dataKey="price" stroke="#10B981" name="Ad Price ($)" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Clicks & Conversions */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Engagement (Clicks)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="clicks" fill="#8B5CF6" name="Clicks" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
