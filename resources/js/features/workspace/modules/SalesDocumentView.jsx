import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import {
    buildOperationDocumentFilters,
    buildOperationDocumentRecord,
    buildOperationDocumentTableRows,
    OPERATION_DOCUMENT_BACKEND_CONFIG,
} from '@/features/workspace/backend/operationDocumentBackend';
import SalesDocumentFormView from '@/features/workspace/modules/sales-document/SalesDocumentFormView';
import SalesDocumentTableView from '@/features/workspace/modules/sales-document/SalesDocumentTableView';

export default function SalesDocumentView({
    pageId,
    config,
    buildRecord,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
}) {
    const backendConfig = OPERATION_DOCUMENT_BACKEND_CONFIG[pageId] ?? null;
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: backendConfig?.resource,
        filters: {
            per_page: 100,
        },
        enabled: Boolean(backendConfig),
    });

    const resolvedConfig = useMemo(() => {
        if (!backendConfig) {
            return config;
        }

        const mappedRows = buildOperationDocumentTableRows(pageId, rows);

        return {
            ...config,
            table: {
                ...config.table,
                rows: mappedRows,
                filters: buildOperationDocumentFilters(config.table.filters, mappedRows),
                pageValue: total.toLocaleString('id-ID'),
                refreshLabel: loading ? 'Memuat data...' : config.table.refreshLabel,
                emptyLabel: error || 'Belum ada data',
                onRefresh: reload,
            },
        };
    }, [backendConfig, config, error, loading, pageId, reload, rows, total]);

    const resolvedBuildRecord = useMemo(
        () => (row = {}) => {
            if (row.__backendRecord && backendConfig) {
                return buildOperationDocumentRecord(row.__backendRecord, resolvedConfig, pageId);
            }

            return buildRecord(row);
        },
        [backendConfig, buildRecord, pageId, resolvedConfig],
    );

    return mode === 'table' ? (
        <SalesDocumentTableView config={resolvedConfig} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <SalesDocumentFormView
            pageId={pageId}
            config={resolvedConfig}
            buildRecord={resolvedBuildRecord}
            activeLevel2Tab={activeLevel2Tab}
            backendConfig={backendConfig}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
        />
    );
}
