export const STRIPE_CONFIG = {
  silver: {
    priceId: 'price_1SsxuqBndelh03vCfGSkseAR',
    productId: 'prod_TqfFZtryPP99t3',
    checkoutUrl: (listingId: string) =>
      `https://buy.stripe.com/8x214m0Icg1B46B1Rj2oE02?client_reference_id=${listingId}`,
  },
  gold: {
    priceId: 'price_1T0uXWBndelh03vCm83TOM27',
    checkoutUrl: (listingId: string) =>
      `https://buy.stripe.com/14A8wO3Uo4iTbz353v2oE03?client_reference_id=${listingId}`,
  },
} as const;

export type TierType = keyof typeof STRIPE_CONFIG;
