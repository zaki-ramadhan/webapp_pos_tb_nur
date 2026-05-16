import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { SIMPLE_MASTER_BACKEND_CONFIG } from '@/features/workspace/backend/workspaceBackendAdapters';
import SimpleMasterFormView from './simple-master/SimpleMasterFormView';
import SimpleMasterTableView from './simple-master/SimpleMasterTableView';

export default function SimpleMasterView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const backendConfig = SIMPLE_MASTER_BACKEND_CONFIG[page.id] ?? null;
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: backendConfig?.resource,
        filters: {
            per_page: 100,
        },
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
            },
        };
    }, [backendConfig, error, loading, page, reload, rows, total]);

    return mode === 'table' ? (
        <SimpleMasterTableView table={resolvedPage.table} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <SimpleMasterFormView
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
