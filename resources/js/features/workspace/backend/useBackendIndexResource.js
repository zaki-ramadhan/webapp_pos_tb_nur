import { useEffect, useMemo, useState } from 'react';

import {
    extractBackendRows,
    extractBackendTotal,
    getBackendErrorMessage,
    listBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';

function sanitizeFilters(filters = {}) {
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ''),
    );
}

// Global cache for SWR (Stale-While-Revalidate) mechanism
const globalCache = new Map();
const CACHE_FRESH_THRESHOLD_MS = 5000; // 5 seconds freshness

function getCacheKey(resource, filters) {
    return `${resource}::${JSON.stringify(filters)}`;
}

export default function useBackendIndexResource({
    resource,
    filters = {},
    enabled = true,
    initialPerPage = 25,
}) {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(initialPerPage);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reloadVersion, setReloadVersion] = useState(0);
    const serializedFilters = JSON.stringify(filters ?? {});

    // Reset page to 1 when filters change (like search keywords)
    useEffect(() => {
        setPage(1);
    }, [serializedFilters]);

    const normalizedFilters = useMemo(() => sanitizeFilters(filters), [serializedFilters]);
    const requestFilters = useMemo(() => {
        const base = {
            ...normalizedFilters,
            page,
            per_page: perPage,
        };

        if (reloadVersion < 1) {
            return base;
        }

        return {
            ...base,
            _refresh: reloadVersion,
        };
    }, [normalizedFilters, page, perPage, reloadVersion]);

    const cacheKey = useMemo(() => getCacheKey(resource, requestFilters), [resource, requestFilters]);

    // Initialize payload from cache if available
    const [payload, setPayload] = useState(() => {
        const cached = globalCache.get(cacheKey);
        return cached ? cached.payload : null;
    });

    // Derive state from cacheKey during render to sync payload immediately when key changes
    const [prevCacheKey, setPrevCacheKey] = useState(cacheKey);
    if (cacheKey !== prevCacheKey) {
        setPrevCacheKey(cacheKey);
        const cached = globalCache.get(cacheKey);
        setPayload(cached ? cached.payload : null);
    }

    useEffect(() => {
        if (!enabled || !resource) {
            return undefined;
        }

        let active = true;
        const currentCacheKey = getCacheKey(resource, requestFilters);
        const cachedEntry = globalCache.get(currentCacheKey);
        const now = Date.now();

        const isForceRefresh = requestFilters._refresh !== undefined;
        const isFresh = cachedEntry && (now - cachedEntry.timestamp < CACHE_FRESH_THRESHOLD_MS);

        // If force refresh is triggered, invalidate cache for this entire resource
        if (isForceRefresh) {
            for (const key of globalCache.keys()) {
                if (key.startsWith(`${resource}::`)) {
                    globalCache.delete(key);
                }
            }
        }

        // Skip fetch if cache is fresh and not forced
        if (isFresh && !isForceRefresh) {
            setPayload(cachedEntry.payload);
            setLoading(false);
            return undefined;
        }

        async function run() {
            // Show loading spinner only if we don't have cached data OR it is a force refresh
            if (!cachedEntry || isForceRefresh) {
                setLoading(true);
            }
            setError('');

            try {
                const nextPayload = await listBackendResource(resource, requestFilters);

                if (!active) {
                    return;
                }

                // Update cache
                globalCache.set(currentCacheKey, {
                    payload: nextPayload,
                    timestamp: Date.now(),
                });

                setPayload(nextPayload);
            } catch (requestError) {
                if (!active) {
                    return;
                }

                setError(getBackendErrorMessage(requestError));
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        run();

        return () => {
            active = false;
        };
    }, [enabled, requestFilters, resource]);

    const rows = useMemo(() => extractBackendRows(payload), [payload]);
    const total = useMemo(() => extractBackendTotal(payload), [payload]);

    return {
        payload,
        rows,
        total,
        loading,
        error,
        reload: () => setReloadVersion((currentValue) => currentValue + 1),
        page,
        perPage,
        setPage,
        setPerPage,
        lastPage: payload?.last_page ?? 1,
        from: payload?.from ?? 0,
        to: payload?.to ?? 0,
    };
}

if (typeof window !== 'undefined') {
    window.__clearBackendCache = function(pageId) {
        if (!pageId) {
            globalCache.clear();
            return;
        }

        const normalizedPageId = pageId.toLowerCase();
        const tokens = normalizedPageId.split('-');

        for (const key of globalCache.keys()) {
            const resourceName = key.split('::')[0].toLowerCase();
            
            // Check if pageId is exactly the resource name,
            // or if any of the significant tokens match the resource name
            const isMatch = resourceName.includes(normalizedPageId) || 
                            normalizedPageId.includes(resourceName) ||
                            tokens.some(token => {
                                if (token.length <= 2) return false;
                                return resourceName.includes(token) || 
                                       token.includes(resourceName) || 
                                       (resourceName.substring(0, 5) === token.substring(0, 5) && token.length >= 5);
                            });

            if (isMatch) {
                globalCache.delete(key);
            }
        }
    };
}
