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

        // Tampilkan data cache segera (SWR) jika ada, tetapi tetap jalankan revalidasi di background
        if (cachedEntry) {
            setPayload(cachedEntry.payload);
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

    useEffect(() => {
        if (typeof window === 'undefined') return;

        function handlePageActivated(e) {
            const { activePageId } = e.detail || {};
            if (activePageId && isResourceMatchingPageId(resource, activePageId)) {
                // Hapus cache lokal agar selalu mengambil data segar dari backend
                for (const key of globalCache.keys()) {
                    if (key.startsWith(`${resource}::`)) {
                        globalCache.delete(key);
                    }
                }
                setReloadVersion((currentValue) => currentValue + 1);
            }
        }

        window.addEventListener('workspace:page-activated', handlePageActivated);
        return () => window.removeEventListener('workspace:page-activated', handlePageActivated);
    }, [resource]);

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

function isResourceMatchingPageId(resource, pageId) {
    if (!resource || !pageId) return false;
    
    const r = resource.toLowerCase().replace(/_/g, '-');
    const p = pageId.toLowerCase().replace(/_/g, '-');
    
    if (r === p || r === `${p}s` || `${r}s` === p) {
        return true;
    }
    
    const singularize = (str) => {
        if (str.endsWith('ies')) return str.slice(0, -3) + 'y';
        if (str.endsWith('s')) return str.slice(0, -1);
        return str;
    };
    
    if (singularize(r) === singularize(p)) {
        return true;
    }
    
    const specialCases = {
        'expense-entries': 'expense-entry',
        'payroll-entries': 'payroll-entry',
        'general-journals': 'general-journal',
        'cash-payments': 'cash-payment',
        'cash-receipts': 'cash-receipt',
        'bank-transfers': 'bank-transfer',
        'sales-documents': 'sales-document',
        'sales-receipts': 'sales-receipt',
        'purchase-payments': 'purchase-payment',
        'item-requests': 'item-request',
        'inventory-adjustments': 'inventory-adjustment',
        'inventory-inquiries': 'inventory-inquiry',
        'items-services': 'items-services',
        'departments': 'department',
        'accounts': 'accounts',
        'employees': 'employee',
        'business-partners': 'customers',
        'partners': 'customers',
    };
    
    if (specialCases[r] === p || specialCases[p] === r) {
        return true;
    }
    
    if (p === 'customers' || p === 'suppliers') {
        if (r === 'business-partners' || r === 'partners' || r === 'customers' || r === 'suppliers') {
            return true;
        }
    }
    
    if (r.includes(p) || p.includes(r)) {
        return true;
    }
    
    return false;
}
