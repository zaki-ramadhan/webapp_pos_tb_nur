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
        // If it's the same ID, keep the old values so we don't blink/go blank during refresh.
        if (lastRecordIdRef.current !== activeRecordId) {
            setLocalRecord(null);
            lastRecordIdRef.current = activeRecordId;
        }

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

        const toastId = showLoadingToast({
            title: 'Memuat Rincian',
            message: 'Sedang mengambil data terbaru dari server...'
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
                        message: 'Rincian data berhasil diperbarui.'
                    });
                } else {
                    dismissToast(toastId);
                }
            } catch (e) {
                console.error(e);
                if (active) {
                    updateToastToError(toastId, {
                        title: 'Gagal',
                        message: 'Gagal mengambil rincian data terbaru.'
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
