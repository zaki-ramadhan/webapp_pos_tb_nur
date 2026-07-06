import { useEffect, useRef, useState, useMemo } from 'react';
import { getBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import {
    showLoadingToast,
    updateToastToSuccess,
    updateToastToError,
    dismissToast,
    showErrorToast,
} from '@/components/feedback/toast';

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

        // 1. Check in-memory cache first (survives HMR, not page refresh)
        if (window.__savedRecordsCache?.[normalizedRecordId]) {
            setLocalRecord(window.__savedRecordsCache[normalizedRecordId]);
            return;
        }

        // 2. Check if config has it in rowMap (opening from view data page)
        const row = configRef.current?.rowMap?.[normalizedRecordId];
        if (row?.__backendRecord) {
            const parsed = buildRecordRef.current
                ? buildRecordRef.current(row.__backendRecord, configRef.current)
                : row.__backendRecord;
            setLocalRecord(parsed);
            return;
        }

        // 3. Check if config has it in detailRecords
        const detailRecord = configRef.current?.detailRecords?.[normalizedRecordId];
        if (detailRecord) {
            setLocalRecord(detailRecord);
            return;
        }

        let active = true;
        setIsLoading(true);

        const shouldShowToast = isResourceActive(resourceName);

        // Delay showing the loading toast slightly (150ms) to prevent flash of loading toasts
        // on fast network requests and eliminate double toasts from React double-mounting effects.
        let toastId = null;
        let toastTimer = null;

        if (shouldShowToast) {
            toastTimer = setTimeout(() => {
                if (active) {
                    toastId = showLoadingToast({
                        title: 'Memuat data',
                        message: 'Memuat data...'
                    });
                }
            }, 150);
        }

        async function load() {
            try {
                const response = await getBackendResource(resourceName, normalizedRecordId);
                if (!active) {
                    if (toastTimer) clearTimeout(toastTimer);
                    if (toastId) dismissToast(toastId);
                    return;
                }

                if (toastTimer) clearTimeout(toastTimer);

                if (response) {
                    const parsed = buildRecordRef.current
                        ? buildRecordRef.current(response, configRef.current)
                        : response;
                    
                    window.__savedRecordsCache = window.__savedRecordsCache || {};
                    window.__savedRecordsCache[String(normalizedRecordId)] = parsed;

                    // Update toast immediately so animation starts smoothly
                    if (shouldShowToast && toastId) {
                        updateToastToSuccess(toastId, {
                            title: 'Berhasil',
                            message: 'Data berhasil dimuat.'
                        });
                    } else if (shouldShowToast) {
                        // Dismiss loader if toastTimer was not fired yet
                        dismissToast(toastId);
                    }

                    // Defer the heavy React state update slightly (50ms) so that
                    // the toast transition completes smoothly without thread blocking.
                    setTimeout(() => {
                        if (active) {
                            setLocalRecord(parsed);
                        }
                    }, 50);
                } else {
                    if (toastId) dismissToast(toastId);
                }
            } catch (e) {
                console.error(e);
                if (toastTimer) clearTimeout(toastTimer);
                if (active) {
                    if (shouldShowToast) {
                        if (toastId) {
                            updateToastToError(toastId, {
                                title: 'Gagal',
                                message: 'Gagal memuat data.'
                            });
                        } else {
                            showErrorToast({
                                title: 'Gagal',
                                message: 'Gagal memuat data.'
                            });
                        }
                    }
                } else {
                    if (toastId) dismissToast(toastId);
                }
            } finally {
                if (active) setIsLoading(false);
            }
        }

        load();

        return () => {
            active = false;
            if (toastTimer) clearTimeout(toastTimer);
            if (toastId) dismissToast(toastId);
        };
        // Only re-fetch when the identity of the record changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [normalizedRecordId, resourceName]);

    const sourceRecord = useMemo(() => {
        if (localRecord) {
            return localRecord;
        }

        if (normalizedRecordId) {
            if (window.__savedRecordsCache?.[normalizedRecordId]) {
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
