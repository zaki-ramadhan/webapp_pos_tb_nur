import { useEffect, useRef, useState, useMemo } from 'react';
import { getBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import {
    showLoadingToast,
    updateToastToSuccess,
    updateToastToError,
    dismissToast,
    showErrorToast,
} from '@/components/feedback/toast';

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

        // Delay showing the loading toast slightly (150ms) to prevent flash of loading toasts
        // on fast network requests and eliminate double toasts from React double-mounting effects.
        let toastId = null;
        const toastTimer = setTimeout(() => {
            if (active) {
                toastId = showLoadingToast({
                    title: 'Memuat data',
                    message: 'Memuat data...'
                });
            }
        }, 150);

        async function load() {
            try {
                const response = await getBackendResource(resourceName, normalizedRecordId);
                if (!active) {
                    clearTimeout(toastTimer);
                    if (toastId) dismissToast(toastId);
                    return;
                }

                clearTimeout(toastTimer);

                if (response) {
                    const parsed = buildRecordRef.current
                        ? buildRecordRef.current(response, configRef.current)
                        : response;
                    setLocalRecord(parsed);
                    window.__savedRecordsCache = window.__savedRecordsCache || {};
                    window.__savedRecordsCache[String(normalizedRecordId)] = parsed;

                    if (toastId) {
                        updateToastToSuccess(toastId, {
                            title: 'Berhasil',
                            message: 'Data berhasil dimuat.'
                        });
                    }
                } else {
                    if (toastId) dismissToast(toastId);
                }
            } catch (e) {
                console.error(e);
                clearTimeout(toastTimer);
                if (active) {
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
            clearTimeout(toastTimer);
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
