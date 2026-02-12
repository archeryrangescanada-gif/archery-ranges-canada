/**
 * Subscription tier utility functions
 * Handles tier detection and permission checks for FREE vs BASIC tiers
 */

export type SubscriptionTier = 'free' | 'bronze' | 'silver' | 'gold'

/**
 * Get the subscription tier from a range object
 * @param range - Range object with subscription_tier field
 * @returns The subscription tier (defaults to 'free' if null/undefined)
 */
export function getUserSubscriptionTier(range: { subscription_tier?: string | null, owner_id?: string | null }): SubscriptionTier {
    if (!range) return 'free'

    const tier = range.subscription_tier?.toLowerCase()

    // Explicit paid tiers
    if (tier === 'silver' || tier === 'gold') {
        return tier as SubscriptionTier
    }

    // Default to bronze if claimed (has owner_id) or explicitly bronze
    if (tier === 'bronze' || range.owner_id) {
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
 * @returns Number of photos allowed
 */
export function getPhotoLimit(tier: SubscriptionTier): number {
    switch (tier) {
        case 'free':
            return 1
        case 'bronze':
            return 1
        case 'silver':
            return 5
        case 'gold':
            return 100 // High enough to be effectively unlimited for most users
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
        default:
            return 'Upgrade your plan'
    }
}
