/**
 * Subscription tier utility functions
 * Handles tier detection and permission checks for FREE vs BASIC tiers
 */

import { SubscriptionTier } from '@/types/range';

import { STRIPE_CONFIG } from '@/config/stripe';

export { type SubscriptionTier };

// Stripe Payment Links (centralized in src/config/stripe.ts)
const STRIPE_LINKS = {
    silver: STRIPE_CONFIG.silver.baseUrl,
    gold: STRIPE_CONFIG.gold.baseUrl
};

/**
 * Get the subscription tier from a range object
 * @param range - Range object with subscription_tier field
 * @returns The subscription tier (defaults to 'free' if null/undefined)
 */
export function getUserSubscriptionTier(range: { subscription_tier?: string | null, owner_id?: string | null }): SubscriptionTier {
    if (!range) return 'free'

    const tier = range.subscription_tier?.toLowerCase()

    // 1. Check for Silver / Pro (Database uses 'pro')
    if (tier === 'silver' || tier === 'pro') {
        return 'silver'
    }

    // 2. Check for Gold / Premium (Database uses 'premium')
    if (tier === 'gold' || tier === 'premium') {
        return 'gold'
    }

    // 3. Default to bronze if claimed (has owner_id) or explicitly bronze/basic
    if (tier === 'bronze' || tier === 'basic' || range.owner_id) {
        return 'bronze'
    }

    return 'free'
}

/**
 * Check if a user can access analytics based on their tier
 * @param tier - The subscription tier
 * @returns true if tier is basic or higher, false for free
 */
export function canAccessAnalytics(tier: SubscriptionTier): boolean {
    return tier !== 'free'
}

/**
 * Get the photo upload limit based on subscription tier
 * @param tier - The subscription tier
 * @returns Number of photos allowed (-1 for unlimited)
 */
export function getPhotoLimit(tier: SubscriptionTier): number {
    switch (tier) {
        case 'free':
        case 'bronze':
            return 1
        case 'silver':
            return 5
        case 'gold':
            return -1 // Unlimited
        default:
            return 1
    }
}

/**
 * Check if a user can respond to reviews based on their tier
 * @param tier - The subscription tier
 * @returns true if tier is pro or premium, false for free or basic
 */
export function canRespondToReviews(tier: SubscriptionTier): boolean {
    return tier === 'silver' || tier === 'gold'
}

/**
 * Get upgrade message based on current tier
 * @param tier - The current subscription tier
 * @returns Upgrade message string
 */
export function getUpgradeMessage(tier: SubscriptionTier): string {
    switch (tier) {
        case 'free':
            return 'Claim your listing to unlock Bronze features'
        case 'bronze':
            return 'Upgrade to Silver for advanced analytics and more photos'
        case 'silver':
            return 'Upgrade to Gold for maximum visibility and unlimited photos'
        case 'gold':
            return 'You are on the highest tier'
        default:
            return 'Upgrade your plan'
    }
}

/**
 * Get the appropriate upgrade link based on current tier
 * @param currentTier - The user's current subscription tier
 * @param rangeId - The range ID for client reference
 * @returns URL string for the upgrade page
 */
export function getUpgradeLink(currentTier: SubscriptionTier, rangeId?: string): string {
    const baseUrl = currentTier === 'silver' ? STRIPE_LINKS.gold : STRIPE_LINKS.silver;

    if (rangeId) {
        return `${baseUrl}?client_reference_id=${rangeId}`;
    }

    return baseUrl;
}
