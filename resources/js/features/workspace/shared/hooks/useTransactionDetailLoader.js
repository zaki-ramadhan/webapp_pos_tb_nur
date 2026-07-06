import { useEffect, useRef, useState, useMemo } from 'react';
import { getBackendResource } from '@/features/workspace/backend/workspaceBackendApi';

export function useTransactionDetailLoader({ resourceName, activeRecordId, buildRecord, config }) {
    const [localRecord, setLocalRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Refs so the async closure always uses latest values
    // without making config/buildRecord trigger a new fetch
    const configRef = useRef(config);
    const buildRecordRef = useRef(buildRecord);
    useEffect(() => { configRef.current = config; }, [config]);
    useEffect(() => { buildRecordRef.current = buildRecord; }, [buildRecord]);

    useEffect(() => {
        setLocalRecord(null);
        if (!activeRecordId) {
            return;
        }

        // Check in-memory cache first (survives HMR, not page refresh)
        if (window.__savedRecordsCache?.[activeRecordId]) {
            setLocalRecord(window.__savedRecordsCache[activeRecordId]);
            return;
        }

        let active = true;
        setIsLoading(true);

        async function load() {
            try {
                const response = await getBackendResource(resourceName, activeRecordId);
                if (!active) return;
                if (response) {
                    const parsed = buildRecordRef.current
                        ? buildRecordRef.current(response, configRef.current)
                        : response;
                    setLocalRecord(parsed);
                    window.__savedRecordsCache = window.__savedRecordsCache || {};
                    window.__savedRecordsCache[String(activeRecordId)] = parsed;
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (active) setIsLoading(false);
            }
        }

        load();

        return () => {
            active = false;
        };
        // Only re-fetch when the identity of the record changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeRecordId, resourceName]);

    const sourceRecord = useMemo(() => {
        if (localRecord) {
            return localRecord;
        }

        if (activeRecordId) {
            if (window.__savedRecordsCache?.[activeRecordId]) {
                return window.__savedRecordsCache[activeRecordId];
            }

            const row = config?.rowMap?.[activeRecordId];
            if (row?.__backendRecord && buildRecord) {
                return buildRecord(row.__backendRecord, config);
            }

            return config?.records?.[activeRecordId] ?? config?.detailRecords?.[activeRecordId] ?? config?.draft ?? config?.defaults;
        }

        return config?.draft ?? config?.defaults;
    }, [activeRecordId, config, localRecord, buildRecord]);

    return [sourceRecord, setLocalRecord, isLoading];
}
