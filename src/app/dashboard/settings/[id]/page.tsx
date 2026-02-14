'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, MapPin, Loader2 } from 'lucide-react'
import { PhotoManager } from '@/components/dashboard/PhotoManager'
import { SubscriptionTier, getUserSubscriptionTier } from '@/lib/subscription-utils'
import { normalizeToArray } from '@/lib/utils/data-normalization'

interface FormData {
    name: string
    address: string
    phone: string
    email: string
    website: string
    description: string
    hasProShop: boolean
    has3dCourse: boolean
    hasFieldCourse: boolean
    equipmentRental: boolean
    lessonsAvailable: boolean
    post_images: string[]
}

export default function SettingsPage() {
    const router = useRouter()
    const params = useParams()
    const rangeId = params.id as string
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [loadingMessage, setLoadingMessage] = useState('Initializing...')
    const [fatalError, setFatalError] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [tier, setTier] = useState<SubscriptionTier>('free')

    const [formData, setFormData] = useState<FormData>({
        name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        description: '',
        hasProShop: false,
        has3dCourse: false,
        hasFieldCourse: false,
        equipmentRental: false,
        lessonsAvailable: false,
        post_images: []
    })
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        let mounted = true

        async function loadData() {
            try {
                setLoadingMessage('Checking authentication...')

                // 1. Auth Check
                const authPromise = supabase.auth.getUser()
                const authTimeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Authentication check timed out')), 10000)
                )

                const { data: { user }, error: authError } = await Promise.race([
                    authPromise,
                    authTimeout
                ]) as any

                if (!mounted) return

                if (!user || authError) {
                    console.log('Auth failed or no user:', authError)
                    router.push('/auth/login')
                    return
                }

                // 2. Fetch Range Data
                setLoadingMessage('Loading range details...')

                const dataPromise = supabase
                    .from('ranges')
                    .select('*')
                    .eq('id', rangeId)
                    .eq('owner_id', user.id)
                    .single()

                const dataTimeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Data loading timed out')), 15000)
                )

                const { data: rangeData, error: rangeError } = await Promise.race([
                    dataPromise,
                    dataTimeout
                ]) as any

                if (!mounted) return

                if (rangeError) {
                    throw rangeError
                }

                if (!rangeData) {
                    router.push('/dashboard')
                    return
                }

                setFormData({
                    name: rangeData.name || '',
                    address: rangeData.address || '',
                    phone: rangeData.phone_number || '',
                    email: rangeData.email || '',
                    website: rangeData.website || '',
                    description: rangeData.post_content || '',
                    hasProShop: rangeData.has_pro_shop || false,
                    has3dCourse: rangeData.has_3d_course || false,
                    hasFieldCourse: rangeData.has_field_course || false,
                    equipmentRental: rangeData.equipment_rental_available || false,
                    lessonsAvailable: rangeData.lessons_available || false,
                    post_images: normalizeToArray(rangeData.post_images),
                })
                setTier(getUserSubscriptionTier(rangeData))
                setLoading(false)

            } catch (err: any) {
                console.error('Error in settings page:', err)
                if (mounted) {
                    setFatalError(err.message || 'Failed to load range settings')
                    setLoading(false)
                }
            }
        }

        loadData()

        return () => {
            mounted = false
        }
    }, [router, supabase, rangeId])

    const updateField = (field: keyof FormData, value: string | boolean | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setSuccess('')
    }

    const handleSave = async () => {
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            const { error: updateError } = await supabase
                .from('ranges')
                .update({
                    name: formData.name,
                    address: formData.address,
                    phone_number: formData.phone,
                    email: formData.email,
                    website: formData.website,
                    post_content: formData.description,
                    has_pro_shop: formData.hasProShop,
                    has_3d_course: formData.has3dCourse,
                    has_field_course: formData.hasFieldCourse,
                    equipment_rental_available: formData.equipmentRental,
                    lessons_available: formData.lessonsAvailable,
                    post_images: formData.post_images,
                })
                .eq('id', rangeId)

            if (updateError) throw updateError

            setSuccess('Changes saved successfully!')
        } catch (err: any) {
            setError(err.message || 'Failed to save changes')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this listing? This action cannot be undone.'
        )

        if (!confirmed) return

        setDeleting(true)
        setError('')

        try {
            const { error: deleteError } = await supabase
                .from('ranges')
                .delete()
                .eq('id', rangeId)

            if (deleteError) throw deleteError

            // Redirect to dashboard after successful deletion
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Failed to delete listing')
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
                    <div className="text-stone-600 font-medium">{loadingMessage}</div>
                    <div className="text-stone-400 text-sm mt-2">Please wait...</div>
                </div>
            </div>
        )
    }

    if (fatalError) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200 max-w-md w-full text-center">
                    <div className="text-red-500 font-medium mb-2">Error Loading Settings</div>
                    <p className="text-stone-600 mb-6">{fatalError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                    >
                        Retry
                    </button>
                    <Link href="/dashboard" className="block mt-4 text-sm text-stone-500 hover:text-stone-700">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Header */}
            <header className="bg-white border-b border-stone-200">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-stone-800">Edit Listing</h1>
                    <p className="text-stone-600">{formData.name}</p>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl border border-stone-200 p-6 md:p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
                            {success}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div>
                            <h2 className="text-lg font-semibold text-stone-800 mb-4">Basic Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">
                                        Range Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => updateField('name', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => updateField('address', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => updateField('description', e.target.value)}
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="pt-6 border-t border-stone-200">
                            <h2 className="text-lg font-semibold text-stone-800 mb-4">Contact Information</h2>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => updateField('phone', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => updateField('email', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-stone-700 mb-1">
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => updateField('website', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="pt-6 border-t border-stone-200">
                            <h2 className="text-lg font-semibold text-stone-800 mb-4">Amenities & Features</h2>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { field: 'hasProShop', label: 'Pro Shop' },
                                    { field: 'has3dCourse', label: '3D Course' },
                                    { field: 'hasFieldCourse', label: 'Field Course' },
                                    { field: 'equipmentRental', label: 'Equipment Rental' },
                                    { field: 'lessonsAvailable', label: 'Lessons Available' },
                                ].map(amenity => (
                                    <label
                                        key={amenity.field}
                                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${formData[amenity.field as keyof FormData]
                                            ? 'border-emerald-500 bg-emerald-50'
                                            : 'border-stone-200 hover:border-stone-300'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData[amenity.field as keyof FormData] as boolean}
                                            onChange={(e) => updateField(amenity.field as keyof FormData, e.target.checked)}
                                            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                                        />
                                        <span className="font-medium text-stone-700">{amenity.label}</span>
                                    </label>
                                ))}
                            </div>
                            {/* Photo Management */}
                            <div className="pt-6 border-t border-stone-200">
                                <h2 className="text-lg font-semibold text-stone-800 mb-4">Photos</h2>
                                <PhotoManager
                                    rangeId={rangeId}
                                    currentPhotos={formData.post_images}
                                    tier={tier}
                                    onPhotosChange={(newPhotos) => updateField('post_images', newPhotos)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="mt-8 pt-6 border-t border-stone-200 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 disabled:text-stone-400 font-medium"
                        >
                            <Trash2 className="w-4 h-4" />
                            {deleting ? 'Deleting...' : 'Delete Listing'}
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-400 text-white font-semibold rounded-lg transition-colors"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
