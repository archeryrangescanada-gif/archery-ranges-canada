'use client';

import { useCallback } from 'react';
import {
    RangeContext,
    trackPageView,
    trackPhoneClick,
    trackEmailClick,
    trackWebsiteClick,
    trackGetDirectionsClick,
    trackAppleMapsClick,
    trackClaimListingClick,
    trackSearch,
    trackFilterApplied,
    trackProvinceSelected,
} from '@/lib/analytics';

/**
 * React hook for GA4 analytics tracking
 * Provides memoized tracking functions with optional range context
 */
export function useAnalytics(rangeContext?: RangeContext) {
    // Page view tracking
    const trackPage = useCallback(
        (pagePath: string) => {
            trackPageView(pagePath, rangeContext);
        },
        [rangeContext]
    );

    // Listing click events (require range context)
    const onPhoneClick = useCallback(
        (phoneNumber: string) => {
            if (rangeContext) {
                trackPhoneClick(rangeContext, phoneNumber);
            }
        },
        [rangeContext]
    );

    const onEmailClick = useCallback(
        (email: string) => {
            if (rangeContext) {
                trackEmailClick(rangeContext, email);
            }
        },
        [rangeContext]
    );

    const onWebsiteClick = useCallback(
        (websiteUrl: string) => {
            if (rangeContext) {
                trackWebsiteClick(rangeContext, websiteUrl);
            }
        },
        [rangeContext]
    );

    const onGetDirectionsClick = useCallback(() => {
        if (rangeContext) {
            trackGetDirectionsClick(rangeContext);
        }
    }, [rangeContext]);

    const onAppleMapsClick = useCallback(() => {
        if (rangeContext) {
            trackAppleMapsClick(rangeContext);
        }
    }, [rangeContext]);

    const onClaimListingClick = useCallback(() => {
        if (rangeContext) {
            trackClaimListingClick(rangeContext);
        }
    }, [rangeContext]);

    // General events (don't require range context)
    const onSearch = useCallback((query: string) => {
        trackSearch(query);
    }, []);

    const onFilterApplied = useCallback((filterType: string, filterValue: string) => {
        trackFilterApplied(filterType, filterValue);
    }, []);

    const onProvinceSelected = useCallback((provinceName: string) => {
        trackProvinceSelected(provinceName);
    }, []);

    return {
        // Page tracking
        trackPage,
        // Listing events
        onPhoneClick,
        onEmailClick,
        onWebsiteClick,
        onGetDirectionsClick,
        onAppleMapsClick,
        onClaimListingClick,
        // General events
        onSearch,
        onFilterApplied,
        onProvinceSelected,
        // Context for child components
        rangeContext,
    };
}

export type UseAnalyticsReturn = ReturnType<typeof useAnalytics>;
