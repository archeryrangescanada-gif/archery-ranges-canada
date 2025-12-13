import type { SupabaseClient } from '@supabase/supabase-js';
import type { ParsedRange } from './csv-parser';
import { generateSlug } from './csv-parser';

export interface ImportResult {
  success: boolean;
  inserted: number;
  updated: number;
  failed: number;
  errors: Array<{ range: string; error: string }>;
}

export interface ImportOptions {
  updateExisting?: boolean; // If true, update existing ranges with matching slug
  skipInvalid?: boolean; // If true, skip invalid ranges instead of failing entire import
}

/**
 * Get or create a province by name
 */
async function getOrCreateProvince(
  supabase: any,
  provinceName: string
): Promise<string | null> {
  try {
    const slug = generateSlug(provinceName);

    // Try to find existing province
    const { data: existing, error: fetchError } = await supabase
      .from('provinces')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing && !fetchError) {
      return existing.id;
    }

    // Province doesn't exist, create it
    const { data: newProvince, error: insertError } = await supabase
      .from('provinces')
      .insert({ name: provinceName, slug })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating province:', insertError);
      return null;
    }

    return newProvince?.id || null;
  } catch (error) {
    console.error('Error in getOrCreateProvince:', error);
    return null;
  }
}

/**
 * Get or create a city by name and province
 */
async function getOrCreateCity(
  supabase: any,
  cityName: string,
  provinceId: string
): Promise<string | null> {
  try {
    const slug = generateSlug(cityName);

    // Try to find existing city in this province
    const { data: existing, error: fetchError } = await supabase
      .from('cities')
      .select('id')
      .eq('slug', slug)
      .eq('province_id', provinceId)
      .single();

    if (existing && !fetchError) {
      return existing.id;
    }

    // City doesn't exist, create it
    const { data: newCity, error: insertError } = await supabase
      .from('cities')
      .insert({
        name: cityName,
        slug,
        province_id: provinceId,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating city:', insertError);
      return null;
    }

    return newCity?.id || null;
  } catch (error) {
    console.error('Error in getOrCreateCity:', error);
    return null;
  }
}

/**
 * Normalize facility type to match database expectations
 */
function normalizeFacilityType(type?: string): string | undefined {
  if (!type) return undefined;

  const normalized = type.toLowerCase().trim();
  if (normalized.includes('indoor') && normalized.includes('outdoor')) {
    return 'both';
  } else if (normalized.includes('indoor')) {
    return 'indoor';
  } else if (normalized.includes('outdoor')) {
    return 'outdoor';
  }
  return 'both'; // Default to both if unclear
}

/**
 * Convert ParsedRange to database format
 */
async function convertToDBFormat(
  supabase: any,
  range: ParsedRange
): Promise<any | null> {
  // Get province ID
  if (!range.province_name) {
    console.error(`Range "${range.name}" missing province`);
    return null;
  }

  const provinceId = await getOrCreateProvince(supabase, range.province_name);
  if (!provinceId) {
    console.error(`Failed to get/create province: ${range.province_name}`);
    return null;
  }

  // Get city ID if city is provided
  let cityId: string | null = null;
  if (range.city_name) {
    cityId = await getOrCreateCity(supabase, range.city_name, provinceId);
  }

  // Build the database record
  const dbRange: any = {
    name: range.name,
    slug: range.slug,
    province_id: provinceId,
    city_id: cityId,
    address: range.address,
    phone_number: range.phone_number,
    email: range.email,
    website: range.website,
    description: range.description,
    latitude: range.latitude,
    longitude: range.longitude,

    // Facility details
    facility_type: normalizeFacilityType(range.facility_type),
    range_length_yards: range.range_length_yards,
    number_of_lanes: range.number_of_lanes,

    // Features
    has_pro_shop: range.has_pro_shop,
    has_3d_course: range.has_3d_course,
    has_field_course: range.has_field_course,

    // Membership & Pricing
    membership_required: range.membership_required,
    membership_price_adult: range.membership_price_adult,
    drop_in_price: range.drop_in_price,

    // Services
    equipment_rental_available: range.equipment_rental_available,
    lessons_available: range.lessons_available,
    lesson_price_range: range.lesson_price_range,

    // Amenities
    bow_types_allowed: range.bow_types_allowed,
    accessibility: range.accessibility,
    parking_available: range.parking_available,

    // Metadata
    post_tags: range.post_tags,
    post_images: range.post_images,
    business_hours: range.business_hours,

    // Default values
    subscription_tier: 'free',
    is_featured: false,
  };

  // Remove undefined values to avoid database errors
  Object.keys(dbRange).forEach(key => {
    if (dbRange[key] === undefined) {
      delete dbRange[key];
    }
  });

  return dbRange;
}

/**
 * Import multiple ranges into the database
 */
export async function importRanges(
  supabase: any,
  ranges: ParsedRange[],
  options: ImportOptions = {}
): Promise<ImportResult> {
  const { updateExisting = false, skipInvalid = true } = options;

  const result: ImportResult = {
    success: true,
    inserted: 0,
    updated: 0,
    failed: 0,
    errors: [],
  };

  for (const range of ranges) {
    try {
      // Convert to database format
      const dbRange = await convertToDBFormat(supabase, range);

      if (!dbRange) {
        result.failed++;
        result.errors.push({
          range: range.name,
          error: 'Failed to convert range to database format',
        });
        if (!skipInvalid) {
          result.success = false;
          break;
        }
        continue;
      }

      // Check if range already exists
      const { data: existing } = await supabase
        .from('ranges')
        .select('id')
        .eq('slug', range.slug)
        .eq('province_id', dbRange.province_id)
        .single();

      if (existing) {
        if (updateExisting) {
          // Update existing range
          const { error: updateError } = await supabase
            .from('ranges')
            .update(dbRange)
            .eq('id', existing.id);

          if (updateError) {
            result.failed++;
            result.errors.push({
              range: range.name,
              error: `Update failed: ${updateError.message}`,
            });
            if (!skipInvalid) {
              result.success = false;
              break;
            }
          } else {
            result.updated++;
          }
        } else {
          // Skip existing range
          result.failed++;
          result.errors.push({
            range: range.name,
            error: 'Range already exists (slug conflict)',
          });
        }
      } else {
        // Insert new range
        const { error: insertError } = await supabase
          .from('ranges')
          .insert(dbRange);

        if (insertError) {
          result.failed++;
          result.errors.push({
            range: range.name,
            error: `Insert failed: ${insertError.message}`,
          });
          if (!skipInvalid) {
            result.success = false;
            break;
          }
        } else {
          result.inserted++;
        }
      }
    } catch (error) {
      result.failed++;
      result.errors.push({
        range: range.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      if (!skipInvalid) {
        result.success = false;
        break;
      }
    }
  }

  return result;
}

/**
 * Preview import without actually inserting data
 */
export async function previewImport(
  supabase: any,
  ranges: ParsedRange[]
): Promise<{
  newRanges: string[];
  existingRanges: string[];
  newCities: string[];
  newProvinces: string[];
}> {
  const newRanges: string[] = [];
  const existingRanges: string[] = [];
  const newCities: Set<string> = new Set();
  const newProvinces: Set<string> = new Set();

  for (const range of ranges) {
    // Check if province exists
    if (range.province_name) {
      const { data: province } = await supabase
        .from('provinces')
        .select('id')
        .eq('slug', generateSlug(range.province_name))
        .single();

      if (!province) {
        newProvinces.add(range.province_name);
      }
    }

    // Check if city exists
    if (range.city_name && range.province_name) {
      const provinceSlug = generateSlug(range.province_name);
      const { data: province } = await supabase
        .from('provinces')
        .select('id')
        .eq('slug', provinceSlug)
        .single();

      if (province) {
        const { data: city } = await supabase
          .from('cities')
          .select('id')
          .eq('slug', generateSlug(range.city_name))
          .eq('province_id', province.id)
          .single();

        if (!city) {
          newCities.add(`${range.city_name}, ${range.province_name}`);
        }
      }
    }

    // Check if range exists
    const { data: existingRange } = await supabase
      .from('ranges')
      .select('id')
      .eq('slug', range.slug)
      .single();

    if (existingRange) {
      existingRanges.push(range.name);
    } else {
      newRanges.push(range.name);
    }
  }

  return {
    newRanges,
    existingRanges,
    newCities: Array.from(newCities),
    newProvinces: Array.from(newProvinces),
  };
}
