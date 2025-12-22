'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    Camera,
    Facebook,
    Phone,
    ChevronRight,
    CheckCircle2,
    Upload,
    ArrowLeft,
    ShieldCheck,
    Star,
    Zap,
    MessageSquare
} from 'lucide-react'
import Link from 'next/link'

export default function VerificationPage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()

    const [range, setRange] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [step, setStep] = useState<'choose' | 'social' | 'photo' | 'call' | 'success'>('choose')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

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

    const handleSocialSubmit = async () => {
        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { error } = await supabase
                .from('verification_requests')
                .insert({
                    range_id: id,
                    user_id: user?.id,
                    method: 'social',
                    verification_code: `ARC-${id?.toString().substring(0, 4).toUpperCase()}`,
                    status: 'pending'
                })
            if (error) throw error
            setStep('success')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleCallRequest = async () => {
        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { error } = await supabase
                .from('verification_requests')
                .insert({
                    range_id: id,
                    user_id: user?.id,
                    method: 'call',
                    status: 'pending'
                })
            if (error) throw error
            setStep('success')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            // Upload to storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${user?.id}/${Date.now()}.${fileExt}`
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('verification-proofs')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { error } = await supabase
                .from('verification_requests')
                .insert({
                    range_id: id,
                    user_id: user?.id,
                    method: 'photo',
                    proof_image_url: uploadData.path,
                    status: 'pending'
                })
            if (error) throw error
            setStep('success')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-stone-50">Loading...</div>

    return (
        <div className="min-h-screen bg-stone-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => step === 'choose' ? router.push('/dashboard') : setStep('choose')} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-stone-600" />
                    </button>
                    <h1 className="text-3xl font-extrabold text-stone-900">Prove you own this range</h1>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border-4 border-emerald-500 overflow-hidden">

                    {/* Main Content Area */}
                    <div className="p-10">
                        {step === 'choose' && (
                            <div className="space-y-8">
                                <div className="text-center mb-10">
                                    <ShieldCheck className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                                    <p className="text-xl text-stone-600">To keep our data accurate, we need to verify that you are the real owner of <strong>{range?.name}</strong>.</p>
                                </div>

                                <div className="grid gap-6">
                                    {/* Option 2: Photo Upload (Primary) */}
                                    <button
                                        onClick={() => setStep('photo')}
                                        className="flex items-center gap-6 p-8 bg-emerald-50 hover:bg-emerald-100 border-4 border-emerald-500 rounded-2xl text-left transition-all transform hover:scale-[1.02]"
                                    >
                                        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Camera className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-emerald-900">Fastest: Upload a Photo</h2>
                                            <p className="text-emerald-700 text-lg">Send a picture of your signage, business license, or insurance document.</p>
                                        </div>
                                        <ChevronRight className="w-8 h-8 text-emerald-500 ml-auto" />
                                    </button>

                                    {/* Option 1: Social Media */}
                                    <button
                                        onClick={() => setStep('social')}
                                        className="flex items-center gap-6 p-8 bg-blue-50 hover:bg-blue-100 border-4 border-blue-400 rounded-2xl text-left transition-all transform hover:scale-[1.02]"
                                    >
                                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Facebook className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-blue-900">Facebook Message</h2>
                                            <p className="text-blue-700 text-lg">Send us a message from your official page to verify instantly.</p>
                                        </div>
                                        <ChevronRight className="w-8 h-8 text-blue-400 ml-auto" />
                                    </button>

                                    {/* Option 3: Phone/Call Request */}
                                    <button
                                        onClick={() => setStep('call')}
                                        className="flex items-center gap-6 p-8 bg-amber-50 hover:bg-amber-100 border-4 border-amber-400 rounded-2xl text-left transition-all transform hover:scale-[1.02]"
                                    >
                                        <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-amber-900">Request a Call</h2>
                                            <p className="text-amber-700 text-lg">If you can't upload a photo, we'll give you a call at the range number.</p>
                                        </div>
                                        <ChevronRight className="w-8 h-8 text-amber-400 ml-auto" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'social' && (
                            <div className="space-y-8 py-4">
                                <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-200">
                                    <h3 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                                        <Facebook className="w-6 h-6" /> Instructions
                                    </h3>
                                    <ol className="list-decimal list-inside space-y-4 text-lg text-blue-800">
                                        <li>Go to our <a href="https://facebook.com/ArcheryRangesCanada" target="_blank" className="font-bold underline decoration-2">Facebook Page</a></li>
                                        <li>Compose a new message from your business account</li>
                                        <li>Send the following code:</li>
                                    </ol>
                                    <div className="mt-6 p-6 bg-white border-2 border-dashed border-blue-400 rounded-xl text-center">
                                        <span className="text-4xl font-mono font-black text-blue-900 select-all">ARC-{id?.toString().substring(0, 4).toUpperCase()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSocialSubmit}
                                    disabled={submitting}
                                    className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-white text-2xl font-black rounded-2xl shadow-xl transition-all disabled:bg-stone-300"
                                >
                                    {submitting ? 'Sending...' : 'I HAVE SENT THE MESSAGE'}
                                </button>
                            </div>
                        )}

                        {step === 'photo' && (
                            <div className="space-y-8 py-4 text-center">
                                <div className="border-4 border-dashed border-stone-200 rounded-3xl p-12 bg-stone-50">
                                    <Upload className="w-20 h-20 text-stone-300 mx-auto mb-6" />
                                    <h3 className="text-2xl font-bold text-stone-800 mb-4">Click below to pick a photo</h3>
                                    <input
                                        type="file"
                                        id="photo-upload"
                                        className="hidden"
                                        onChange={handlePhotoUpload}
                                        accept="image/*"
                                    />
                                    <label
                                        htmlFor="photo-upload"
                                        className="inline-block px-10 py-6 bg-emerald-500 hover:bg-emerald-600 text-white text-2xl font-black rounded-2xl cursor-pointer shadow-lg transition-all"
                                    >
                                        CHOOSE A PHOTO
                                    </label>
                                    <p className="mt-6 text-stone-500 text-lg">Signage, Business License, or Insurance Doc</p>
                                </div>
                            </div>
                        )}

                        {step === 'call' && (
                            <div className="space-y-8 py-4 text-center">
                                <div className="p-10 bg-amber-50 rounded-3xl border-2 border-amber-200">
                                    <p className="text-2xl text-amber-900 font-medium">We'll reach out to your range's official phone number to confirm your identity.</p>
                                </div>
                                <button
                                    onClick={handleCallRequest}
                                    disabled={submitting}
                                    className="w-full py-8 bg-emerald-500 hover:bg-emerald-600 text-white text-2xl font-black rounded-2xl shadow-xl transition-all disabled:bg-stone-300"
                                >
                                    {submitting ? 'Requesting...' : 'REQUEST CALL NOW'}
                                </button>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="space-y-8 py-4">
                                <div className="text-center">
                                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                                    </div>
                                    <h2 className="text-4xl font-black text-stone-900 mb-4">Verification Sent!</h2>
                                    <p className="text-2xl text-stone-600">Our team will review your proof within 24-48 hours. You'll get an email once approved.</p>
                                </div>

                                <div className="my-12 h-1 bg-stone-100" />

                                {/* Upsell Section */}
                                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Zap className="w-32 h-32" />
                                    </div>

                                    <h3 className="text-3xl font-black mb-6 flex items-center gap-3">
                                        <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                                        While you wait...
                                    </h3>

                                    <p className="text-xl text-indigo-100 mb-8">Make your range stand out with a <strong>Premium Listing</strong>.</p>

                                    <ul className="space-y-4 mb-10">
                                        <li className="flex items-center gap-4 text-lg">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                                                <Zap className="w-4 h-4" />
                                            </div>
                                            #1 Priority Search Placement
                                        </li>
                                        <li className="flex items-center gap-4 text-lg">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                                                <Camera className="w-4 h-4" />
                                            </div>
                                            Full Photo & Video Gallery
                                        </li>
                                        <li className="flex items-center gap-4 text-lg">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                                                <MessageSquare className="w-4 h-4" />
                                            </div>
                                            Direct Lead Messaging
                                        </li>
                                    </ul>

                                    <Link
                                        href="/dashboard/subscribe"
                                        className="block w-full text-center py-6 bg-white text-indigo-700 text-2xl font-black rounded-2xl hover:bg-stone-50 transition-all shadow-xl"
                                    >
                                        UPGRADE NOW
                                    </Link>
                                </div>

                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="w-full py-4 text-stone-500 font-bold hover:text-stone-800 transition-colors"
                                >
                                    Return to Dashboard
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 font-bold text-center">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="bg-stone-50 p-6 text-center border-t border-stone-100">
                        <p className="text-stone-500 font-medium">Archery Ranges Canada Official Verification System</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
