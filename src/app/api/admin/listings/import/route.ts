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

    console.log(`📊 Processing ${ranges.length} range(s)`)

    const supabase = await createClient()
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const range of ranges as RangeImport[]) {
      try {
        // Validate required field
        if (!range.post_title) {
          results.failed++
          results.errors.push(`Skipped: Missing post_title`)
          continue
        }

        console.log(`🏹 Creating range: ${range.post_title}`)

        // Generate slug from name
        const slug = range.post_title
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen

        // Find or create city
        let cityId: string | null = null
        if (range.post_city && range.post_city.trim()) {
          const { data: existingCity } = await supabase
            .from('cities')
            .select('id')
            .ilike('name', range.post_city.trim())
            .single()

          if (existingCity) {
            cityId = existingCity.id
          } else {
            const { data: newCity, error: cityError } = await supabase
              .from('cities')
              .insert({ name: range.post_city.trim() })
              .select('id')
              .single()

            if (!cityError && newCity) {
              cityId = newCity.id
              console.log(`  ✅ Created new city: ${range.post_city}`)
            }
          }
        }

        // Find or create province (ONLY if it's a valid Canadian province)
        let provinceId: string | null = null
        if (range.post_region && range.post_region.trim()) {
          const provinceName = range.post_region.trim()

          // Check if it's a valid province
          const isValidProvince = VALID_PROVINCES.some(
            validProv => validProv.toLowerCase() === provinceName.toLowerCase()
          )

          if (isValidProvince) {
            const { data: existingProvince } = await supabase
              .from('provinces')
              .select('id')
              .ilike('name', provinceName)
              .single()

            if (existingProvince) {
              provinceId = existingProvince.id
            } else {
              // Use the properly capitalized name from VALID_PROVINCES
              const correctName = VALID_PROVINCES.find(
                p => p.toLowerCase() === provinceName.toLowerCase()
              )!

              const { data: newProvince, error: provinceError } = await supabase
                .from('provinces')
                .insert({
                  name: correctName,
                  slug: correctName.toLowerCase().replace(/\s+/g, '-')
                })
                .select('id')
                .single()

              if (!provinceError && newProvince) {
                provinceId = newProvince.id
                console.log(`  ✅ Created new province: ${correctName}`)
              }
            }
          } else {
            console.log(`  ⚠️  Skipping invalid province: "${provinceName}" (not a Canadian province)`)
          }
        }

        // Create the range with ALL fields from the new schema
        const { data: newRange, error: rangeError } = await supabase
          .from('ranges')
          .insert({
            // Core fields
            name: range.post_title.trim(),
            slug: slug,
            city_id: cityId,
            province_id: provinceId,

            // Address fields
            address: range.post_address || '',
            postal_code: range.post_zip || null,
            latitude: range.post_latitude || null,
            longitude: range.post_longitude || null,

            // Contact fields
            phone_number: range.phone || null,
            email: range.email || null,
            website: range.website || null,

            // Content fields
            description: range.post_content || null,
            tags: range.post_tags || null,
            business_hours: range.business_hours || null,

            // Range specifications
            range_length_yards: range.range_length_yards || null,
            number_of_lanes: range.number_of_lanes || null,
            facility_type: range.facility_type || null,

            // Features (booleans)
            has_pro_shop: range.has_pro_shop || false,
            has_3d_course: range.has_3d_course || false,
            has_field_course: range.has_field_course || false,
            equipment_rental_available: range.equipment_rental_available || false,
            lessons_available: range.lessons_available || false,
            accessibility: range.accessibility || false,
            parking_available: range.parking_available || false,

            // Membership & Pricing
            membership_required: range.membership_required || false,
            membership_price_adult: range.membership_price_adult || null,
            drop_in_price: range.drop_in_price || null,
            lesson_price_range: range.lesson_price_range || null,

            // Additional info
            bow_types_allowed: range.bow_types_allowed || null,

            // System fields
            is_featured: false
          })
          .select()
          .single()

        if (rangeError) {
          console.error(`❌ Error creating range ${range.post_title}:`, rangeError)
          results.failed++
          results.errors.push(`${range.post_title}: ${rangeError.message}`)
        } else {
          console.log(`✅ Created range: ${range.post_title} (ID: ${newRange.id})`)
          results.success++

          // Handle images if provided
          if (range.post_images && Array.isArray(range.post_images) && range.post_images.length > 0) {
            console.log(`  📸 Range has ${range.post_images.length} images (not yet implemented)`)
            // TODO: Implement image upload/storage logic
          }
        }
      } catch (itemError: any) {
        console.error(`❌ Error processing range:`, itemError)
        results.failed++
        results.errors.push(`${range.post_title || 'Unknown'}: ${itemError.message}`)
      }
    }

    console.log(`📊 Import complete: ${results.success} success, ${results.failed} failed`)

    return NextResponse.json({
      success: results.success,
      failed: results.failed,
      errors: results.errors
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
