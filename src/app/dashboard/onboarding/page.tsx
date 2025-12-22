'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient as supabase } from '@/lib/auth'
import Link from 'next/link'
import { Check, ArrowRight, ArrowLeft, Building2, Phone, Image, CreditCard, Search, Plus, MapPin, ChevronRight, Star } from 'lucide-react'

type Mode = 'choose' | 'claim' | 'create' | 'ai'
type Step = 'business' | 'contact' | 'details' | 'plan'

interface Range {
  id: string
  name: string
  address: string
  city?: { name: string }
  province?: { name: string }
  facility_type: string
}

interface FormData {
  name: string
  address: string
  city: string
  province: string
  postalCode: string
  facilityType: 'indoor' | 'outdoor' | 'both' | ''
  phone: string
  email: string
  website: string
  description: string
  hasProShop: boolean
  has3dCourse: boolean
  hasFieldCourse: boolean
  equipmentRental: boolean
  lessonsAvailable: boolean
  selectedPlan: 'basic' | 'pro' | 'premium' | ''
}

const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'business', label: 'Business Info', icon: <Building2 className="w-5 h-5" /> },
  { id: 'contact', label: 'Contact Details', icon: <Phone className="w-5 h-5" /> },
  { id: 'details', label: 'Range Details', icon: <Image className="w-5 h-5" /> },
  { id: 'plan', label: 'Choose Plan', icon: <CreditCard className="w-5 h-5" /> },
]

const provinces = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
  'Prince Edward Island', 'Quebec', 'Saskatchewan',
  'Northwest Territories', 'Nunavut', 'Yukon'
]

export default function OnboardingPage() {
  const router = useRouter()

  const [mode, setMode] = useState<Mode>('choose')
  const [currentStep, setCurrentStep] = useState<Step>('business')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // For claiming existing listing
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Range[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedRange, setSelectedRange] = useState<Range | null>(null)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    facilityType: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    hasProShop: false,
    has3dCourse: false,
    hasFieldCourse: false,
    equipmentRental: false,
    lessonsAvailable: false,
    selectedPlan: '',
  })

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  const goNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id)
    }
  }

  const goBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id)
    }
  }

  // Search for existing ranges
  const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) return

    setSearching(true)
    setError('')
    console.log('[Search] Starting search for:', trimmedQuery)

    try {
      // We search for everything first, then filter or show status
      const { data, error: searchError } = await supabase
        .from('ranges')
        .select(`
          id, 
          name, 
          address, 
          facility_type,
          owner_id,
          city:cities(name),
          province:provinces(name)
        `)
        .ilike('name', `%${trimmedQuery}%`)
        .limit(20)

      if (searchError) {
        console.error('[Search] Error:', searchError)
        throw searchError
      }

      console.log('[Search] Raw data returned:', data)

      // Filter for unclaimed listings
      const unclaimed = data?.filter(r => !r.owner_id) || []
      console.log('[Search] Unclaimed results:', unclaimed.length)

      setSearchResults(unclaimed as any)

      if (unclaimed.length === 0 && data && data.length > 0) {
        setError('All matching ranges are already claimed. If you believe this is an error, please contact support.')
      }

    } catch (err: any) {
      console.error('[Search] Exception:', err)
      setError(err.message || 'Search failed')
    } finally {
      setSearching(false)
    }
  }

  // Submit claim for existing listing
  const handleClaimSubmit = async () => {
    if (!selectedRange) return

    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Create a claim request
      const { error: claimError } = await supabase
        .from('claims')
        .insert({
          range_id: selectedRange.id,
          user_id: user.id,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        })

      if (claimError) throw claimError

      // Redirect to verification flow
      router.push(`/dashboard/verify/${selectedRange.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to submit claim')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to create a slug from name
  const createSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  // Helper function to find province by name (case-insensitive)
  const findProvince = async (provinceName: string): Promise<string | null> => {
    const trimmedName = provinceName.trim()

    const { data: existingProvince, error: searchError } = await supabase
      .from('provinces')
      .select('id')
      .ilike('name', trimmedName)
      .limit(1)
      .single()

    if (existingProvince) {
      return existingProvince.id
    }

    console.error('Province not found:', trimmedName, searchError)
    return null
  }

  // Helper function to find or create city
  const findOrCreateCity = async (cityName: string, provinceId: string): Promise<string | null> => {
    const trimmedName = cityName.trim()

    const { data: existingCity, error: searchError } = await supabase
      .from('cities')
      .select('id')
      .ilike('name', trimmedName)
      .eq('province_id', provinceId)
      .limit(1)
      .single()

    if (existingCity) {
      return existingCity.id
    }

    const slug = createSlug(trimmedName)
    const properName = trimmedName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')

    const { data: newCity, error: insertError } = await supabase
      .from('cities')
      .insert({
        name: properName,
        slug: slug,
        province_id: provinceId,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Error creating city:', insertError)
      return null
    }

    return newCity.id
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const provinceId = await findProvince(formData.province)

      if (!provinceId) {
        throw new Error('Province not found. Please select a valid province.')
      }

      const cityId = await findOrCreateCity(formData.city, provinceId)

      if (!cityId) {
        throw new Error('Failed to process city. Please try again.')
      }

      const { data, error: insertError } = await supabase
        .from('ranges')
        .insert({
          name: formData.name,
          address: formData.address,
          city_id: cityId,
          province_id: provinceId,
          postal_code: formData.postalCode,
          facility_type: formData.facilityType,
          phone_number: formData.phone,
          email: formData.email,
          website: formData.website,
          post_content: formData.description,
          has_pro_shop: formData.hasProShop,
          has_3d_course: formData.has3dCourse,
          has_field_course: formData.hasFieldCourse,
          equipment_rental_available: formData.equipmentRental,
          lessons_available: formData.lessonsAvailable,
          subscription_tier: formData.selectedPlan || 'free',
          owner_id: user.id,
          slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      if (formData.selectedPlan) {
        router.push('/dashboard/subscribe?plan=' + formData.selectedPlan + '&range=' + data.id)
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  // Choose Mode Screen
  if (mode === 'choose') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-stone-800">Welcome to Archery Ranges Canada!</h1>
            <p className="text-stone-600 mt-1">Let's get your range listed. Choose how you'd like to proceed:</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Claim Existing Listing */}
            <button
              onClick={() => setMode('claim')}
              className="bg-white rounded-2xl shadow-sm border-2 border-stone-200 hover:border-emerald-500 p-8 text-left transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-colors">
                <Search className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-xl font-semibold text-stone-800 mb-2">Claim Existing Listing</h2>
              <p className="text-stone-600 mb-4">
                Your range is already in our directory? Search for it and claim ownership to manage it.
              </p>
              <span className="inline-flex items-center text-emerald-600 font-medium group-hover:gap-2 transition-all">
                Find my range <ChevronRight className="w-5 h-5" />
              </span>
            </button>

            {/* AI Auto-Import */}
            <button
              onClick={() => setMode('ai')}
              className="bg-white rounded-2xl shadow-sm border-2 border-stone-200 hover:border-purple-500 p-8 text-left transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors">
                <Star className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-xl font-semibold text-stone-800 mb-2">AI Auto-Import</h2>
              <p className="text-stone-600 mb-4">
                Paste your website URL and let our AI instantly fill in all your business details.
              </p>
              <span className="inline-flex items-center text-purple-600 font-medium group-hover:gap-2 transition-all">
                Auto-fill details <ChevronRight className="w-5 h-5" />
              </span>
            </button>

            {/* Create New Listing */}
            <button
              onClick={() => setMode('create')}
              className="bg-white rounded-2xl shadow-sm border-2 border-stone-200 hover:border-blue-500 p-8 text-left transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                <Plus className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-xl font-semibold text-stone-800 mb-2">Manual Setup</h2>
              <p className="text-stone-600 mb-4">
                Your range isn't listed yet? Manually enter your details to create a new listing.
              </p>
              <span className="inline-flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                Start manually <ChevronRight className="w-5 h-5" />
              </span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-stone-500 hover:text-stone-700">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // AI Import Mode
  if (mode === 'ai') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <button
              onClick={() => setMode('choose')}
              className="text-stone-500 hover:text-stone-700 mb-2 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
              <Star className="text-purple-600" />
              AI Auto-Import
            </h1>
            <p className="text-stone-600 mt-1">Paste your business URL to instantly fill your listing.</p>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Website or Google Maps URL
            </label>
            <input
              type="url"
              placeholder="https://your-archery-range.com"
              className="w-full px-4 py-3 rounded-lg border border-stone-300 mb-4 focus:ring-2 focus:ring-purple-500 outline-none text-black placeholder:text-gray-500"
              style={{ color: 'black' }}
              onChange={(e) => setSearchQuery(e.target.value)} // Reusing searchQuery state for URL
            />

            <button
              onClick={async () => {
                if (!searchQuery) return;
                setLoading(true);
                try {
                  const res = await fetch('/api/admin/listings/ai-extract', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: searchQuery })
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error);

                  // Populate Form Data
                  const extracted = data.data;
                  console.log('[AI] Extracted data:', extracted);

                  setFormData(prev => ({
                    ...prev,
                    name: extracted.name || extracted.post_title || '',
                    address: extracted.address || extracted.post_address || '',
                    city: extracted.city || extracted.post_city || '',
                    province: extracted.province || extracted.post_region || '',
                    phone: extracted.phone_number || extracted.phone || '',
                    email: extracted.email || '',
                    website: extracted.website || searchQuery,
                    description: extracted.description || extracted.post_content || '',
                    facilityType: (extracted.facility_type?.toLowerCase().includes('indoor') ? 'indoor' :
                      extracted.facility_type?.toLowerCase().includes('outdoor') ? 'outdoor' :
                        (extracted.facility_type?.toLowerCase().includes('both') ? 'both' : 'indoor')),
                    hasProShop: !!extracted.has_pro_shop,
                    has3dCourse: !!extracted.has_3d_course,
                    hasFieldCourse: !!extracted.has_field_course,
                    equipmentRental: !!extracted.equipment_rental_available,
                    lessonsAvailable: !!extracted.lessons_available,
                  }));

                  // Switch to Create Mode to review
                  setMode('create');
                  setCurrentStep('business');

                } catch (err: any) {
                  setError(err.message);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Analyzing... (This takes ~10s)</span>
              ) : (
                <>
                  <Star className="w-5 h-5" />
                  Auto-Fill Details
                </>
              )}
            </button>

            {error && <p className="text-red-600 mt-4 text-sm bg-red-50 p-3 rounded">{error}</p>}
          </div>
        </div>
      </div>
    )
  }

  // Claim Existing Listing Screen
  if (mode === 'claim') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <button
              onClick={() => { setMode('choose'); setSelectedRange(null); setSearchResults([]); }}
              className="text-stone-500 hover:text-stone-700 mb-2 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-2xl font-bold text-stone-800">Claim Your Listing</h1>
            <p className="text-stone-600 mt-1">Search for your range in our directory</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {!selectedRange ? (
              <>
                {/* Search Form */}
                <div className="flex gap-3 mb-6">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by range name..."
                    className="flex-1 px-4 py-3 rounded-lg border border-stone-300 text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={searching}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-400 text-white font-medium rounded-lg transition-colors"
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-stone-500">{searchResults.length} ranges found</p>
                    {searchResults.map((range) => (
                      <button
                        key={range.id}
                        onClick={() => setSelectedRange(range)}
                        className="w-full text-left p-4 rounded-lg border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-stone-800">{range.name}</p>
                            <p className="text-sm text-stone-500">
                              {range.address}
                              {range.city && `, ${range.city.name}`}
                              {range.province && `, ${range.province.name}`}
                            </p>
                            <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-stone-100 text-stone-600 rounded">
                              {range.facility_type}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.length === 0 && searchQuery && !searching && (
                  <div className="text-center py-8">
                    <p className="text-stone-500 mb-4">No ranges found matching "{searchQuery}"</p>
                    <button
                      onClick={() => setMode('create')}
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Create a new listing instead →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Selected Range Confirmation */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-stone-800 mb-4">Confirm Your Range</h2>
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-stone-800">{selectedRange.name}</p>
                        <p className="text-sm text-stone-600">
                          {selectedRange.address}
                          {selectedRange.city && `, ${selectedRange.city.name}`}
                          {selectedRange.province && `, ${selectedRange.province.name}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-stone-600 mb-6">
                  By submitting this claim, you confirm that you are the owner or authorized representative of this archery range. Our team will review your request and may contact you for verification.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedRange(null)}
                    className="px-6 py-3 text-stone-600 hover:text-stone-800 font-medium transition-colors"
                  >
                    Choose Different Range
                  </button>
                  <button
                    onClick={handleClaimSubmit}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-400 text-white font-semibold rounded-lg transition-colors"
                  >
                    {loading ? 'Submitting...' : 'Submit Claim Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Create New Listing Flow (existing code)
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button
            onClick={() => setMode('choose')}
            className="text-stone-500 hover:text-stone-700 mb-2 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-bold text-stone-800">Create Your Range Listing</h1>
          <p className="text-stone-600 mt-1">Complete these steps to get your range listed on Archery Ranges Canada</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentStep === step.id
                  ? 'bg-emerald-100 text-emerald-700'
                  : index < currentStepIndex
                    ? 'bg-emerald-500 text-white'
                    : 'bg-stone-100 text-stone-500'
                  }`}>
                  {index < currentStepIndex ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                  <span className="font-medium hidden sm:inline">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${index < currentStepIndex ? 'bg-emerald-500' : 'bg-stone-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: Business Info */}
          {currentStep === 'business' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-stone-800 mb-2">Business Information</h2>
                <p className="text-stone-600">Tell us about your archery range</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Range Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Toronto Archery Club"
                  className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Province <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.province}
                  onChange={(e) => updateField('province', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  required
                >
                  <option value="">Select a province...</option>
                  {provinces.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Toronto"
                    className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => updateField('postalCode', e.target.value)}
                    placeholder="M5V 1A1"
                    className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Facility Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'indoor', label: 'Indoor' },
                    { value: 'outdoor', label: 'Outdoor' },
                    { value: 'both', label: 'Both' },
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField('facilityType', option.value)}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${formData.facilityType === option.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {currentStep === 'contact' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-stone-800 mb-2">Contact Details</h2>
                <p className="text-stone-600">How can customers reach you?</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="(416) 555-0123"
                  className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Business Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="info@yourrange.com"
                  className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Website <span className="text-stone-400">(optional)</span>
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://www.yourrange.com"
                  className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Range Details */}
          {currentStep === 'details' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-stone-800 mb-2">Range Details</h2>
                <p className="text-stone-600">Tell customers what makes your range special</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe your range, facilities, and what makes you unique..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">
                  Amenities & Features
                </label>
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
              </div>
            </div>
          )}

          {/* Step 4: Choose Plan */}
          {currentStep === 'plan' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-stone-800 mb-2">Choose Your Plan</h2>
                <p className="text-stone-600">Select the plan that fits your needs</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    id: 'basic',
                    name: 'Basic',
                    price: '$49',
                    period: '/month',
                    features: ['1 Photo', 'Contact Form', 'Analytics', 'Featured Badge', 'Email Support'],
                  },
                  {
                    id: 'pro',
                    name: 'Pro',
                    price: '$79',
                    period: '/month',
                    popular: true,
                    features: ['5 Photos + 1 Video', 'Reviews & Events', 'Advanced Analytics', 'Top Ranges Feature', '48hr Support'],
                  },
                  {
                    id: 'premium',
                    name: 'Premium',
                    price: '$149',
                    period: '/month',
                    features: ['Unlimited Photos & Videos', 'Homepage Feature', 'Social Promotion', 'Custom Design', '24hr Phone Support'],
                  },
                ].map(plan => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => updateField('selectedPlan', plan.id)}
                    className={`w-full text-left p-6 rounded-xl border-2 transition-all ${formData.selectedPlan === plan.id
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 ring-offset-2'
                      : 'border-stone-200 hover:border-stone-300'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-stone-800">{plan.name}</h3>
                          {plan.popular && (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                              Most Popular
                            </span>
                          )}
                        </div>
                        <ul className="mt-3 space-y-1">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-stone-600">
                              <Check className="w-4 h-4 text-emerald-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-stone-800">{plan.price}</span>
                        <span className="text-stone-500">{plan.period}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-sm text-stone-500 text-center">
                You can start with a free listing and upgrade anytime
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200">
            {currentStepIndex > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 px-6 py-3 text-stone-600 hover:text-stone-800 font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep === 'plan' ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-400 text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Creating...' : 'Create Listing'}
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}