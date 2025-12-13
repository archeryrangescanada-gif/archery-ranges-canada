import { parse } from 'csv-parse/sync';

export interface CSVRange {
  post_title: string;
  post_author?: string;
  post_category?: string;
  post_address?: string;
  post_city?: string;
  post_region?: string;
  post_country?: string;
  post_zip?: string;
  post_latitude?: string;
  post_longitude?: string;
  phone?: string;
  email?: string;
  website?: string;
  post_content?: string;
  post_tags?: string;
  business_hours?: string;
  post_images?: string;
  range_length_yards?: string;
  number_of_lanes?: string;
  facility_type?: string;
  has_pro_shop?: string;
  has_3d_course?: string;
  has_field_course?: string;
  membership_required?: string;
  membership_price_adult?: string;
  drop_in_price?: string;
  equipment_rental_available?: string;
  lessons_available?: string;
  lesson_price_range?: string;
  bow_types_allowed?: string;
  accessibility?: string;
  parking_available?: string;
  data_status?: string;
}

export interface ParsedRange {
  name: string;
  slug: string;
  address?: string;
  city_name?: string;
  province_name?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  phone_number?: string;
  email?: string;
  website?: string;
  description?: string;
  post_tags?: string[];
  business_hours?: any;
  post_images?: string[];
  range_length_yards?: number;
  number_of_lanes?: number;
  facility_type?: string;
  has_pro_shop?: boolean;
  has_3d_course?: boolean;
  has_field_course?: boolean;
  membership_required?: boolean;
  membership_price_adult?: number;
  drop_in_price?: number;
  equipment_rental_available?: boolean;
  lessons_available?: boolean;
  lesson_price_range?: string;
  bow_types_allowed?: string[];
  accessibility?: string;
  parking_available?: boolean;
  data_status?: string;
}

export interface CSVParseResult {
  success: boolean;
  data?: ParsedRange[];
  errors?: string[];
  stats?: {
    total: number;
    parsed: number;
    failed: number;
  };
}

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Parse a boolean value from CSV (handles Yes/No, Y/N, True/False, 1/0, N/A)
 */
function parseBoolean(value?: string): boolean | undefined {
  if (!value || value.trim() === '' || value.toUpperCase() === 'N/A') {
    return undefined;
  }
  const normalized = value.trim().toUpperCase();
  return normalized === 'YES' || normalized === 'Y' || normalized === 'TRUE' || normalized === '1';
}

/**
 * Parse a number value from CSV (handles N/A, empty strings, and currency formatting)
 */
function parseNumber(value?: string): number | undefined {
  if (!value || value.trim() === '' || value.toUpperCase() === 'N/A') {
    return undefined;
  }
  // Remove currency symbols and commas
  const cleaned = value.replace(/[$,]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

/**
 * Parse comma-separated values into an array
 */
function parseArray(value?: string): string[] | undefined {
  if (!value || value.trim() === '' || value.toUpperCase() === 'N/A') {
    return undefined;
  }
  return value
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

/**
 * Parse business hours JSON or structured text
 */
function parseBusinessHours(value?: string): any {
  if (!value || value.trim() === '' || value.toUpperCase() === 'N/A') {
    return undefined;
  }

  try {
    // Try parsing as JSON first
    return JSON.parse(value);
  } catch {
    // If not JSON, return as raw text for manual processing
    return { raw: value };
  }
}

/**
 * Parse a single CSV row into a ParsedRange object
 */
function parseCSVRow(row: CSVRange, rowIndex: number): { range?: ParsedRange; error?: string } {
  try {
    // Required field validation
    if (!row.post_title || row.post_title.trim() === '') {
      return { error: `Row ${rowIndex}: Missing required field 'post_title'` };
    }

    const range: ParsedRange = {
      name: row.post_title.trim(),
      slug: generateSlug(row.post_title),
      address: row.post_address?.trim() || undefined,
      city_name: row.post_city?.trim() || undefined,
      province_name: row.post_region?.trim() || undefined,
      country: row.post_country?.trim() || undefined,
      postal_code: row.post_zip?.trim() || undefined,
      latitude: parseNumber(row.post_latitude),
      longitude: parseNumber(row.post_longitude),
      phone_number: row.phone?.trim() || undefined,
      email: row.email?.trim() || undefined,
      website: row.website?.trim() || undefined,
      description: row.post_content?.trim() || undefined,
      post_tags: parseArray(row.post_tags),
      business_hours: parseBusinessHours(row.business_hours),
      post_images: parseArray(row.post_images),
      range_length_yards: parseNumber(row.range_length_yards),
      number_of_lanes: parseNumber(row.number_of_lanes),
      facility_type: row.facility_type?.trim() || undefined,
      has_pro_shop: parseBoolean(row.has_pro_shop),
      has_3d_course: parseBoolean(row.has_3d_course),
      has_field_course: parseBoolean(row.has_field_course),
      membership_required: parseBoolean(row.membership_required),
      membership_price_adult: parseNumber(row.membership_price_adult),
      drop_in_price: parseNumber(row.drop_in_price),
      equipment_rental_available: parseBoolean(row.equipment_rental_available),
      lessons_available: parseBoolean(row.lessons_available),
      lesson_price_range: row.lesson_price_range?.trim() || undefined,
      bow_types_allowed: parseArray(row.bow_types_allowed),
      accessibility: row.accessibility?.trim() || undefined,
      parking_available: parseBoolean(row.parking_available),
      data_status: row.data_status?.trim() || undefined,
    };

    return { range };
  } catch (error) {
    return { error: `Row ${rowIndex}: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

/**
 * Parse a CSV file buffer and return structured range data
 */
export async function parseRangesCSV(fileBuffer: Buffer): Promise<CSVParseResult> {
  const errors: string[] = [];
  const parsedRanges: ParsedRange[] = [];

  try {
    // Parse CSV with csv-parse
    const records: CSVRange[] = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true, // Allow inconsistent column counts
      skip_records_with_empty_values: false,
    });

    // Process each row
    for (let i = 0; i < records.length; i++) {
      const result = parseCSVRow(records[i], i + 2); // +2 for 1-based index and header row

      if (result.error) {
        errors.push(result.error);
      } else if (result.range) {
        parsedRanges.push(result.range);
      }
    }

    return {
      success: errors.length === 0,
      data: parsedRanges,
      errors: errors.length > 0 ? errors : undefined,
      stats: {
        total: records.length,
        parsed: parsedRanges.length,
        failed: errors.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      errors: [`CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      stats: {
        total: 0,
        parsed: 0,
        failed: 0,
      },
    };
  }
}

/**
 * Validate parsed range data before database insertion
 */
export function validateParsedRange(range: ParsedRange): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!range.name || range.name.trim() === '') {
    errors.push('Range name is required');
  }

  if (!range.province_name) {
    errors.push('Province is required');
  }

  // Validate facility type if provided
  if (range.facility_type) {
    const validTypes = ['Indoor', 'Outdoor', 'Indoor/Outdoor', 'Both'];
    const normalized = range.facility_type.toLowerCase();
    if (!validTypes.some(type => type.toLowerCase() === normalized)) {
      errors.push(`Invalid facility_type: ${range.facility_type}. Must be one of: ${validTypes.join(', ')}`);
    }
  }

  // Validate coordinates if provided
  if (range.latitude !== undefined && (range.latitude < -90 || range.latitude > 90)) {
    errors.push('Latitude must be between -90 and 90');
  }
  if (range.longitude !== undefined && (range.longitude < -180 || range.longitude > 180)) {
    errors.push('Longitude must be between -180 and 180');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
