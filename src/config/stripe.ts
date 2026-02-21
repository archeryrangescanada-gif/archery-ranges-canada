export const STRIPE_CONFIG = {
  silver: {
    priceId: 'price_1SsxuqBndelh03vCfGSkseAR',
    productId: 'prod_TqfFZtryPP99t3',
    baseUrl: process.env.NEXT_PUBLIC_STRIPE_SILVER_URL || 'https://buy.stripe.com/3cI5kC3UoeXx6eJ53v2oE00',
    checkoutUrl: (listingId: string) => {
      return `${STRIPE_CONFIG.silver.baseUrl}?client_reference_id=${listingId}`;
    },
  },
  gold: {
    priceId: 'price_1T0uXWBndelh03vCm83TOM27',
    baseUrl: process.env.NEXT_PUBLIC_STRIPE_GOLD_URL || 'https://buy.stripe.com/14A8wO3Uo4iTbz353v2oE03',
    checkoutUrl: (listingId: string) => {
      return `${STRIPE_CONFIG.gold.baseUrl}?client_reference_id=${listingId}`;
    },
  },
} as const;

export type TierType = keyof typeof STRIPE_CONFIG;
