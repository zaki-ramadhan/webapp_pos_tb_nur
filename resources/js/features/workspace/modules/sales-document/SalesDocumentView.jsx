import { useEffect, useMemo, useState } from 'react';

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
    activeLevel2Tab, level2Tabs = [],
    onOpenContent,
    onOpenDetail,
    onCloseDetail,}) {
    const backendConfig = OPERATION_DOCUMENT_BACKEND_CONFIG[pageId] ?? null;
    const {
        rows,
        total,
        loading,
        error,
        reload,
        page: currentPage,
        perPage,
        setPage,
        setPerPage,
        lastPage,
        from,
        to
    } = useBackendIndexResource({
        resource: backendConfig?.resource,
        initialPerPage: 25,
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
                loading,
                refreshLabel: config.table?.refreshLabel || 'Muat ulang',
                emptyLabel: error || 'Belum ada data',
                onRefresh: reload,
                pagination: {
                    page: currentPage,
                    perPage,
                    total,
                    lastPage,
                    from,
                    to,
                    onPageChange: setPage,
                    onPerPageChange: setPerPage,
                },
            },
        };
    }, [backendConfig, config, error, loading, pageId, reload, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

    const resolvedBuildRecord = useMemo(
        () => (row = {}) => {
            if (backendConfig) {
                const backendRecord = row.__backendRecord ?? (row.entry_date || row.document_number ? row : null);
                if (backendRecord) {
                    const parsed = buildOperationDocumentRecord(backendRecord, resolvedConfig, pageId);
                    const baseRecord = buildRecord(row);
                    return {
                        ...baseRecord,
                        ...parsed,
                        dockActions: baseRecord.dockActions ?? parsed.dockActions,
                    };
                }
            }

            return buildRecord(row);
        },
        [backendConfig, buildRecord, pageId, resolvedConfig],
    );

        const [lastActiveFormTab, setLastActiveFormTab] = useState(null);

    useEffect(() => {
        if (activeLevel2Tab && activeLevel2Tab.kind === 'content') {
            setLastActiveFormTab(activeLevel2Tab);
        } else if (!activeLevel2Tab) {
            setLastActiveFormTab(null);
        }
    }, [activeLevel2Tab]);

    return (
        <div className="flex flex-1 flex-col min-h-0 w-full h-full relative">
            <div className={mode === 'table' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                <SalesDocumentTableView config={resolvedConfig} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
            </div>
            {level2Tabs.map((tab) => {
                if (tab.kind !== 'content') return null;

                const isCurrentForm = mode === 'form' && activeLevel2Tab?.id === tab.id;

                return (
                    <div
                        key={tab.id}
                        className={isCurrentForm ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}
                    >
                        <SalesDocumentFormView
                            key={tab.id}
                        pageId={pageId}
                        config={resolvedConfig}
                        buildRecord={resolvedBuildRecord}
                        activeLevel2Tab={tab}
                        backendConfig={backendConfig}
                        onOpenContent={onOpenContent}
                        onOpenDetail={onOpenDetail}
                        onCloseDetail={onCloseDetail}
                        onRefresh={reload}
                        />
                    </div>
                );
            })}
        </div>
    );
}
