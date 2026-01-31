'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Send, Clock, AlertCircle, Loader2, MoreHorizontal, MousePointer2, Mail } from 'lucide-react'
import Link from 'next/link'

interface Campaign {
    id: string
    name: string
    subject: string | null
    status: string
    sent_at: string | null
    created_at: string
    stats: {
        sent: number
        opened: number
        clicked: number
    }
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    const supabase = createClient()

    useEffect(() => {
        async function fetchCampaigns() {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('email_campaigns')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (error) throw error
                setCampaigns(data || [])
            } catch (err) {
                console.error('Error fetching campaigns:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchCampaigns()
    }, [supabase])

    const filteredCampaigns = campaigns.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.subject?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    )

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-stone-900">Campaigns</h1>
                    <p className="text-stone-500 mt-2 font-medium">Create and manage your email outreach</p>
                </div>
                <Link href="/admin/emails/campaigns/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95">
                    <Plus className="w-5 h-5 stroke-[3px]" />
                    New Campaign
                </Link>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar">
                    {['All', 'Drafts', 'Scheduled', 'Sent'].map(status => (
                        <button
                            key={status}
                            className="px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap bg-stone-50 text-stone-600 hover:bg-stone-100 transition-colors"
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="relative w-full lg:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border-2 border-stone-100 rounded-xl focus:border-emerald-500 outline-none font-medium text-stone-800"
                    />
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-stone-400 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    <span className="font-bold">Syncing Campaigns...</span>
                </div>
            ) : filteredCampaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-stone-100 rounded-3xl text-stone-400">
                    <div className="bg-stone-50 p-6 rounded-full mb-4">
                        <Send className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="font-bold text-stone-600">No campaigns found</p>
                    <p className="text-sm mt-1">Start your first email outreach campaign.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredCampaigns.map(campaign => (
                        <div key={campaign.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                {/* Status Icon */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${campaign.status === 'sent' ? 'bg-emerald-50 text-emerald-600' :
                                        campaign.status === 'scheduled' ? 'bg-blue-50 text-blue-600' :
                                            'bg-stone-50 text-stone-400'
                                    }`}>
                                    {campaign.status === 'sent' ? <Send className="w-5 h-5" /> :
                                        campaign.status === 'scheduled' ? <Clock className="w-5 h-5" /> :
                                            <AlertCircle className="w-5 h-5" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-black text-stone-900 truncate">{campaign.name}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${campaign.status === 'sent' ? 'bg-emerald-100 text-emerald-700' :
                                                campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-stone-100 text-stone-500'
                                            }`}>
                                            {campaign.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-stone-500 font-medium truncate italic">
                                        "{campaign.subject || 'No Subject'}"
                                    </p>
                                </div>

                                {/* Stats summary for sent campaigns */}
                                {campaign.status === 'sent' && (
                                    <div className="flex items-center gap-8 px-8 border-l border-r border-stone-100">
                                        <div className="text-center">
                                            <div className="text-sm font-black text-stone-900">{campaign.stats?.sent || 0}</div>
                                            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Sent</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-black text-stone-900">
                                                {campaign.stats?.sent > 0 ? ((campaign.stats.opened / campaign.stats.sent) * 100).toFixed(1) : 0}%
                                            </div>
                                            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Open</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-black text-stone-900">
                                                {campaign.stats?.opened > 0 ? ((campaign.stats.clicked / campaign.stats.opened) * 100).toFixed(1) : 0}%
                                            </div>
                                            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Click</div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                                            {campaign.status === 'sent' ? 'Sent On' : 'Created On'}
                                        </div>
                                        <div className="text-sm font-bold text-stone-700">
                                            {new Date(campaign.status === 'sent' ? (campaign.sent_at || campaign.created_at) : campaign.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <button className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Promo card */}
            <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-100">
                <div className="space-y-2">
                    <h2 className="text-2xl font-black">Ready to scale your outreach?</h2>
                    <p className="text-emerald-50 font-medium">Use AI-powered templates to convert more archers today.</p>
                </div>
                <Link href="/admin/emails/campaigns/new" className="bg-white text-emerald-700 px-8 py-4 rounded-2xl font-black hover:bg-emerald-50 transition-all flex items-center gap-2">
                    <Plus className="w-6 h-6 stroke-[3px]" />
                    Create New Campaign
                </Link>
            </div>
        </div>
    )
}
