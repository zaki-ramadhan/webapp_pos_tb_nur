import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { SIMPLE_MASTER_BACKEND_CONFIG } from '@/features/workspace/backend/workspaceBackendAdapters';
import SimpleMasterFormView from './simple-master/SimpleMasterFormView';
import SimpleMasterTableView from './simple-master/SimpleMasterTableView';

export default function SimpleMasterView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const backendConfig = SIMPLE_MASTER_BACKEND_CONFIG[page.id] ?? null;
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
        to,
    } = useBackendIndexResource({
        resource: backendConfig?.resource,
        initialPerPage: 25,
        enabled: Boolean(backendConfig),
    });

    const resolvedPage = useMemo(() => {
        if (!backendConfig) {
            return page;
        }

        const mappedRows = rows.map((row) => backendConfig.toRow(row));

        return {
            ...page,
            table: {
                ...page.table,
                rows: mappedRows,
                pageValue: total.toLocaleString('id-ID'),
                loading,
                refreshLabel: loading ? 'Memuat data...' : page.table?.refreshLabel,
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
    }, [backendConfig, error, loading, page, reload, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

    return mode === 'table' ? (
        <SimpleMasterTableView table={resolvedPage.table} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <SimpleMasterFormView
            key={activeLevel2Tab?.id ?? 'new'}
            page={resolvedPage}
            activeLevel2Tab={activeLevel2Tab}
            backendConfig={backendConfig}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
