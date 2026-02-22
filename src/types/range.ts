// =====================================================
// ARCHERY RANGES CANADA - TYPE DEFINITIONS
// src/types/range.ts
// =====================================================

export type SubscriptionTier = 'free' | 'bronze' | 'silver' | 'gold' | 'basic' | 'pro' | 'premium';

export function normalizeTier(tier: string | undefined | null): 'free' | 'bronze' | 'silver' | 'gold' {
  if (!tier) return 'free';
  if (tier === 'basic') return 'bronze';
  if (tier === 'pro') return 'silver';
  if (tier === 'premium') return 'gold';
  if (['free', 'bronze', 'silver', 'gold'].includes(tier)) return tier as any;
  return 'free';
}

export type FacilityType = 'indoor' | 'outdoor' | 'both';

export type BowType = 'recurve' | 'compound' | 'longbow' | 'crossbow' | 'traditional';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface BusinessHoursDay {
  open?: string;
  close?: string;
  closed: boolean;
}

export type BusinessHours = {
  [key in DayOfWeek]?: BusinessHoursDay;
};

export interface Range {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  city_id?: string;
  province: string;
  province_id?: string;
  country: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  phone_number?: string;
  email?: string;
  website?: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  twitter_url?: string;
  tiktok_url?: string;
  description?: string;
  post_content?: string;
  post_tags?: string[];
  business_hours?: BusinessHours | string;
  post_images?: string[];
  video_urls?: string[];
  range_length_yards?: number | string;
  number_of_lanes?: number | string | null;
  facility_type?: FacilityType | string;
  bow_types_allowed?: BowType[] | string;
  max_draw_weight?: number;
  has_pro_shop?: boolean;
  has_3d_course?: boolean;
  has_field_course?: boolean;
  equipment_rental_available?: boolean;
  lessons_available?: boolean;
  parking_available?: boolean | string;
  accessibility?: string;
  membership_required?: boolean;
  membership_price_adult?: number | string;
  drop_in_price?: number | string;
  lesson_price_range?: string;
  subscription_tier: SubscriptionTier;
  subscription_expires_at?: string;
  is_featured?: boolean;
  show_reviews?: boolean;
  events_enabled?: boolean;
  google_calendar_embed_url?: string;
  featured_in_top_ranges?: boolean;
  featured_on_homepage?: boolean;
  custom_page_design?: Record<string, unknown>;
  view_count?: number;
  inquiry_count?: number;
  click_count?: number;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
  cities?: {
    name: string;
    slug: string;
    provinces: {
      name: string;
      slug: string;
    };
  };
}

export interface TierLimits {
  maxPhotos: number;
  maxVideos: number;
  hasAnalytics: boolean;
  hasContactForm: boolean;
  hasClickableContact: boolean;
  hasSocialLinks: boolean;
  hasReviews: boolean;
  hasEvents: boolean;
  featuredBadge: boolean;
  bronzeBadge: boolean;
  silverBadge: boolean;
  goldBadge: boolean;
  homepageFeature: boolean;
  customDesign: boolean;
  socialPromotion: boolean;
  descriptionWordLimit: number;
  priorityInSearch: boolean;
  supportLevel: 'none' | 'email' | '48hr' | '24hr_phone';
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    maxPhotos: 1,
    maxVideos: 0,
    hasAnalytics: false,
    hasContactForm: false,
    hasClickableContact: false,
    hasSocialLinks: false,
    hasReviews: true,
    hasEvents: false,
    featuredBadge: false,
    bronzeBadge: false,
    silverBadge: false,
    goldBadge: false,
    homepageFeature: false,
    customDesign: false,
    socialPromotion: false,
    descriptionWordLimit: 100,
    priorityInSearch: false,
    supportLevel: 'none',
  },
  bronze: {
    maxPhotos: 3,
    maxVideos: 0,
    hasAnalytics: true,
    hasContactForm: true,
    hasClickableContact: true,
    hasSocialLinks: false,
    hasReviews: true,
    hasEvents: false,
    featuredBadge: true,
    bronzeBadge: true,
    silverBadge: false,
    goldBadge: false,
    homepageFeature: false,
    customDesign: false,
    socialPromotion: false,
    descriptionWordLimit: 350,
    priorityInSearch: true,
    supportLevel: 'email',
  },
  silver: {
    maxPhotos: 5,
    maxVideos: 0,
    hasAnalytics: true,
    hasContactForm: true,
    hasClickableContact: true,
    hasSocialLinks: true,
    hasReviews: true,
    hasEvents: true,
    featuredBadge: false,
    bronzeBadge: false,
    silverBadge: true,
    goldBadge: false,
    homepageFeature: false,
    customDesign: false,
    socialPromotion: false,
    descriptionWordLimit: 300,
    priorityInSearch: true,
    supportLevel: '48hr',
  },
  gold: {
    maxPhotos: -1,
    maxVideos: 1,
    hasAnalytics: true,
    hasContactForm: true,
    hasClickableContact: true,
    hasSocialLinks: true,
    hasReviews: true,
    hasEvents: true,
    featuredBadge: false,
    bronzeBadge: false,
    silverBadge: false,
    goldBadge: true,
    homepageFeature: true,
    customDesign: true,
    socialPromotion: true,
    descriptionWordLimit: -1,
    priorityInSearch: true,
    supportLevel: '24hr_phone',
  },
  basic: null as any,
  pro: null as any,
  premium: null as any,
};

TIER_LIMITS.basic = TIER_LIMITS.bronze;
TIER_LIMITS.pro = TIER_LIMITS.silver;
TIER_LIMITS.premium = TIER_LIMITS.gold;

export interface RangeReview {
  id: string;
  range_id: string;
  user_id?: string;
  reviewer_name?: string;
  rating: number;
  review_text?: string;
  owner_reply?: string;
  owner_reply_created_at?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface RangeEvent {
  id: string;
  range_id: string;
  title: string;
  description?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location_details?: string;
  registration_url?: string;
  max_participants?: number;
  price?: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface RangeInquiry {
  id: string;
  range_id: string;
  sender_name: string;
  sender_email: string;
  sender_phone?: string;
  subject?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return TIER_LIMITS[tier];
}

export function canShowPhotos(tier: SubscriptionTier): boolean {
  return TIER_LIMITS[tier].maxPhotos !== 0;
}

export function canShowVideo(tier: SubscriptionTier): boolean {
  return TIER_LIMITS[tier].maxVideos !== 0;
}

export function canShowCarousel(tier: SubscriptionTier): boolean {
  return TIER_LIMITS[tier].maxPhotos > 1 || TIER_LIMITS[tier].maxPhotos === -1;
}

export function getMaxPhotos(tier: SubscriptionTier, actualCount: number): number {
  const limit = TIER_LIMITS[tier].maxPhotos;
  if (limit === -1) return actualCount;
  return Math.min(limit, actualCount);
}

export function getMaxVideos(tier: SubscriptionTier, actualCount: number): number {
  const limit = TIER_LIMITS[tier].maxVideos;
  if (limit === -1) return actualCount;
  return Math.min(limit, actualCount);
}

export function getBadgeType(tier: SubscriptionTier): 'featured' | 'bronze' | 'silver' | 'gold' | null {
  const limits = TIER_LIMITS[tier];
  if (limits.goldBadge) return 'gold';
  if (limits.silverBadge) return 'silver';
  if (limits.bronzeBadge || limits.featuredBadge) return 'bronze';
  return null;
}