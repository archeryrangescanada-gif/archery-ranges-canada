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
    const [gstNumber, setGstNumber] = useState('')
    const [businessLicense, setBusinessLicense] = useState<File | null>(null)
    const [insurance, setInsurance] = useState<File | null>(null)

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
        setSubmitting(true)
        setError('')

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/auth/login')
                return
            }

            // Validate required fields
            if (!firstName || !lastName || !gstNumber || !businessLicense || !insurance) {
                setError('Please fill in all required fields and upload all documents')
                setSubmitting(false)
                return
            }

            // Upload business license
            const licenseExt = businessLicense.name.split('.').pop()
            const licensePath = `${user.id}/${id}/license-${Date.now()}.${licenseExt}`
            const { error: licenseError } = await supabase.storage
                .from('verification-documents')
                .upload(licensePath, businessLicense)

            if (licenseError) {
                console.error('License upload error:', licenseError)
                throw new Error(`Failed to upload business license: ${licenseError.message}`)
            }

            // Upload insurance certificate
            const insuranceExt = insurance.name.split('.').pop()
            const insurancePath = `${user.id}/${id}/insurance-${Date.now()}.${insuranceExt}`
            const { error: insuranceError } = await supabase.storage
                .from('verification-documents')
                .upload(insurancePath, insurance)

            if (insuranceError) {
                console.error('Insurance upload error:', insuranceError)
                throw new Error(`Failed to upload insurance certificate: ${insuranceError.message}`)
            }

            // Create verification request
            const { error: verificationError } = await supabase
                .from('verification_requests')
                .insert({
                    range_id: id,
                    user_id: user.id,
                    first_name: firstName,
                    last_name: lastName,
                    gst_number: gstNumber,
                    business_license_url: licensePath,
                    insurance_certificate_url: insurancePath,
                    status: 'pending',
                    submitted_at: new Date().toISOString()
                })

            if (verificationError) throw verificationError

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
                    <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-10">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-stone-900 mb-4">Verification Submitted!</h2>
                            <p className="text-lg text-stone-600 mb-8">
                                Thank you for submitting your verification documents. Our team will review your claim within 2-3 business days.
                            </p>
                            <p className="text-stone-500 mb-8">
                                You&apos;ll receive an email notification once your claim has been approved or if we need any additional information.
                            </p>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                Return to Dashboard
                            </button>
                        </div>
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
                        <h1 className="text-3xl font-bold text-stone-900">Verify Your Business</h1>
                        <p className="text-stone-600 mt-1">Claiming: {range?.name}</p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
                    <div className="flex items-start gap-4 mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-1">Business Verification Required</h3>
                            <p className="text-sm text-blue-700">
                                To ensure the accuracy of our directory, we need to verify that you are the authorized representative of this archery range.
                                Please provide the following information and documents.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
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

                        {/* GST Number */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                GST Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={gstNumber}
                                onChange={(e) => setGstNumber(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-stone-900"
                                placeholder="123456789RT0001"
                            />
                            <p className="mt-1 text-sm text-stone-500">Your business GST/HST registration number</p>
                        </div>

                        {/* Business License Upload */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                Master Business License <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-stone-300 border-dashed rounded-lg hover:border-emerald-500 transition-colors">
                                <div className="space-y-1 text-center">
                                    <FileText className="mx-auto h-12 w-12 text-stone-400" />
                                    <div className="flex text-sm text-stone-600">
                                        <label
                                            htmlFor="business-license"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none"
                                        >
                                            <span>Upload a file</span>
                                            <input
                                                id="business-license"
                                                name="business-license"
                                                type="file"
                                                className="sr-only"
                                                accept=".pdf,.jpg,.jpeg,.png,.txt"
                                                onChange={(e) => setBusinessLicense(e.target.files?.[0] || null)}
                                                required
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-stone-500">PDF, PNG, JPG up to 10MB</p>
                                    {businessLicense && (
                                        <p className="text-sm text-emerald-600 font-medium mt-2">
                                            ✓ {businessLicense.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Insurance Certificate Upload */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                Certificate of Insurance <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-stone-300 border-dashed rounded-lg hover:border-emerald-500 transition-colors">
                                <div className="space-y-1 text-center">
                                    <Building2 className="mx-auto h-12 w-12 text-stone-400" />
                                    <div className="flex text-sm text-stone-600">
                                        <label
                                            htmlFor="insurance"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none"
                                        >
                                            <span>Upload a file</span>
                                            <input
                                                id="insurance"
                                                name="insurance"
                                                type="file"
                                                className="sr-only"
                                                accept=".pdf,.jpg,.jpeg,.png,.txt"
                                                onChange={(e) => setInsurance(e.target.files?.[0] || null)}
                                                required
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-stone-500">PDF, PNG, JPG up to 10MB</p>
                                    {insurance && (
                                        <p className="text-sm text-emerald-600 font-medium mt-2">
                                            ✓ {insurance.name}
                                        </p>
                                    )}
                                </div>
                            </div>
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
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-400 text-white font-semibold rounded-lg transition-colors"
                            >
                                {submitting ? 'Submitting...' : 'Submit for Verification'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-stone-100 rounded-lg border border-stone-200">
                    <h4 className="font-semibold text-stone-900 mb-2">What happens next?</h4>
                    <ul className="space-y-1 text-sm text-stone-600">
                        <li>• Our team will review your documents within 2-3 business days</li>
                        <li>• You&apos;ll receive an email notification once approved</li>
                        <li>• If approved, you&apos;ll get full access to manage your listing</li>
                        <li>• We may contact you if additional information is needed</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
