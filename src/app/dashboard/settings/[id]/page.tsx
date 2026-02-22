'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, MapPin, Loader2 } from 'lucide-react'
import { PhotoManager } from '@/components/dashboard/PhotoManager'
import Header from '@/components/Header'
import { getUserSubscriptionTier, getUpgradeLink } from '@/lib/subscription-utils'
import { normalizeToArray } from '@/lib/utils/data-normalization'
import { SubscriptionTier, TIER_LIMITS, BusinessHours, DayOfWeek, normalizeTier } from '@/types/range'

const DAYS_ORDER: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS: Record<DayOfWeek, string> = {
    monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday',
    friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
}

interface FormData {
    name: string
    address: string
    phone: string
    email: string
    website: string
    description: string
    facebookUrl: string
    instagramUrl: string
    youtubeUrl: string
    twitterUrl: string
    hasProShop: boolean
    has3dCourse: boolean
    hasFieldCourse: boolean
    equipmentRental: boolean
    lessonsAvailable: boolean
    parkingAvailable: boolean
    accessibility: boolean
    facilityType: string
    bowTypes: string[]
    rangeLengthYards: string
    numberOfLanes: string
    maxDrawWeight: string
    membershipRequired: boolean
    membershipPrice: string
    dropInPrice: string
    lessonPriceRange: string
    businessHours: BusinessHours
    latitude: number
    longitude: number
    post_images: string[]
    video_urls: string[]
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
        facebookUrl: '',
        instagramUrl: '',
        youtubeUrl: '',
        twitterUrl: '',
        hasProShop: false,
        has3dCourse: false,
        hasFieldCourse: false,
        equipmentRental: false,
        lessonsAvailable: false,
        parkingAvailable: false,
        accessibility: false,
        facilityType: '',
        bowTypes: [],
        rangeLengthYards: '',
        numberOfLanes: '',
        maxDrawWeight: '',
        membershipRequired: false,
        membershipPrice: '',
        dropInPrice: '',
        lessonPriceRange: '',
        businessHours: {},
        latitude: 0,
        longitude: 0,
        post_images: [],
        video_urls: []
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
                    description: rangeData.description || rangeData.post_content || '',
                    facebookUrl: rangeData.facebook_url || '',
                    instagramUrl: rangeData.instagram_url || '',
                    youtubeUrl: rangeData.youtube_url || '',
                    twitterUrl: rangeData.twitter_url || '',
                    hasProShop: rangeData.has_pro_shop || false,
                    has3dCourse: rangeData.has_3d_course || false,
                    hasFieldCourse: rangeData.has_field_course || false,
                    equipmentRental: rangeData.equipment_rental_available || false,
                    lessonsAvailable: rangeData.lessons_available || false,
                    parkingAvailable: rangeData.parking_available === true || rangeData.parking_available === 'true',
                    accessibility: rangeData.accessibility === true || rangeData.accessibility === 'true' || rangeData.accessibility === 'wheelchair_accessible',
                    facilityType: rangeData.facility_type || '',
                    bowTypes: normalizeToArray(rangeData.bow_types_allowed).map(t => t.toLowerCase()),
                    rangeLengthYards: rangeData.range_length_yards != null ? String(rangeData.range_length_yards) : '',
                    numberOfLanes: rangeData.number_of_lanes != null ? String(rangeData.number_of_lanes) : '',
                    maxDrawWeight: rangeData.max_draw_weight != null ? String(rangeData.max_draw_weight) : '',
                    membershipRequired: rangeData.membership_required || false,
                    membershipPrice: rangeData.membership_price_adult != null ? String(rangeData.membership_price_adult) : '',
                    dropInPrice: rangeData.drop_in_price != null ? String(rangeData.drop_in_price) : '',
                    lessonPriceRange: rangeData.lesson_price_range || '',
                    businessHours: (() => {
                        if (!rangeData.business_hours) return {};
                        if (typeof rangeData.business_hours === 'string') {
                            try { return JSON.parse(rangeData.business_hours); } catch { return {}; }
                        }
                        return rangeData.business_hours;
                    })(),
                    latitude: rangeData.latitude || 0,
                    longitude: rangeData.longitude || 0,
                    post_images: normalizeToArray(rangeData.post_images),
                    video_urls: normalizeToArray(rangeData.video_urls),
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

    const updateField = (field: keyof FormData, value: string | boolean | string[] | number | BusinessHours) => {
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
                    description: formData.description,
                    post_content: formData.description,
                    ...(TIER_LIMITS[tier].hasSocialLinks ? {
                        facebook_url: formData.facebookUrl || null,
                        instagram_url: formData.instagramUrl || null,
                        youtube_url: formData.youtubeUrl || null,
                        twitter_url: formData.twitterUrl || null,
                    } : {}),
                    has_pro_shop: formData.hasProShop,
                    has_3d_course: formData.has3dCourse,
                    has_field_course: formData.hasFieldCourse,
                    equipment_rental_available: formData.equipmentRental,
                    lessons_available: formData.lessonsAvailable,
                    parking_available: formData.parkingAvailable,
                    accessibility: formData.accessibility,
                    facility_type: formData.facilityType,
                    bow_types_allowed: formData.bowTypes,
                    range_length_yards: formData.rangeLengthYards ? Number(formData.rangeLengthYards) : null,
                    number_of_lanes: formData.numberOfLanes ? Number(formData.numberOfLanes) : null,
                    max_draw_weight: formData.maxDrawWeight ? Number(formData.maxDrawWeight) : null,
                    membership_required: formData.membershipRequired,
                    membership_price_adult: formData.membershipPrice ? Number(formData.membershipPrice) : null,
                    drop_in_price: formData.dropInPrice ? Number(formData.dropInPrice) : null,
                    lesson_price_range: formData.lessonPriceRange || null,
                    business_hours: Object.keys(formData.businessHours).length > 0 ? formData.businessHours : null,
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    post_images: formData.post_images,
                    video_urls: formData.video_urls,
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
            <Header />

            {/* Sub-header for navigation back */}
            <div className="bg-white border-b border-stone-200">
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
            </div>

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
                                    <div className="flex justify-end mt-1">
                                        {(() => {
                                            const wordCount = formData.description.trim().split(/\s+/).filter(Boolean).length;
                                            const limit = TIER_LIMITS[tier].descriptionWordLimit;
                                            const isOver = limit !== -1 && wordCount > limit;

                                            return (
                                                <div className={`text-xs ${isOver ? 'text-red-500 font-bold' : 'text-stone-400'}`}>
                                                    {wordCount} / {limit === -1 ? 'Unlimited' : limit} words
                                                    {isOver && <span className="ml-1">(Please shorten description)</span>}
                                                </div>
                                            );
                                        })()}
                                    </div>
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

                        {/* Social Media */}
                        <div className="pt-6 border-t border-stone-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-stone-800">Social Media Links</h2>
                                {!TIER_LIMITS[tier].hasSocialLinks && (
                                    <a href={getUpgradeLink(tier, rangeId)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                                        Upgrade to Silver to add social links
                                    </a>
                                )}
                            </div>
                            {TIER_LIMITS[tier].hasSocialLinks ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">Facebook</label>
                                        <input
                                            type="url"
                                            value={formData.facebookUrl}
                                            onChange={(e) => updateField('facebookUrl', e.target.value)}
                                            placeholder="https://facebook.com/yourpage"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">Instagram</label>
                                        <input
                                            type="url"
                                            value={formData.instagramUrl}
                                            onChange={(e) => updateField('instagramUrl', e.target.value)}
                                            placeholder="https://instagram.com/yourpage"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">YouTube</label>
                                        <input
                                            type="url"
                                            value={formData.youtubeUrl}
                                            onChange={(e) => updateField('youtubeUrl', e.target.value)}
                                            placeholder="https://youtube.com/@yourchannel"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">X (Twitter)</label>
                                        <input
                                            type="url"
                                            value={formData.twitterUrl}
                                            onChange={(e) => updateField('twitterUrl', e.target.value)}
                                            placeholder="https://x.com/yourhandle"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-stone-50 border border-stone-200 rounded-lg p-6 text-center">
                                    <p className="text-stone-500 text-sm mb-3">Social media links are available on Silver and Gold plans.</p>
                                    <a href={getUpgradeLink(tier, rangeId)} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                                        Upgrade to Add Social Links
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Amenities */}
                        <div className="pt-6 border-t border-stone-200">
                            <h2 className="text-lg font-semibold text-stone-800 mb-4">Facility Details</h2>

                            <div className="space-y-6 mb-6">
                                {/* Facility Type */}
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">
                                        Facility Type
                                    </label>
                                    <select
                                        value={formData.facilityType}
                                        onChange={(e) => updateField('facilityType', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="">Select Type...</option>
                                        <option value="indoor">Indoor</option>
                                        <option value="outdoor">Outdoor</option>
                                        <option value="both">Indoor & Outdoor</option>
                                    </select>
                                </div>

                                {/* Bow Types */}
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">
                                        Bow Types Allowed
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Recurve', 'Compound', 'Longbow', 'Crossbow', 'Traditional'].map(type => {
                                            const lowerType = type.toLowerCase();
                                            const isSelected = formData.bowTypes.includes(lowerType);
                                            return (
                                                <button
                                                    type="button"
                                                    key={type}
                                                    onClick={() => {
                                                        const newTypes = isSelected
                                                            ? formData.bowTypes.filter(t => t !== lowerType)
                                                            : [...formData.bowTypes, lowerType];
                                                        updateField('bowTypes', newTypes);
                                                    }}
                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isSelected
                                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                        : 'bg-stone-50 text-stone-600 border border-stone-200 hover:border-stone-300'
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Range Specifications */}
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">
                                            Range Length (yards)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.rangeLengthYards}
                                            onChange={(e) => updateField('rangeLengthYards', e.target.value)}
                                            placeholder="e.g. 20"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">
                                            Number of Lanes
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.numberOfLanes}
                                            onChange={(e) => updateField('numberOfLanes', e.target.value)}
                                            placeholder="e.g. 12"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">
                                            Max Draw Weight (lbs)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.maxDrawWeight}
                                            onChange={(e) => updateField('maxDrawWeight', e.target.value)}
                                            placeholder="e.g. 60"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-lg font-semibold text-stone-800 mb-4">Location Coordinates</h2>
                            <p className="text-sm text-stone-500 mb-4">
                                Update these values if the map pin is incorrect. get the coordinates from Google Maps (right click a location).
                            </p>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.latitude}
                                        onChange={(e) => updateField('latitude', parseFloat(e.target.value))}
                                        className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.longitude}
                                        onChange={(e) => updateField('longitude', parseFloat(e.target.value))}
                                        className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800"
                                    />
                                </div>
                            </div>

                            <h2 className="text-lg font-semibold text-stone-800 mb-4">Amenities & Features</h2>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { field: 'hasProShop', label: 'Pro Shop' },
                                    { field: 'has3dCourse', label: '3D Course' },
                                    { field: 'hasFieldCourse', label: 'Field Course' },
                                    { field: 'equipmentRental', label: 'Equipment Rental' },
                                    { field: 'lessonsAvailable', label: 'Lessons Available' },
                                    { field: 'parkingAvailable', label: 'Parking Available' },
                                    { field: 'accessibility', label: 'Wheelchair Accessible' },
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
                            {/* Pricing */}
                            <div className="pt-6 border-t border-stone-200">
                                <h2 className="text-lg font-semibold text-stone-800 mb-4">Pricing</h2>

                                <div className="space-y-4">
                                    <label
                                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${formData.membershipRequired
                                            ? 'border-emerald-500 bg-emerald-50'
                                            : 'border-stone-200 hover:border-stone-300'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.membershipRequired}
                                            onChange={(e) => updateField('membershipRequired', e.target.checked)}
                                            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                                        />
                                        <span className="font-medium text-stone-700">Membership Required</span>
                                    </label>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">
                                                Drop-In Price (CAD)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.dropInPrice}
                                                onChange={(e) => updateField('dropInPrice', e.target.value)}
                                                placeholder="e.g. 15"
                                                className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">
                                                Adult Membership Price (CAD)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.membershipPrice}
                                                onChange={(e) => updateField('membershipPrice', e.target.value)}
                                                placeholder="e.g. 200"
                                                className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">
                                                Lesson Price Range
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.lessonPriceRange}
                                                onChange={(e) => updateField('lessonPriceRange', e.target.value)}
                                                placeholder="e.g. $30 - $60"
                                                className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Business Hours */}
                            <div className="pt-6 border-t border-stone-200">
                                <h2 className="text-lg font-semibold text-stone-800 mb-4">Business Hours</h2>

                                <div className="space-y-3">
                                    {DAYS_ORDER.map(day => {
                                        const dayData = formData.businessHours[day] || { open: '', close: '', closed: false };
                                        return (
                                            <div key={day} className="flex items-center gap-3">
                                                <span className="w-24 text-sm font-medium text-stone-700">{DAY_LABELS[day]}</span>
                                                <label className="flex items-center gap-1.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={dayData.closed}
                                                        onChange={(e) => {
                                                            const updated = { ...formData.businessHours, [day]: { ...dayData, closed: e.target.checked } };
                                                            updateField('businessHours', updated as any);
                                                        }}
                                                        className="w-4 h-4 text-stone-600 rounded focus:ring-stone-500"
                                                    />
                                                    <span className="text-xs text-stone-500">Closed</span>
                                                </label>
                                                {!dayData.closed && (
                                                    <>
                                                        <input
                                                            type="time"
                                                            value={dayData.open || ''}
                                                            onChange={(e) => {
                                                                const updated = { ...formData.businessHours, [day]: { ...dayData, open: e.target.value } };
                                                                updateField('businessHours', updated as any);
                                                            }}
                                                            className="px-3 py-2 rounded-lg border border-stone-300 text-stone-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                        />
                                                        <span className="text-stone-400 text-sm">to</span>
                                                        <input
                                                            type="time"
                                                            value={dayData.close || ''}
                                                            onChange={(e) => {
                                                                const updated = { ...formData.businessHours, [day]: { ...dayData, close: e.target.value } };
                                                                updateField('businessHours', updated as any);
                                                            }}
                                                            className="px-3 py-2 rounded-lg border border-stone-300 text-stone-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
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

                            {/* Video Management */}
                            <div className="pt-6 border-t border-stone-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-stone-800">Videos</h2>
                                    {(() => {
                                        const limit = TIER_LIMITS[tier].maxVideos;
                                        if (limit === 0 && tier !== 'free') {
                                            // Should not happen for paid tiers usually, but just in case
                                            return null;
                                        }
                                        if (tier === 'bronze') {
                                            return (
                                                <a href={getUpgradeLink(tier, rangeId)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                                                    Upgrade to Gold to add videos
                                                </a>
                                            )
                                        }
                                        if (tier === 'silver') {
                                            return (
                                                <a href={getUpgradeLink(tier, rangeId)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                                                    Upgrade to Gold to add a video
                                                </a>
                                            )
                                        }
                                        return null;
                                    })()}
                                </div>

                                {TIER_LIMITS[tier].maxVideos === 0 ? (
                                    <div className="bg-stone-50 border border-stone-200 rounded-lg p-6 text-center">
                                        <p className="text-stone-500 text-sm mb-3">Video embedding is available on Gold plans.</p>
                                        <a href={getUpgradeLink(tier, rangeId)} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                                            Upgrade to Add Videos
                                        </a>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {formData.video_urls.map((url, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="url"
                                                    value={url}
                                                    onChange={(e) => {
                                                        const newUrls = [...formData.video_urls];
                                                        newUrls[index] = e.target.value;
                                                        updateField('video_urls', newUrls);
                                                    }}
                                                    placeholder="https://www.youtube.com/watch?v=..."
                                                    className="flex-1 px-4 py-2 rounded-lg border border-stone-300 text-stone-800 text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newUrls = formData.video_urls.filter((_, i) => i !== index);
                                                        updateField('video_urls', newUrls);
                                                    }}
                                                    className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}

                                        {(() => {
                                            const limit = TIER_LIMITS[tier].maxVideos;
                                            const canAdd = limit === -1 || formData.video_urls.length < limit;

                                            if (canAdd) {
                                                return (
                                                    <button
                                                        type="button"
                                                        onClick={() => updateField('video_urls', [...formData.video_urls, ''])}
                                                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                                    >
                                                        + Add Video URL
                                                    </button>
                                                );
                                            } else {
                                                return (
                                                    <p className="text-xs text-stone-400">
                                                        Video limit reached ({limit}/{limit}).
                                                        {tier === 'silver' && ' Upgrade to Gold for unlimited videos.'}
                                                    </p>
                                                );
                                            }
                                        })()}
                                    </div>
                                )}
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
