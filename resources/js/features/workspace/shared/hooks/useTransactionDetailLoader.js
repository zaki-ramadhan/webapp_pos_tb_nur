import { useEffect, useState, useMemo } from 'react';
import { getBackendResource } from '@/features/workspace/backend/workspaceBackendApi';

export function useTransactionDetailLoader({ resourceName, activeRecordId, buildRecord, config }) {
    const [localRecord, setLocalRecord] = useState(null);

    useEffect(() => {
        setLocalRecord(null);
        if (!activeRecordId) {
            return;
        }

        let active = true;

        async function load() {
            try {
                if (window.__savedRecordsCache?.[activeRecordId]) {
                    setLocalRecord(window.__savedRecordsCache[activeRecordId]);
                    return;
                }

                const response = await getBackendResource(resourceName, activeRecordId);
                if (!active) return;
                if (response?.data) {
                    const parsed = buildRecord ? buildRecord(response.data, config) : response.data;
                    setLocalRecord(parsed);
                    window.__savedRecordsCache = window.__savedRecordsCache || {};
                    window.__savedRecordsCache[String(activeRecordId)] = parsed;
                }
            } catch (e) {
                console.error(e);
            }
        }

        load();

        return () => {
            active = false;
        };
    }, [activeRecordId, resourceName, buildRecord, config]);

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

    return [sourceRecord, setLocalRecord];
}
