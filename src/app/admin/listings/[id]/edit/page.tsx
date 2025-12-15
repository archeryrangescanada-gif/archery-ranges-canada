'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Province {
    id: string
    name: string
    slug: string
}

interface City {
    id: string
    name: string
}

export default function EditListingPage() {
    const router = useRouter()
    const params = useParams()
    const id = params?.id as string
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [provinces, setProvinces] = useState<Province[]>([])
    const [cities, setCities] = useState<City[]>([])

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        province_id: '',
        city_id: '',
        phone_number: '',
        website: '',
        description: '',
        latitude: '',
        longitude: '',
        is_featured: false,
        email: '',
        postal_code: '',
        range_length_yards: '',
        number_of_lanes: '',
        facility_type: '',
        bow_types_allowed: '',
        drop_in_price: '',
        membership_price_adult: '',
        lesson_price_range: '',
        business_hours: '',
        has_pro_shop: false,
        has_3d_course: false,
        has_field_course: false,
        equipment_rental_available: false,
        lessons_available: false,
        membership_required: false,
    })

    useEffect(() => {
        fetchInitialData()
    }, [id])

    useEffect(() => {
        if (formData.province_id) {
            fetchCities(formData.province_id)
        }
    }, [formData.province_id])

    const fetchInitialData = async () => {
        try {
            // 1. Fetch Provinces
            const { data: provData } = await supabase.from('provinces').select('*').order('name')
            if (provData) setProvinces(provData)

            // 2. Fetch Listing
            const { data: listing, error } = await supabase
                .from('ranges')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            if (!listing) throw new Error('Listing not found')

            // 3. Set Form Data
            setFormData({
                name: listing.name,
                address: listing.address || '',
                province_id: listing.province_id,
                city_id: listing.city_id,
                phone_number: listing.phone_number || '',
                website: listing.website || '',
                description: listing.description || '',
                latitude: listing.latitude || '',
                longitude: listing.longitude || '',
                is_featured: listing.is_featured || false,
                email: listing.email || '',
                postal_code: listing.postal_code || '',
                range_length_yards: listing.range_length_yards || '',
                number_of_lanes: listing.number_of_lanes || '',
                facility_type: listing.facility_type || '',
                bow_types_allowed: listing.bow_types_allowed || '',
                drop_in_price: listing.drop_in_price || '',
                membership_price_adult: listing.membership_price_adult || '',
                lesson_price_range: listing.lesson_price_range || '',
                business_hours: listing.business_hours || '',
                has_pro_shop: listing.has_pro_shop || false,
                has_3d_course: listing.has_3d_course || false,
                has_field_course: listing.has_field_course || false,
                equipment_rental_available: listing.equipment_rental_available || false,
                lessons_available: listing.lessons_available || false,
                membership_required: listing.membership_required || false,
            })

            // 4. Fetch Cities for this province immediately so dropdown is populated
            if (listing.province_id) {
                const { data: cityData } = await supabase
                    .from('cities')
                    .select('*')
                    .eq('province_id', listing.province_id)
                    .order('name')
                if (cityData) setCities(cityData)
            }

        } catch (error: any) {
            console.error('Error fetching data:', error)
            alert('Error loading listing: ' + error.message)
            router.push('/admin/listings')
        } finally {
            setLoading(false)
        }
    }

    const fetchCities = async (provinceId: string) => {
        const { data } = await supabase
            .from('cities')
            .select('*')
            .eq('province_id', provinceId)
            .order('name')
        if (data) setCities(data)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const payload = {
                name: formData.name,
                address: formData.address,
                province_id: formData.province_id,
                city_id: formData.city_id,
                phone_number: formData.phone_number,
                website: formData.website,
                description: formData.description,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                updated_at: new Date().toISOString(),
                email: (formData as any).email,
                postal_code: (formData as any).postal_code,
                range_length_yards: (formData as any).range_length_yards,
                number_of_lanes: (formData as any).number_of_lanes ? parseInt((formData as any).number_of_lanes) : null,
                facility_type: (formData as any).facility_type,
                bow_types_allowed: (formData as any).bow_types_allowed,
                drop_in_price: (formData as any).drop_in_price,
                membership_price_adult: (formData as any).membership_price_adult,
                lesson_price_range: (formData as any).lesson_price_range,
                business_hours: (formData as any).business_hours,
                has_pro_shop: (formData as any).has_pro_shop,
                has_3d_course: (formData as any).has_3d_course,
                has_field_course: (formData as any).has_field_course,
                equipment_rental_available: (formData as any).equipment_rental_available,
                lessons_available: (formData as any).lessons_available,
                membership_required: (formData as any).membership_required,
            }

            const { error } = await supabase
                .from('ranges')
                .update(payload)
                .eq('id', id)

            if (error) throw error

            alert('Listing updated successfully!')
            router.push('/admin/listings')
            router.refresh()
        } catch (error: any) {
            alert('Failed to update: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8">Loading listing...</div>

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/listings"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
                </div>
                <div className="text-sm text-gray-500">ID: {id}</div>
            </div>

            <div className="bg-white rounded-lg shadow p-8">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="space-y-8">
                        {/* Section 1: Basic Info */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Range Name *</label>
                                    <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white" placeholder="e.g. Toronto Archery Club" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                                    <select name="province_id" required value={formData.province_id} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white text-gray-900">
                                        <option value="">Select a Province</option>
                                        {provinces.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                    <select name="city_id" required value={formData.city_id} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white text-gray-900">
                                        <option value="">Select a City</option>
                                        {cities.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Contact & Location */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact & Location</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white" placeholder="123 Bow Street" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                    <input type="text" name="postal_code" value={formData.postal_code || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white" placeholder="M5V 2H1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white" placeholder="contact@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                    <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white" placeholder="https://" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                    <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                    <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white" />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Facility Details */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Facility Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Facility Type</label>
                                    <select name="facility_type" value={formData.facility_type || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white text-gray-900">
                                        <option value="">Unknown</option>
                                        <option value="indoor">Indoor</option>
                                        <option value="outdoor">Outdoor</option>
                                        <option value="both">Both</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Range Length (Yards)</label>
                                    <input type="text" name="range_length_yards" value={formData.range_length_yards || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white" placeholder="e.g. 20y, 50m" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Num. of Lanes</label>
                                    <input type="number" name="number_of_lanes" value={formData.number_of_lanes || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white" />
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bow Types Allowed</label>
                                    <input type="text" name="bow_types_allowed" value={formData.bow_types_allowed || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white" placeholder="Recurve, Compound, Crossbow..." />
                                </div>
                                <div className="col-span-3">
                                    <span className="block text-sm font-medium text-gray-700 mb-2">Amenities</span>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { key: 'has_pro_shop', label: 'Pro Shop' },
                                            { key: 'has_3d_course', label: '3D Course' },
                                            { key: 'has_field_course', label: 'Field Course' },
                                            { key: 'equipment_rental_available', label: 'Rentals' },
                                            { key: 'lessons_available', label: 'Lessons' },
                                            { key: 'membership_required', label: 'Membership Req.' }
                                        ].map((item) => (
                                            <label key={item.key} className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200">
                                                <input
                                                    type="checkbox"
                                                    name={item.key}
                                                    checked={!!(formData as any)[item.key]}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                                />
                                                <span className="text-sm text-gray-900">{item.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Pricing & Hours */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Info</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Drop-in Price</label>
                                    <input type="text" name="drop_in_price" value={formData.drop_in_price || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white" placeholder="$10 / day" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Membership Price</label>
                                    <input type="text" name="membership_price_adult" value={formData.membership_price_adult || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white" placeholder="$200 / year" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Price</label>
                                    <input type="text" name="lesson_price_range" value={formData.lesson_price_range || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white" placeholder="$50 - $100" />
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
                                    <textarea name="business_hours" rows={3} value={formData.business_hours || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none resize-none text-gray-900 bg-white" placeholder="Mon-Fri: 9am-5pm..." />
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none resize-none text-gray-900 bg-white" placeholder="Tell us about the range..." />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t mt-6">
                        <Link
                            href="/admin/listings"
                            className="mr-4 px-6 py-2 rounded text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Update Listing
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div >
        </div >
    )
}
