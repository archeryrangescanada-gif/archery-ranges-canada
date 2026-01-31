'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowUpRight, ArrowDownRight, Users, Mail, MousePointer2, ExternalLink, RefreshCw, Smartphone, Monitor, Loader2, CheckCircle2, Clock } from 'lucide-react'

interface CampaignStats {
    sent: number
    delivered: number
    opened: number
    clicked: number
}

interface Campaign {
    id: string
    name: string
    subject: string | null
    status: string
    sent_at: string | null
    stats: CampaignStats
}

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true)
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [totals, setTotals] = useState({
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        openRate: 0,
        clickRate: 0
    })

    const supabase = createClient()

    useEffect(() => {
        async function fetchAnalytics() {
            setLoading(true)
            try {
                // Fetch recent campaigns
                const { data: campaignData, error: campaignError } = await supabase
                    .from('email_campaigns')
                    .select('*')
                    .order('sent_at', { ascending: false, nullsFirst: false })
                    .limit(10)

                if (campaignError) throw campaignError

                const fetchedCampaigns = campaignData || []
                setCampaigns(fetchedCampaigns)

                // Calculate totals
                const totalStats = fetchedCampaigns.reduce((acc: CampaignStats, c: Campaign) => ({
                    sent: acc.sent + (c.stats?.sent || 0),
                    delivered: acc.delivered + (c.stats?.delivered || 0),
                    opened: acc.opened + (c.stats?.opened || 0),
                    clicked: acc.clicked + (c.stats?.clicked || 0)
                }), { sent: 0, delivered: 0, opened: 0, clicked: 0 })

                const openRate = totalStats.delivered > 0 ? (totalStats.opened / totalStats.delivered) * 100 : 0
                const clickRate = totalStats.opened > 0 ? (totalStats.clicked / totalStats.opened) * 100 : 0

                setTotals({
                    ...totalStats,
                    openRate,
                    clickRate
                })

            } catch (err) {
                console.error('Error fetching analytics:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
    }, [supabase])

    const stats = [
        { label: 'Total Sent', value: totals.sent.toLocaleString(), change: '+0%', trend: 'up' },
        { label: 'Delivery Rate', value: totals.sent > 0 ? ((totals.delivered / totals.sent) * 100).toFixed(1) + '%' : '0%', change: '+0%', trend: 'up' },
        { label: 'Open Rate', value: totals.openRate.toFixed(1) + '%', change: '+0%', trend: 'up' },
        { label: 'Click Rate', value: totals.clickRate.toFixed(1) + '%', change: '+0%', trend: 'up' },
    ]

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                    <p className="text-stone-500 font-bold">Loading analytics...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-stone-900">Analytics</h1>
                    <p className="text-stone-500 mt-2 font-medium">Performance insights across all campaigns</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="p-3 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors shadow-sm"
                >
                    <RefreshCw className="w-5 h-5 text-stone-600" />
                </button>
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{stat.label}</h3>
                        <div className="flex items-end justify-between">
                            <span className="text-3xl font-black text-stone-900">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Campaigns Historical Data */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold text-stone-900">Campaign Performance</h2>
                        <span className="text-xs font-bold text-stone-400 uppercase">Recent Activity</span>
                    </div>

                    {campaigns.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-stone-100 rounded-xl text-stone-300">
                            <Mail className="w-12 h-12 mb-2 opacity-50" />
                            <p className="font-bold">No campaign data available yet</p>
                        </div>
                    ) : (
                        <div className="h-64 flex items-end justify-between gap-4 px-4">
                            {campaigns.slice(0, 7).reverse().map((c, i) => {
                                const rate = c.stats?.delivered > 0 ? (c.stats.opened / c.stats.delivered) * 100 : 0
                                return (
                                    <div key={i} className="flex-1 bg-emerald-50 rounded-t-xl relative group">
                                        <div
                                            style={{ height: `${Math.max(rate, 5)}%` }}
                                            className="bg-emerald-500 w-full rounded-t-xl absolute bottom-0 transition-all hover:bg-emerald-600"
                                        ></div>
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] whitespace-nowrap font-bold px-2 py-1 rounded pointer-events-none transition-opacity z-10">
                                            {c.name}<br />{rate.toFixed(1)}% Open Rate
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    <div className="flex justify-between mt-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        <span>Older</span>
                        <span>Latest</span>
                    </div>
                </div>

                {/* Breakdown Stats */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Device Usage</h3>
                        <div className="space-y-4">
                            <p className="text-xs text-stone-400 italic">Aggregated data will appear here once campaign tracking is live.</p>
                            <div>
                                <div className="flex justify-between text-sm font-bold text-stone-700 mb-1">
                                    <span className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-stone-400" /> Mobile</span>
                                    <span>--%</span>
                                </div>
                                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-0"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Quick Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-stone-50 rounded-xl">
                                <div className="text-2xl font-black text-stone-900">{totals.opened}</div>
                                <div className="text-[10px] font-bold text-stone-500 uppercase">Total Opens</div>
                            </div>
                            <div className="p-3 bg-stone-50 rounded-xl">
                                <div className="text-2xl font-black text-stone-900">{totals.clicked}</div>
                                <div className="text-[10px] font-bold text-stone-500 uppercase">Total Clicks</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Campaigns Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-stone-900">Recent Campaigns</h2>
                </div>
                <table className="w-full">
                    <thead className="bg-stone-50 text-stone-400 text-[10px] font-bold uppercase tracking-widest text-left">
                        <tr>
                            <th className="px-6 py-4">Campaign Name</th>
                            <th className="px-6 py-4">Sent Date</th>
                            <th className="px-6 py-4">Open Rate</th>
                            <th className="px-6 py-4">Click Rate</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {campaigns.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-stone-400 font-medium">
                                    No campaigns found.
                                </td>
                            </tr>
                        ) : (
                            campaigns.map((c) => (
                                <tr key={c.id} className="hover:bg-stone-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-stone-800">{c.name}</td>
                                    <td className="px-6 py-4 text-sm text-stone-500">
                                        {c.sent_at ? new Date(c.sent_at).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-stone-700">
                                                {c.stats?.delivered > 0 ? ((c.stats.opened / c.stats.delivered) * 100).toFixed(1) + '%' : '0%'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-stone-700">
                                                {c.stats?.opened > 0 ? ((c.stats.clicked / c.stats.opened) * 100).toFixed(1) + '%' : '0%'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${c.status === 'sent' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'
                                            }`}>
                                            {c.status === 'sent' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {c.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
