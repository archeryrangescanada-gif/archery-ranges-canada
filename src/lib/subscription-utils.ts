/**
 * Subscription tier utility functions
 * Handles tier detection and permission checks for FREE vs BASIC tiers
 */

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'premium'

/**
 * Get the subscription tier from a range object
 * @param range - Range object with subscription_tier field
 * @returns The subscription tier (defaults to 'free' if null/undefined)
 */
export function getUserSubscriptionTier(range: { subscription_tier?: string | null }): SubscriptionTier {
    const tier = range.subscription_tier?.toLowerCase()

    if (tier === 'basic' || tier === 'pro' || tier === 'premium') {
        return tier as SubscriptionTier
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
 * @returns Number of photos allowed
 */
export function getPhotoLimit(tier: SubscriptionTier): number {
    switch (tier) {
        case 'free':
            return 1
        case 'basic':
            return 3
        case 'pro':
            return 5
        case 'premium':
            return 10
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
    return tier === 'pro' || tier === 'premium'
}

/**
 * Get upgrade message based on current tier
 * @param tier - The current subscription tier
 * @returns Upgrade message string
 */
export function getUpgradeMessage(tier: SubscriptionTier): string {
    switch (tier) {
        case 'free':
            return 'Upgrade to Basic for analytics and more photos'
        case 'basic':
            return 'Upgrade to Pro for advanced analytics and review responses'
        case 'pro':
            return 'Upgrade to Premium for maximum visibility'
        default:
            return 'Upgrade your plan'
    }
}
