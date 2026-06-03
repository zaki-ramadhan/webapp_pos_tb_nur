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
}) {
    const [payload, setPayload] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reloadVersion, setReloadVersion] = useState(0);
    const serializedFilters = JSON.stringify(filters ?? {});
    const normalizedFilters = useMemo(() => sanitizeFilters(filters), [serializedFilters]);
    const requestFilters = useMemo(() => {
        if (reloadVersion < 1) {
            return normalizedFilters;
        }

        return {
            ...normalizedFilters,
            _refresh: reloadVersion,
        };
    }, [normalizedFilters, reloadVersion]);

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
    };
}
