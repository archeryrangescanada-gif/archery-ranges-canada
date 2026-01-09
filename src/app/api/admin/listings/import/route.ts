import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Interface matching the Gemini AI extraction output
interface RangeImport {
  post_title: string
  post_address: string
  post_city: string
  post_region: string
  post_country: string
  post_zip: string
  post_latitude: number | null
  post_longitude: number | null
  phone: string
  email: string
  website: string
  post_content: string
  post_tags: string
  business_hours: string
  post_images: string[]
  range_length_yards: number
  number_of_lanes: number
  facility_type: 'Indoor' | 'Outdoor' | 'Both'
  has_pro_shop: boolean
  has_3d_course: boolean
  has_field_course: boolean
  membership_required: boolean
  membership_price_adult: number
  drop_in_price: number
  equipment_rental_available: boolean
  lessons_available: boolean
  lesson_price_range: string
  bow_types_allowed: string
  accessibility: boolean
  parking_available: boolean
}

// Valid Canadian provinces and territories
const VALID_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
  'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec',
  'Saskatchewan', 'Yukon'
]

// Helper to ensure number or null
const safeNumber = (val: any): number | null => {
  if (typeof val === 'number' && !isNaN(val)) return val
  if (typeof val === 'string' && val.trim() !== '') {
    const num = parseFloat(val)
    return isNaN(num) ? null : num
  }
  return null
}

// Helper to ensure boolean
const safeBool = (val: any): boolean => {
  if (typeof val === 'boolean') return val
  if (typeof val === 'string') {
    const lower = val.toLowerCase().trim()
    return lower === 'true' || lower === 'yes' || lower === '1'
  }
  return false
}

// Helper to title case a string
const toTitleCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

export async function POST(request: NextRequest) {
  console.log('📦 Import API called')

  try {
    const body = await request.json()
    const { ranges } = body

    if (!ranges || !Array.isArray(ranges)) {
      return NextResponse.json(
        { error: 'Invalid request: ranges array required' },
        { status: 400 }
      )
    }

    // Batch limit
    if (ranges.length > 1000) {
        return NextResponse.json({ error: 'Batch too large (max 1000)' }, { status: 413 })
    }

    console.log(`📊 Processing ${ranges.length} range(s)`)

    const supabase = await createClient()

    // 1. Pre-process Cities and Provinces
    const uniqueCityNames = new Set<string>()
    const uniqueProvinceNames = new Set<string>()

    ranges.forEach((r: any) => {
        if (r.post_city && typeof r.post_city === 'string' && r.post_city.trim()) {
            uniqueCityNames.add(toTitleCase(r.post_city.trim()))
        }
        if (r.post_region && typeof r.post_region === 'string' && r.post_region.trim()) {
            // Normalize province name for lookup
             const normalized = r.post_region.trim()
             const valid = VALID_PROVINCES.find(p => p.toLowerCase() === normalized.toLowerCase())
             if (valid) uniqueProvinceNames.add(valid)
        }
    })

    const cityNames = Array.from(uniqueCityNames)
    const provinceNames = Array.from(uniqueProvinceNames)

    // Maps to store ID mappings
    const cityMap: Record<string, string> = {}
    const provinceMap: Record<string, string> = {}

    // 2. Resolve Provinces (Fetch all, map valid ones)
    // Since the list is small, we can fetch all provinces in DB
    const { data: allProvinces } = await supabase.from('provinces').select('id, name')

    // Populate existing
    if (allProvinces) {
        allProvinces.forEach(p => {
            provinceMap[p.name] = p.id
        })
    }

    // Insert missing provinces
    const missingProvinces = provinceNames.filter(name => !provinceMap[name])
    if (missingProvinces.length > 0) {
        const { data: newProvinces, error: provError } = await supabase
            .from('provinces')
            .insert(missingProvinces.map(name => ({
                name,
                slug: name.toLowerCase().replace(/\s+/g, '-')
            })))
            .select('id, name')

        if (provError) {
            console.error('Error creating provinces:', provError)
            // Continue, but some ranges might fail
        } else if (newProvinces) {
            newProvinces.forEach(p => provinceMap[p.name] = p.id)
        }
    }

    // 3. Resolve Cities
    // Fetch existing cities that match our list
    let existingCities: any[] = []
    if (cityNames.length > 0) {
        // Supabase 'in' filter for names
        // Note: This is case-sensitive. We rely on toTitleCase normalization.
        const { data } = await supabase
            .from('cities')
            .select('id, name')
            .in('name', cityNames)

        if (data) existingCities = data
    }

    existingCities.forEach((c: any) => {
        cityMap[c.name] = c.id
    })

    // Insert missing cities
    const missingCities = cityNames.filter(name => !cityMap[name])
    if (missingCities.length > 0) {
        // Insert in batches of 100 just in case
        const CITY_BATCH_SIZE = 100
        for (let i = 0; i < missingCities.length; i += CITY_BATCH_SIZE) {
            const batch = missingCities.slice(i, i + CITY_BATCH_SIZE)
            const { data: newCities, error: cityError } = await supabase
                .from('cities')
                .insert(batch.map(name => ({ name })))
                .select('id, name')

            if (cityError) {
                console.error('Error creating cities:', cityError)
            } else if (newCities) {
                newCities.forEach(c => cityMap[c.name] = c.id)
            }
        }
    }

    // 4. Prepare Range Inserts
    const rangesToInsert: any[] = []
    const failedRanges: string[] = []

    for (const rawRange of ranges) {
        const range = rawRange as any

        // Basic validation
        if (!range.post_title || typeof range.post_title !== 'string') {
            failedRanges.push(`Skipped: Missing title`)
            continue
        }

        // Resolve dependencies
        let cityId = null
        if (range.post_city) {
            const cityName = toTitleCase(range.post_city.trim())
            cityId = cityMap[cityName] || null
        }

        let provinceId = null
        if (range.post_region) {
            const normalized = range.post_region.trim()
            const valid = VALID_PROVINCES.find(p => p.toLowerCase() === normalized.toLowerCase())
            if (valid) provinceId = provinceMap[valid] || null
        }

        const slug = range.post_title
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')

        const newRange = {
            name: range.post_title.trim(),
            slug: slug,
            city_id: cityId,
            province_id: provinceId,
            address: typeof range.post_address === 'string' ? range.post_address : '',
            postal_code: typeof range.post_zip === 'string' ? range.post_zip : null,
            latitude: safeNumber(range.post_latitude),
            longitude: safeNumber(range.post_longitude),
            phone_number: typeof range.phone === 'string' ? range.phone : null,
            email: typeof range.email === 'string' ? range.email : null,
            website: typeof range.website === 'string' ? range.website : null,
            description: typeof range.post_content === 'string' ? range.post_content : null,
            tags: typeof range.post_tags === 'string' ? range.post_tags : null,
            business_hours: typeof range.business_hours === 'string' ? range.business_hours : null,
            range_length_yards: safeNumber(range.range_length_yards),
            number_of_lanes: safeNumber(range.number_of_lanes),
            facility_type: typeof range.facility_type === 'string' ? range.facility_type : null,
            has_pro_shop: safeBool(range.has_pro_shop),
            has_3d_course: safeBool(range.has_3d_course),
            has_field_course: safeBool(range.has_field_course),
            equipment_rental_available: safeBool(range.equipment_rental_available),
            lessons_available: safeBool(range.lessons_available),
            accessibility: safeBool(range.accessibility),
            parking_available: safeBool(range.parking_available),
            membership_required: safeBool(range.membership_required),
            membership_price_adult: safeNumber(range.membership_price_adult),
            drop_in_price: safeNumber(range.drop_in_price),
            lesson_price_range: typeof range.lesson_price_range === 'string' ? range.lesson_price_range : null,
            bow_types_allowed: typeof range.bow_types_allowed === 'string' ? range.bow_types_allowed : null,
            is_featured: false
        }

        rangesToInsert.push(newRange)
    }

    // 5. Batch Insert Ranges
    let successCount = 0
    let failureCount = failedRanges.length // Start with pre-validation failures
    const BATCH_SIZE = 100

    for (let i = 0; i < rangesToInsert.length; i += BATCH_SIZE) {
        const batch = rangesToInsert.slice(i, i + BATCH_SIZE)
        const { error } = await supabase.from('ranges').insert(batch)

        if (error) {
            console.error(`Error inserting batch ${i}:`, error)
            failureCount += batch.length
            failedRanges.push(`Batch ${i/BATCH_SIZE + 1} failed: ${error.message}`)
        } else {
            successCount += batch.length
        }
    }

    console.log(`📊 Import complete: ${successCount} success, ${failureCount} failed`)

    return NextResponse.json({
      success: successCount,
      failed: failureCount,
      errors: failedRanges
    })

  } catch (error: any) {
    console.error('❌ Import API Error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Import failed',
        details: error.toString()
      },
      { status: 500 }
    )
  }
}
