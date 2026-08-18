import { useEffect, useRef, useState, useMemo } from 'react';
import { getBackendResource } from '@/features/workspace/backend/workspaceBackendApi';

function normalizeName(name) {
    if (!name) return '';
    return name
        .toLowerCase()
        .replace(/-/g, '')
        .replace(/ies$/, 'y')
        .replace(/s$/, '');
}

/**
 * Check if the resource loading belongs to the currently active page.
 * Prevents background tabs from displaying toast notifications.
 */
function isResourceActive(resourceName) {
    if (typeof window === 'undefined') return true;
    const activePageId = window.__activePageId;
    if (!activePageId) return true;

    const cleanResource = normalizeName(resourceName);
    const cleanPage = normalizeName(activePageId);

    return cleanResource === cleanPage || cleanResource.includes(cleanPage) || cleanPage.includes(cleanResource);
}

export function useTransactionDetailLoader({ resourceName, activeRecordId, buildRecord, config }) {
    const [localRecord, setLocalRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

  // Normalize activeRecordId to string to prevent string/number type switching from triggering useEffect twice

    const normalizedRecordId = activeRecordId !== null && activeRecordId !== undefined ? String(activeRecordId) : null;

  // Refs so the async closure always uses latest values

  // without making config/buildRecord trigger a new fetch

    const configRef = useRef(config);
    const buildRecordRef = useRef(buildRecord);
    useEffect(() => { configRef.current = config; }, [config]);
    useEffect(() => { buildRecordRef.current = buildRecord; }, [buildRecord]);

    const lastRecordIdRef = useRef(normalizedRecordId);

    useEffect(() => {
      // Only clear if the record ID itself has changed (switching to another document).

        if (lastRecordIdRef.current !== normalizedRecordId) {
            setLocalRecord(null);
            lastRecordIdRef.current = normalizedRecordId;
        }

        if (!normalizedRecordId) {
            return;
        }

        // 1. Initial optimistic paint from rowMap or cache
        const row = configRef.current?.rowMap?.[normalizedRecordId];
        if (row?.__backendRecord && buildRecordRef.current) {
            setLocalRecord(buildRecordRef.current(row.__backendRecord, configRef.current));
        } else if (window.__savedRecordsCache?.[normalizedRecordId] && window.__savedRecordsCache[normalizedRecordId]?.dockActions?.length) {
            setLocalRecord(window.__savedRecordsCache[normalizedRecordId]);
        } else if (configRef.current?.detailRecords?.[normalizedRecordId]) {
            setLocalRecord(configRef.current.detailRecords[normalizedRecordId]);
        }

        let active = true;
        setIsLoading(true);

        async function load() {
            try {
                const response = await getBackendResource(resourceName, normalizedRecordId);
                if (!active) return;

                if (response) {
                    const parsed = buildRecordRef.current
                        ? buildRecordRef.current(response, configRef.current)
                        : response;

                    window.__savedRecordsCache = window.__savedRecordsCache || {};
                    window.__savedRecordsCache[String(normalizedRecordId)] = parsed;

                    setLocalRecord(parsed);
                }
            } catch (e) {
                // Ignore error in silent loader
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        load();

        return () => {
            active = false;
        };
      // Only re-fetch when the identity of the record changes

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [normalizedRecordId, resourceName]);

    const sourceRecord = useMemo(() => {
        if (localRecord) {
            return localRecord;
        }

        if (normalizedRecordId) {
            if (window.__savedRecordsCache?.[normalizedRecordId] && window.__savedRecordsCache[normalizedRecordId]?.dockActions?.length) {
                return window.__savedRecordsCache[normalizedRecordId];
            }

            const row = config?.rowMap?.[normalizedRecordId];
            if (row?.__backendRecord && buildRecord) {
                return buildRecord(row.__backendRecord, config);
            }

            return config?.records?.[normalizedRecordId] ?? config?.detailRecords?.[normalizedRecordId] ?? config?.draft ?? config?.defaults;
        }

        return config?.draft ?? config?.defaults;
    }, [normalizedRecordId, config, localRecord, buildRecord]);

    return [sourceRecord, setLocalRecord, isLoading];
}
