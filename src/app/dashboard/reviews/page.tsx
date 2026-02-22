'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Header from '@/components/Header'
import {
    ArrowLeft,
    Star,
    MessageSquare,
    Send,
    Lock,
    Loader2
} from 'lucide-react'
import { getUserSubscriptionTier, getUpgradeLink } from '@/lib/subscription-utils'
import { normalizeTier, RangeReview } from '@/types/range'

interface Range {
    id: string
    name: string
    subscription_tier?: string | null
}

export default function ReviewsPage() {
    const router = useRouter()
    const supabase = createClient()

    const [ranges, setRanges] = useState<Range[]>([])
    const [reviews, setReviews] = useState<RangeReview[]>([])
    const [loading, setLoading] = useState(true)
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyText, setReplyText] = useState('')
    const [submittingReply, setSubmittingReply] = useState(false)

    useEffect(() => {
        let mounted = true

        async function loadData() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/auth/login')
                    return
                }

                // Fetch ranges owned by this user
                const data = await fetch('/api/dashboard/ranges').then(r => r.json())
                const fetchedRanges = data.ranges || []

                // Fetch all reviews for these ranges
                let fetchedReviews: RangeReview[] = []
                if (fetchedRanges.length > 0) {
                    const rangeIds = fetchedRanges.map((r: Range) => r.id)
                    const { data: revData } = await supabase
                        .from('reviews')
                        .select('*')
                        .in('listing_id', rangeIds)
                        .order('created_at', { ascending: false })

                    if (revData) {
                        fetchedReviews = revData as unknown as RangeReview[]
                    }
                }

                if (mounted) {
                    setRanges(fetchedRanges)
                    setReviews(fetchedReviews)
                    setLoading(false)
                }
            } catch (err: any) {
                console.error('Error loading reviews:', err)
                if (mounted) setLoading(false)
            }
        }

        loadData()

        return () => {
            mounted = false
        }
    }, [router, supabase])

    const handleReplySubmit = async (reviewId: string) => {
        if (!replyText.trim()) return

        setSubmittingReply(true)
        try {
            const { error } = await supabase
                .from('reviews')
                .update({
                    owner_reply: replyText.trim(),
                    owner_reply_created_at: new Date().toISOString()
                })
                .eq('id', reviewId)

            if (error) throw error

            // Update local state
            setReviews(reviews.map(r =>
                r.id === reviewId
                    ? { ...r, owner_reply: replyText.trim(), owner_reply_created_at: new Date().toISOString() }
                    : r
            ))

            setReplyingTo(null)
            setReplyText('')
        } catch (err) {
            console.error('Error submitting reply:', err)
            alert('Failed to submit reply. Please try again.')
        } finally {
            setSubmittingReply(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-stone-50">
            <Header />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 -ml-2 text-stone-400 hover:text-stone-600 transition-colors rounded-lg hover:bg-stone-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-stone-800">Review Management</h1>
                        <p className="text-stone-600 mt-1">Engage with your customers by replying to reviews</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                    {reviews.length === 0 ? (
                        <div className="p-12 text-center">
                            <MessageSquare className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-stone-700 mb-2">No reviews yet</h3>
                            <p className="text-stone-500">Reviews for your ranges will appear here.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-200">
                            {reviews.map((review: any) => {
                                const range = ranges.find(r => r.id === review.listing_id)
                                const tier = range ? getUserSubscriptionTier(range) : 'free'
                                const canReply = normalizeTier(tier) === 'silver' || normalizeTier(tier) === 'gold'

                                return (
                                    <div key={review.id} className="p-6">
                                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                                        {range?.name || 'Unknown Range'}
                                                    </span>
                                                    <span className="text-stone-300">•</span>
                                                    <span className="text-sm font-medium text-stone-800">
                                                        {review.reviewer_name || 'Anonymous'}
                                                    </span>
                                                    <span className="text-stone-300">•</span>
                                                    <span className="text-sm text-stone-500">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-0.5 text-amber-400 mt-2 text-sm">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-stone-200'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-stone-700 leading-relaxed mb-4">
                                            {review.comment}
                                        </p>

                                        {/* Owner Reply Section */}
                                        {review.owner_reply ? (
                                            <div className="mt-4 bg-stone-50 rounded-lg p-4 border border-stone-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                                        Owner Response
                                                    </span>
                                                    {review.owner_reply_created_at && (
                                                        <span className="text-xs text-stone-500">
                                                            {new Date(review.owner_reply_created_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-stone-600">{review.owner_reply}</p>
                                            </div>
                                        ) : (
                                            <div className="mt-4">
                                                {replyingTo === review.id ? (
                                                    <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                                                        <textarea
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            placeholder="Write your response..."
                                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none mb-3 text-stone-900 bg-white"
                                                            rows={3}
                                                            autoFocus
                                                        />
                                                        <div className="flex items-center gap-2 justify-end">
                                                            <button
                                                                onClick={() => {
                                                                    setReplyingTo(null)
                                                                    setReplyText('')
                                                                }}
                                                                className="px-4 py-2 text-sm text-stone-600 hover:text-stone-800 font-medium transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleReplySubmit(review.id)}
                                                                disabled={submittingReply || !replyText.trim()}
                                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-300 text-white text-sm font-medium rounded-lg transition-colors"
                                                            >
                                                                {submittingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                                Post Reply
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    canReply ? (
                                                        <button
                                                            onClick={() => {
                                                                setReplyingTo(review.id)
                                                                setReplyText('')
                                                            }}
                                                            className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                                                        >
                                                            <MessageSquare className="w-4 h-4" />
                                                            Reply to Review
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center justify-between bg-stone-50 px-4 py-3 rounded-lg border border-stone-200">
                                                            <div className="flex items-center gap-2 text-sm text-stone-600">
                                                                <Lock className="w-4 h-4 text-stone-400" />
                                                                Replying is available on Silver and Gold tiers.
                                                            </div>
                                                            <a
                                                                href={getUpgradeLink(tier, range?.id)}
                                                                target="_blank"
                                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                                                            >
                                                                Upgrade Now
                                                            </a>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
