'use client';

// =============================================================================
// Google Analytics 4 Utility Library
// =============================================================================

declare global {
    interface Window {
        gtag: (
            command: 'config' | 'event' | 'js' | 'set',
            targetId: string,
            config?: Record<string, any>
        ) => void;
        dataLayer: any[];
    }
}

export const GA_MEASUREMENT_ID = 'G-D1GDEBMEYT';

// -----------------------------------------------------------------------------
// Event Types
// -----------------------------------------------------------------------------

export type ListingClickEvent =
    | 'phone_click'
    | 'email_click'
    | 'website_click'
    | 'get_directions_click'
    | 'apple_maps_click'
    | 'claim_listing_click';

export type GeneralEvent =
    | 'search_performed'
    | 'filter_applied'
    | 'province_selected'
    | 'page_view';

export type AnalyticsEvent = ListingClickEvent | GeneralEvent;

// -----------------------------------------------------------------------------
// Range Context (for listing pages)
// -----------------------------------------------------------------------------

export interface RangeContext {
    range_id: string;
    range_name: string;
    province?: string;
    city?: string;
}

// -----------------------------------------------------------------------------
// Core gtag Wrapper
// -----------------------------------------------------------------------------

/**
 * Check if gtag is available (client-side only)
 */
export function isGtagAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Track a custom event with GA4
 */
export function trackEvent(
    eventName: AnalyticsEvent,
    params?: Record<string, any>
): void {
    if (!isGtagAvailable()) {
        console.log('[GA4] gtag not available, skipping event:', eventName, params);
        return;
    }

    console.log('[GA4] Tracking event:', eventName, params);
    window.gtag('event', eventName, params);
}

/**
 * Track page view with optional range context
 */
export function trackPageView(
    pagePath: string,
    rangeContext?: RangeContext
): void {
    if (!isGtagAvailable()) {
        console.log('[GA4] gtag not available, skipping page_view');
        return;
    }

    const params: Record<string, any> = {
        page_path: pagePath,
        page_location: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (rangeContext) {
        params.range_id = rangeContext.range_id;
        params.range_name = rangeContext.range_name;
        if (rangeContext.province) params.province = rangeContext.province;
        if (rangeContext.city) params.city = rangeContext.city;
    }

    console.log('[GA4] Tracking page_view:', params);
    window.gtag('event', 'page_view', params);
}

// -----------------------------------------------------------------------------
// Listing Click Events
// -----------------------------------------------------------------------------

export function trackPhoneClick(rangeContext: RangeContext, phoneNumber: string): void {
    trackEvent('phone_click', {
        ...rangeContext,
        phone_number: phoneNumber,
    });
}

export function trackEmailClick(rangeContext: RangeContext, email: string): void {
    trackEvent('email_click', {
        ...rangeContext,
        email_address: email,
    });
}

export function trackWebsiteClick(rangeContext: RangeContext, websiteUrl: string): void {
    trackEvent('website_click', {
        ...rangeContext,
        website_url: websiteUrl,
    });
}

export function trackGetDirectionsClick(rangeContext: RangeContext): void {
    trackEvent('get_directions_click', rangeContext);
}

export function trackAppleMapsClick(rangeContext: RangeContext): void {
    trackEvent('apple_maps_click', rangeContext);
}

export function trackClaimListingClick(rangeContext: RangeContext): void {
    trackEvent('claim_listing_click', rangeContext);
}

// -----------------------------------------------------------------------------
// General Events
// -----------------------------------------------------------------------------

export function trackSearch(query: string): void {
    trackEvent('search_performed', {
        search_query: query,
    });
}

export function trackFilterApplied(filterType: string, filterValue: string): void {
    trackEvent('filter_applied', {
        filter_type: filterType,
        filter_value: filterValue,
    });
}

export function trackProvinceSelected(provinceName: string): void {
    trackEvent('province_selected', {
        province_name: provinceName,
    });
}
