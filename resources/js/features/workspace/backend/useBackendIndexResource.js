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

export default function useBackendIndexResource({
    resource,
    filters = {},
    enabled = true,
    initialPerPage = 25,
}) {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(initialPerPage);
    const [payload, setPayload] = useState(null);
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

    useEffect(() => {
        if (!enabled || !resource) {
            return undefined;
        }

        let active = true;

        async function run() {
            setLoading(true);
            setError('');

            try {
                const nextPayload = await listBackendResource(resource, requestFilters);

                if (!active) {
                    return;
                }

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
