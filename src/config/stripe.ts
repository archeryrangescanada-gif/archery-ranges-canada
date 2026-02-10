export const STRIPE_CONFIG = {
  silver: {
    priceId: 'price_1SsxuqBndelh03vCfGSkseAR',
    productId: 'prod_TqfFZtryPP99t3',
    checkoutUrl: (listingId: string) =>
      `https://buy.stripe.com/3cI5kC3UoeXx6eJ53v2oE00?client_reference_id=${listingId}`,
  },
  gold: {
    priceId: 'PLACEHOLDER',
    productId: 'PLACEHOLDER',
    checkoutUrl: (listingId: string) =>
      `https://buy.stripe.com/PLACEHOLDER?client_reference_id=${listingId}`,
  },
} as const;

export type TierType = keyof typeof STRIPE_CONFIG;
