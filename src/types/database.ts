// Database type definitions for Supabase tables

export interface Range {
  id: string
  name: string
  slug: string
  city_id: string | null
  province_id: string | null
  address: string | null
  postal_code: string | null
  latitude: number | null
  longitude: number | null
  phone_number: string | null
  email: string | null
  website: string | null
  description: string | null
  tags: string | null
  business_hours: string | null
  range_length_yards: number | null
  number_of_lanes: number | null
  facility_type: 'Indoor' | 'Outdoor' | 'Both' | null
  has_pro_shop: boolean
  has_3d_course: boolean
  has_field_course: boolean
  equipment_rental_available: boolean
  lessons_available: boolean
  accessibility: boolean
  parking_available: boolean
  membership_required: boolean
  membership_price_adult: number | null
  drop_in_price: number | null
  lesson_price_range: string | null
  bow_types_allowed: string | null
  owner_id: string | null
  is_claimed: boolean
  is_featured: boolean
  is_premium: boolean
  status: 'active' | 'pending' | 'inactive' | 'rejected'
  views_count: number
  stripe_subscription_id: string | null
  subscription_status: string | null
  subscription_updated_at: string | null
  created_at: string
  updated_at: string
}

export interface RangeWithRelations extends Range {
  cities?: City | null
  provinces?: Province | null
}

export interface City {
  id: string
  name: string
  slug: string | null
  province_id?: string | null
  latitude?: number | null
  longitude?: number | null
  province?: Province
  created_at: string
}

export interface Province {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface VerificationRequest {
  id: string
  range_id: string
  user_id: string
  first_name: string
  last_name: string
  gst_number: string
  business_license_url: string
  insurance_certificate_url: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason: string | null
  submitted_at: string
  created_at: string
  range?: {
    id: string
    name: string
  }
  user?: {
    id: string
    email: string
    full_name: string | null
  }
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'user' | 'admin' | 'owner'
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
}

export interface Claim {
  id: string
  user_id: string
  listing_id: string
  status: 'pending' | 'approved' | 'rejected' | 'contacted'
  first_name: string
  last_name: string
  phone_number: string
  email_address: string
  role_at_range: string
  submitted_at: string
  admin_notes?: string
  reviewed_at?: string
  reviewed_by?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
  // Optional relations
  range?: {
    id: string
    name: string
  }
  user?: {
    id: string
    email: string
    full_name: string | null
    phone?: string | null
  }
}

// API Response types
export interface SearchRangeResult {
  id: string
  name: string
  address: string | null
  facility_type: 'Indoor' | 'Outdoor' | 'Both' | null
  owner_id: string | null
  cities: {
    name: string
  } | null
  provinces: {
    name: string
  } | null
}

// Stats types
export interface AdminStats {
  totalUsers: number
  totalListings: number
  totalClaims: number
  pendingClaims: number
  activeAds: number
  totalAds: number
}

export interface ChartDataPoint {
  month: string
  listings: number
  claims: number
  ads: number
}

export interface RecentUser {
  email: string
  created_at: string
  role: string
}

export interface RecentListing {
  name: string
  city: string | null
  created_at: string
  status: string
}
