'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Eye, TrendingUp, MousePointer, Calendar, BarChart3 } from 'lucide-react'

interface Range {
    id: string
    name: string
}

export default function AnalyticsPage() {
    const router = useRouter()
    const params = useParams()
    const rangeId = params.id as string
    const supabase = createClient()

    const [range, setRange] = useState<Range | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/auth/login')
                return
            }

            // Fetch range info
            const { data: rangeData } = await supabase
                .from('ranges')
                .select('id, name')
                .eq('id', rangeId)
                .eq('owner_id', user.id)
                .single()

            if (!rangeData) {
                router.push('/dashboard')
                return
            }

            setRange(rangeData)
            setLoading(false)
        }

        loadData()
    }, [router, supabase, rangeId])

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-stone-500">Loading...</div>
            </div>
        )
    }

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
                        <p className="text-3xl font-bold text-stone-800">--</p>
                        <p className="text-sm text-stone-400 mt-1">All time</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-stone-200">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            <span className="text-sm text-stone-500">This Month</span>
                        </div>
                        <p className="text-3xl font-bold text-stone-800">--</p>
                        <p className="text-sm text-stone-400 mt-1">Page views</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-stone-200">
                        <div className="flex items-center gap-3 mb-2">
                            <MousePointer className="w-5 h-5 text-amber-500" />
                            <span className="text-sm text-stone-500">Clicks</span>
                        </div>
                        <p className="text-3xl font-bold text-stone-800">--</p>
                        <p className="text-sm text-stone-400 mt-1">Website & directions</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-stone-200">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-5 h-5 text-purple-500" />
                            <span className="text-sm text-stone-500">Inquiries</span>
                        </div>
                        <p className="text-3xl font-bold text-stone-800">--</p>
                        <p className="text-sm text-stone-400 mt-1">Contact requests</p>
                    </div>
                </div>

                {/* Chart Placeholder */}
                <div className="bg-white rounded-xl border border-stone-200 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart3 className="w-5 h-5 text-stone-400" />
                        <h2 className="text-lg font-semibold text-stone-800">Views Over Time</h2>
                    </div>

                    <div className="h-64 flex items-center justify-center bg-stone-50 rounded-lg border-2 border-dashed border-stone-200">
                        <div className="text-center">
                            <BarChart3 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                            <p className="text-stone-500 font-medium">Analytics Coming Soon</p>
                            <p className="text-sm text-stone-400 mt-1">
                                Detailed visitor analytics will be available here
                            </p>
                        </div>
                    </div>
                </div>

                {/* Upgrade CTA */}
                <div className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold mb-1">Unlock Advanced Analytics</h3>
                            <p className="text-blue-100">Upgrade to Pro to see detailed visitor insights, demographics, and trends</p>
                        </div>
                        <Link
                            href="/pricing"
                            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            Upgrade Now
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
