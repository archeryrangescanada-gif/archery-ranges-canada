'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    ArrowLeft,
    ShieldCheck,
    CheckCircle2,
    FileText,
    Building2
} from 'lucide-react'

export default function VerificationPage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()

    const [range, setRange] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    // Form data
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [emailAddress, setEmailAddress] = useState('')
    const [roleAtRange, setRoleAtRange] = useState('Owner')
    const [certified, setCertified] = useState(false)

    useEffect(() => {
        async function fetchRange() {
            const { data, error } = await supabase
                .from('ranges')
                .select('id, name')
                .eq('id', id)
                .single()

            if (error) {
                console.error('Error fetching range:', error)
                router.push('/dashboard')
                return
            }

            setRange(data)
            setLoading(false)
        }

        fetchRange()
    }, [id, supabase, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!certified) {
            setError('Please certify that you are an authorized representative.')
            return
        }

        setSubmitting(true)
        setError('')

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/auth/login')
                return
            }

            // Create verification request in claims table
            const { error: claimError } = await supabase
                .from('claims')
                .insert({
                    listing_id: id,
                    user_id: user.id,
                    first_name: firstName,
                    last_name: lastName,
                    phone_number: phoneNumber,
                    email_address: emailAddress || user.email,
                    role_at_range: roleAtRange,
                    status: 'pending',
                    submitted_at: new Date().toISOString()
                })

            if (claimError) throw claimError

            // Send notification to admin (Optional but recommended)
            try {
                await fetch('/api/emails/claim-received', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        firstName,
                        rangeName: range?.name,
                        claimId: id // or the returned ID
                    }),
                })
            } catch (err) {
                console.error('Failed to send claim received email:', err)
            }

            setSuccess(true)
        } catch (err: any) {
            console.error('Verification error:', err)
            setError(err.message || 'Failed to submit verification. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="text-stone-600">Loading...</div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-stone-50 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-10 text-center">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-12 h-12 text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-stone-900 mb-2">Verification in Progress</h2>
                        <h3 className="text-xl text-stone-700 mb-6">Application Received</h3>

                        <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                            Thanks, {firstName}! To keep our directory accurate, we manually verify every claim.
                            We will be reaching out to the official contact on file for <strong>{range?.name}</strong> to confirm your role.
                            Expect an update within 2-3 business days.
                        </p>

                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-md"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-stone-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.push('/dashboard/onboarding')}
                        className="p-2 hover:bg-stone-200 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-stone-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-stone-900">Verify Your Identity</h1>
                        <p className="text-stone-600 mt-1">Claiming: {range?.name}</p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
                    <div className="flex items-start gap-4 mb-8 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold text-emerald-900 mb-1">Contact-Based Verification</h3>
                            <p className="text-sm text-emerald-700">
                                Please provide your contact information. We manually verify every claim by contacting the range directly to confirm your relationship.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-stone-900"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-stone-900"
                                    placeholder="Smith"
                                />
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-stone-900"
                                    placeholder="(555) 000-0000"
                                />
                                <p className="mt-1 text-xs text-stone-500 italic">"We will use this to verify your identity with the range."</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                    Preferred Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={emailAddress}
                                    onChange={(e) => setEmailAddress(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-stone-900"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                Your Role at the Range <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={roleAtRange}
                                onChange={(e) => setRoleAtRange(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-stone-900 bg-white"
                            >
                                <option value="Owner">Owner</option>
                                <option value="Manager">Manager</option>
                                <option value="President">President</option>
                                <option value="Board Member">Board Member</option>
                                <option value="Volunteer">Volunteer</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Certification */}
                        <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                            <input
                                type="checkbox"
                                id="certify"
                                checked={certified}
                                onChange={(e) => setCertified(e.target.checked)}
                                className="mt-1 h-5 w-5 text-emerald-600 border-stone-300 rounded focus:ring-emerald-500"
                                required
                            />
                            <label htmlFor="certify" className="text-sm text-stone-700 leading-relaxed">
                                I certify that I am an authorized representative of this range and understand that Archery Ranges Canada will contact the range directly to verify my identity.
                            </label>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard/onboarding')}
                                className="flex-1 px-6 py-3 border border-stone-300 text-stone-700 font-semibold rounded-lg hover:bg-stone-50 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !certified}
                                className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-400 text-white font-semibold rounded-lg transition-colors shadow-sm"
                            >
                                {submitting ? 'Submitting...' : 'Submit Claim'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Box */}
                <div className="mt-6 p-6 bg-stone-100 rounded-2xl border border-stone-200">
                    <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        What happens next?
                    </h4>
                    <ul className="space-y-3 text-sm text-stone-600">
                        <li className="flex gap-2">
                            <span className="font-bold text-stone-400">1.</span>
                            Our admin team receives your claim request and contact details.
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-stone-400">2.</span>
                            We will call or email the range's official contact information to verify your role.
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-stone-400">3.</span>
                            Once confirmed, your account will be upgraded to <strong>Business Owner</strong> status.
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-stone-400">4.</span>
                            You will receive an email notification and full access to manage your listing.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
