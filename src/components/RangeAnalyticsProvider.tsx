'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { RangeContext, trackPageView } from '@/lib/analytics';
import { useAnalytics, UseAnalyticsReturn } from '@/hooks/useAnalytics';

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const AnalyticsContext = createContext<UseAnalyticsReturn | null>(null);

// -----------------------------------------------------------------------------
// Provider Props
// -----------------------------------------------------------------------------

interface RangeAnalyticsProviderProps {
    children: ReactNode;
    rangeId: string;
    rangeName: string;
    province?: string;
    city?: string;
}

// -----------------------------------------------------------------------------
// Provider Component
// -----------------------------------------------------------------------------

export function RangeAnalyticsProvider({
    children,
    rangeId,
    rangeName,
    province,
    city,
}: RangeAnalyticsProviderProps) {
    const rangeContext: RangeContext = {
        range_id: rangeId,
        range_name: rangeName,
        province,
        city,
    };

    const analytics = useAnalytics(rangeContext);

    // Track page view on mount
    useEffect(() => {
        const pagePath = typeof window !== 'undefined' ? window.location.pathname : '';
        trackPageView(pagePath, rangeContext);
    }, [rangeId]); // Re-track if range changes

    return (
        <AnalyticsContext.Provider value={analytics}>
            {children}
        </AnalyticsContext.Provider>
    );
}

// -----------------------------------------------------------------------------
// Hook to consume context
// -----------------------------------------------------------------------------

export function useRangeAnalytics(): UseAnalyticsReturn {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useRangeAnalytics must be used within RangeAnalyticsProvider');
    }
    return context;
}
