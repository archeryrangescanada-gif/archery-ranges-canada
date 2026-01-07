'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function SubscribeSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  
  const sessionId = searchParams.get('session_id')
  const rangeId = searchParams.get('range')
  
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<{ id: string; name: string; slug: string } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function verifyAndUpdate() {
      if (!sessionId || !rangeId) {
        setError('Missing session information')
        setLoading(false)
        return
      }

      try {
        // Verify the session and update subscription
        const response = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, rangeId }),
        })

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        // Get range details
        const { data: rangeData } = await supabase
          .from('ranges')
          .select('id, name, slug')
          .eq('id', rangeId)
          .single()

        if (rangeData) {
          setRange(rangeData)
        }
      } catch (err: any) {
        console.error('Verification error:', err)
        setError(err.message || 'Failed to verify subscription')
      } finally {
        setLoading(false)
      }
    }

    verifyAndUpdate()
  }, [sessionId, rangeId])

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-600">Verifying your subscription...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-stone-800 mb-4">Something went wrong</h1>
          <p className="text-stone-600 mb-6">{error}</p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 max-w-lg text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-stone-800 mb-2">
          Subscription Activated!
        </h1>
        
        <p className="text-stone-600 mb-8">
          {range 
            ? `"${range.name}" has been upgraded successfully. Your premium features are now active.`
            : 'Your subscription has been activated successfully.'
          }
        </p>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          {range && (
            <Link
              href={`/dashboard/ranges/${range.id}/edit`}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium rounded-lg transition-colors"
            >
              Edit Your Listing
            </Link>
          )}
        </div>

        <div className="mt-8 p-4 bg-stone-50 rounded-lg">
          <p className="text-sm text-stone-600">
            <strong>What&apos;s next?</strong> Add photos, update your hours, and complete your listing to attract more customers.
          </p>
        </div>
      </div>
    </div>
  )
}