import { useEffect, useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';

import {
    extractBackendRows,
    extractBackendTotal,
    getBackendErrorMessage,
    listBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { isOwnerUser } from '@/features/workspace/backend/adapters/generalAdapters';

function sanitizeFilters(filters = {}) {
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ''),
    );
}

// Cache global SWR
const globalCache = new Map();
const CACHE_FRESH_THRESHOLD_MS = 5000;

const HELPER_LOOKUP_RESOURCES = new Set([
    'units',
    'brands',
    'product-categories',
    'customer-categories',
    'supplier-categories',
    'payment-terms',
    'taxes',
    'item-locations',
    'chart-of-accounts',
]);

function getCacheKey(resource, filters) {
    return `${resource}::${JSON.stringify(filters)}`;
}

// Singleton listener untuk live updates agar tidak ada duplikasi request polling
let liveUpdateSubscribers = new Set();
let globalLiveUpdateInterval = null;
let lastGlobalSeenTimestamp = 0;

function subscribeToLiveUpdates(callback) {
    liveUpdateSubscribers.add(callback);

    if (!globalLiveUpdateInterval && typeof window !== 'undefined') {
        globalLiveUpdateInterval = setInterval(async () => {
            if (liveUpdateSubscribers.size === 0) return;
            try {
                const res = await fetch('/api/backend/live-updates', {
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                });
                if (res.ok) {
                    const data = await res.json();
                    const change = data?.change;
                    if (change && change.timestamp && change.timestamp > lastGlobalSeenTimestamp) {
                        if (lastGlobalSeenTimestamp > 0) {
                            liveUpdateSubscribers.forEach((cb) => cb(change));
                        }
                        lastGlobalSeenTimestamp = change.timestamp;
                    }
                }
            } catch {
              // Abaikan kesalahan koneksi sementara

            }
        }, 10000);
    }

    return () => {
        liveUpdateSubscribers.delete(callback);
        if (liveUpdateSubscribers.size === 0 && globalLiveUpdateInterval) {
            clearInterval(globalLiveUpdateInterval);
            globalLiveUpdateInterval = null;
        }
    };
}

export default function useBackendIndexResource({
    resource,
    filters = {},
    enabled = true,
    initialPerPage = 25,
}) {
    const inertiaPage = usePage();
    const authUser = inertiaPage?.props?.auth?.user ?? null;
    const isSuperAdmin = isOwnerUser(authUser);

    const resourceAbility = authUser?.abilities?.[resource] ?? null;
    const isForbiddenInstantly = Boolean(
        enabled &&
        resource &&
        !isSuperAdmin &&
        (resourceAbility === null || resourceAbility?.view === false)
    );

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(initialPerPage);
    const [search, setSearchState] = useState('');
    const [sortBy, setSortByState] = useState('');
    const [sortDirection, setSortDirectionState] = useState('asc');

    const setSearch = (nextSearch) => {
        setSearchState(nextSearch ?? '');
        setPage(1);
    };

    const setSort = (columnId, direction) => {
        if (!columnId) {
            setSortByState('');
            setSortDirectionState('asc');
            return;
        }
        setSortByState(columnId);
        if (direction) {
            setSortDirectionState(direction);
        } else {
            setSortDirectionState((prev) => (sortBy === columnId ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'));
        }
    };

    const [loading, setLoading] = useState(() => {
        if (!enabled || !resource || isForbiddenInstantly) return false;
        const initialFilters = {
            ...sanitizeFilters(filters),
            page: 1,
            per_page: initialPerPage,
        };
        const key = getCacheKey(resource, initialFilters);
        const cached = globalCache.get(key);
        return !cached;
    });
    const [error, setError] = useState(() => isForbiddenInstantly ? 'Anda tidak memiliki hak akses ke halaman ini. Hubungi Owner untuk menambahkan akses.' : '');
    const [reloadVersion, setReloadVersion] = useState(0);
    const [revalidateVersion, setRevalidateVersion] = useState(0);
    const [payload, setPayload] = useState(null);
    const [prevCacheKey, setPrevCacheKey] = useState('');

    const serializedFilters = JSON.stringify(filters ?? {});
    const normalizedFilters = useMemo(() => sanitizeFilters(filters), [serializedFilters]);
    const requestFilters = useMemo(() => {
        const base = {
            ...normalizedFilters,
            ...(search.trim() ? { search: search.trim() } : {}),
            ...(sortBy ? { sort_by: sortBy, sort_direction: sortDirection } : {}),
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
    }, [normalizedFilters, search, sortBy, sortDirection, page, perPage, reloadVersion]);

    const cacheKey = useMemo(() => getCacheKey(resource, requestFilters), [resource, requestFilters]);

  // Sinkronisasi state cacheKey jika berubah

    if (cacheKey !== prevCacheKey) {
        setPrevCacheKey(cacheKey);
        const cached = globalCache.get(cacheKey);
        setPayload(cached ? cached.payload : null);
    }

  // Reset ke halaman 1 jika filter berubah

    useEffect(() => {
        setPage(1);
    }, [serializedFilters]);

    useEffect(() => {
        if (!enabled || !resource || isForbiddenInstantly) {
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

      // Tampilkan data cache segera (SWR) jika ada

        if (cachedEntry) {
            setPayload(cachedEntry.payload);
        }

      // Jika cache masih segar dan bukan force-refresh, lewati revalidasi backend

        if (isFresh && !isForceRefresh) {
            return undefined;
        }

        async function run() {
            if (!cachedEntry || isForceRefresh) {
                setLoading(true);
            }
            setError('');

            try {
                const nextPayload = await listBackendResource(resource, requestFilters);

                if (!active) return;

                globalCache.set(currentCacheKey, {
                    payload: nextPayload,
                    timestamp: Date.now(),
                });

                setPayload(nextPayload);
            } catch (requestError) {
                const errorMsg = getBackendErrorMessage(requestError);
                if (!active) return;
                setError(errorMsg);
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
    }, [enabled, requestFilters, resource, revalidateVersion]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        function handlePageActivated(e) {
            const { activePageId } = e.detail || {};
            if (activePageId && isResourceMatchingPageId(resource, activePageId)) {
              // Trigger reaktivasi/revalidasi di background tanpa menghapus cache

                setRevalidateVersion((currentValue) => currentValue + 1);
            }
        }

        window.addEventListener('workspace:page-activated', handlePageActivated);
        return () => window.removeEventListener('workspace:page-activated', handlePageActivated);
    }, [resource]);

  // Real-time live update sync via singleton listener

    useEffect(() => {
        if (!enabled || !resource || typeof window === 'undefined') return;

        return subscribeToLiveUpdates(() => {
            setRevalidateVersion((v) => v + 1);
        });
    }, [enabled, resource]);

    const rows = useMemo(() => isForbiddenInstantly ? [] : extractBackendRows(payload), [payload, isForbiddenInstantly]);
    const total = useMemo(() => isForbiddenInstantly ? 0 : extractBackendTotal(payload), [payload, isForbiddenInstantly]);

    const serverPaginationProps = useMemo(() => ({
        page,
        perPage,
        total,
        lastPage: payload?.last_page ?? 1,
        from: payload?.from ?? 0,
        to: payload?.to ?? 0,
        onPageChange: setPage,
        onPerPageChange: setPerPage,
        search,
        onSearch: setSearch,
        sortBy,
        sortDirection,
        onSort: setSort,
    }), [page, perPage, total, payload?.last_page, payload?.from, payload?.to, setPage, setPerPage, search, setSearch, sortBy, sortDirection, setSort]);

    const serverTableProps = useMemo(() => ({
        search,
        onSearch: setSearch,
        sortBy,
        sortDirection,
        onSort: setSort,
        pagination: serverPaginationProps,
    }), [search, setSearch, sortBy, sortDirection, setSort, serverPaginationProps]);

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
        search,
        setSearch,
        sortBy,
        sortDirection,
        setSort,
        serverTableProps,
        serverPaginationProps,
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
