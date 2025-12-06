// =====================================================
// ARCHERY RANGES CANADA - TYPE DEFINITIONS
// src/types/range.ts
// =====================================================

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'premium';

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
  phone?: string;
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
  business_hours?: BusinessHours;
  post_images?: string[];
  video_urls?: string[];
  range_length_yards?: number;
  number_of_lanes?: number;
  facility_type?: FacilityType;
  bow_types_allowed?: BowType[];
  max_draw_weight?: number;
  has_pro_shop?: boolean;
  has_3d_course?: boolean;
  has_field_course?: boolean;
  equipment_rental_available?: boolean;
  lessons_available?: boolean;
  parking_available?: boolean;
  accessibility?: string;
  membership_required?: boolean;
  membership_price_adult?: number;
  drop_in_price?: number;
  lesson_price_range?: string;
  subscription_tier: SubscriptionTier;
  subscription_expires_at?: string;
  is_featured?: boolean;
  show_reviews?: boolean;
  events_enabled?: boolean;
  featured_in_top_ranges?: boolean;
  featured_on_homepage?: boolean;
  custom_page_design?: Record<string, unknown>;
  view_count?: number;
  inquiry_count?: number;
  click_count?: number;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TierLimits {
  maxPhotos: number;
  maxVideos: number;
  hasAnalytics: boolean;
  hasContactForm: boolean;
  hasReviews: boolean;
  hasEvents: boolean;
  featuredBadge: boolean;
  proBadge: boolean;
  premiumBadge: boolean;
  homepageFeature: boolean;
  customDesign: boolean;
  socialPromotion: boolean;
  descriptionWordLimit: number;
  priorityInSearch: boolean;
  supportLevel: 'none' | 'email' | '48hr' | '24hr_phone';
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    maxPhotos: 0,
    maxVideos: 0,
    hasAnalytics: false,
    hasContactForm: false,
    hasReviews: false,
    hasEvents: false,
    featuredBadge: false,
    proBadge: false,
    premiumBadge: false,
    homepageFeature: false,
    customDesign: false,
    socialPromotion: false,
    descriptionWordLimit: 100,
    priorityInSearch: false,
    supportLevel: 'none',
  },
  basic: {
    maxPhotos: 1,
    maxVideos: 0,
    hasAnalytics: true,
    hasContactForm: true,
    hasReviews: false,
    hasEvents: false,
    featuredBadge: true,
    proBadge: false,
    premiumBadge: false,
    homepageFeature: false,
    customDesign: false,
    socialPromotion: false,
    descriptionWordLimit: 350,
    priorityInSearch: true,
    supportLevel: 'email',
  },
  pro: {
    maxPhotos: 5,
    maxVideos: 1,
    hasAnalytics: true,
    hasContactForm: true,
    hasReviews: true,
    hasEvents: true,
    featuredBadge: false,
    proBadge: true,
    premiumBadge: false,
    homepageFeature: false,
    customDesign: false,
    socialPromotion: false,
    descriptionWordLimit: 1000,
    priorityInSearch: true,
    supportLevel: '48hr',
  },
  premium: {
    maxPhotos: -1,
    maxVideos: -1,
    hasAnalytics: true,
    hasContactForm: true,
    hasReviews: true,
    hasEvents: true,
    featuredBadge: false,
    proBadge: false,
    premiumBadge: true,
    homepageFeature: true,
    customDesign: true,
    socialPromotion: true,
    descriptionWordLimit: -1,
    priorityInSearch: true,
    supportLevel: '24hr_phone',
  },
};

export interface RangeReview {
  id: string;
  range_id: string;
  user_id?: string;
  reviewer_name?: string;
  rating: number;
  review_text?: string;
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

export function getBadgeType(tier: SubscriptionTier): 'featured' | 'pro' | 'premium' | null {
  const limits = TIER_LIMITS[tier];
  if (limits.premiumBadge) return 'premium';
  if (limits.proBadge) return 'pro';
  if (limits.featuredBadge) return 'featured';
  return null;
}