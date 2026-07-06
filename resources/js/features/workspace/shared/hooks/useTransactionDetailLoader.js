import { useEffect, useRef, useState, useMemo } from 'react';
import { getBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import {
    showLoadingToast,
    updateToastToSuccess,
    updateToastToError,
    dismissToast,
} from '@/components/feedback/toast';

export function useTransactionDetailLoader({ resourceName, activeRecordId, buildRecord, config }) {
    const [localRecord, setLocalRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Refs so the async closure always uses latest values
    // without making config/buildRecord trigger a new fetch
    const configRef = useRef(config);
    const buildRecordRef = useRef(buildRecord);
    useEffect(() => { configRef.current = config; }, [config]);
    useEffect(() => { buildRecordRef.current = buildRecord; }, [buildRecord]);

    const lastRecordIdRef = useRef(activeRecordId);

    useEffect(() => {
        // Only clear if the record ID itself has changed (switching to another document).
        if (lastRecordIdRef.current !== activeRecordId) {
            setLocalRecord(null);
            lastRecordIdRef.current = activeRecordId;
        }

        if (!activeRecordId) {
            return;
        }

        // 1. Check in-memory cache first (survives HMR, not page refresh)
        if (window.__savedRecordsCache?.[activeRecordId]) {
            setLocalRecord(window.__savedRecordsCache[activeRecordId]);
            return;
        }

        // 2. Check if config has it in rowMap (opening from view data page)
        const row = configRef.current?.rowMap?.[activeRecordId];
        if (row?.__backendRecord) {
            const parsed = buildRecordRef.current
                ? buildRecordRef.current(row.__backendRecord, configRef.current)
                : row.__backendRecord;
            setLocalRecord(parsed);
            return;
        }

        // 3. Check if config has it in detailRecords
        const detailRecord = configRef.current?.detailRecords?.[activeRecordId];
        if (detailRecord) {
            setLocalRecord(detailRecord);
            return;
        }

        let active = true;
        setIsLoading(true);

        const toastId = showLoadingToast({
            title: 'Memuat data',
            message: 'Memuat data...'
        });

        async function load() {
            try {
                const response = await getBackendResource(resourceName, activeRecordId);
                if (!active) {
                    dismissToast(toastId);
                    return;
                }
                if (response) {
                    const parsed = buildRecordRef.current
                        ? buildRecordRef.current(response, configRef.current)
                        : response;
                    setLocalRecord(parsed);
                    window.__savedRecordsCache = window.__savedRecordsCache || {};
                    window.__savedRecordsCache[String(activeRecordId)] = parsed;

                    updateToastToSuccess(toastId, {
                        title: 'Berhasil',
                        message: 'Data berhasil dimuat.'
                    });
                } else {
                    dismissToast(toastId);
                }
            } catch (e) {
                console.error(e);
                if (active) {
                    updateToastToError(toastId, {
                        title: 'Gagal',
                        message: 'Gagal memuat data.'
                    });
                } else {
                    dismissToast(toastId);
                }
            } finally {
                if (active) setIsLoading(false);
            }
        }

        load();

        return () => {
            active = false;
            dismissToast(toastId);
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
