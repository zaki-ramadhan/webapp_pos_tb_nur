import { useEffect, useMemo, useState } from 'react';
import { showErrorToast } from '@/components/feedback/toast';

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

// Cache global SWR
const globalCache = new Map();
const CACHE_FRESH_THRESHOLD_MS = 5000;

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

    // Reset ke halaman 1 jika filter berubah
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

    // Ambil cache awal jika ada
    const [payload, setPayload] = useState(() => {
        const cached = globalCache.get(cacheKey);
        return cached ? cached.payload : null;
    });

    // Sinkronisasi state cacheKey
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

        // Hapus cache jika force refresh
        if (isForceRefresh) {
            for (const key of globalCache.keys()) {
                if (key.startsWith(`${resource}::`)) {
                    globalCache.delete(key);
                }
            }
        }

        // Lewati fetch jika cache segar
        if (isFresh && !isForceRefresh) {
            setPayload(cachedEntry.payload);
            setLoading(false);
            return undefined;
        }

        async function run() {
            // Tampilkan loading spinner
            if (!cachedEntry || isForceRefresh) {
                setLoading(true);
            }
            setError('');

            try {
                const nextPayload = await listBackendResource(resource, requestFilters);

                if (!active) {
                    return;
                }

                // Perbarui cache
                globalCache.set(currentCacheKey, {
                    payload: nextPayload,
                    timestamp: Date.now(),
                });

                setPayload(nextPayload);
            } catch (requestError) {
                if (!active) {
                    return;
                }

                const errorMsg = getBackendErrorMessage(requestError);
                setError(errorMsg);
                if (isForceRefresh) {
                    showErrorToast({
                        title: 'Refresh Gagal',
                        message: errorMsg,
                    });
                }
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
            
            // Cek kecocokan nama resource
            // atau jika token cocok
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
