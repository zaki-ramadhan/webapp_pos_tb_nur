import { useMemo } from 'react';
import WarehouseFormView from './WarehouseFormView';
import WarehouseTableView from './WarehouseTableView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { mapWarehouseRow } from '@/features/workspace/backend/workspaceBackendAdapters';

export default function WarehouseView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
}) {
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
        resource: 'warehouses',
        initialPerPage: 25,
    });

    const config = useMemo(() => {
        const baseConfig = page.warehouse;
        return {
            ...baseConfig,
            table: {
                ...baseConfig.table,
                rows: rows.map(mapWarehouseRow),
                pageValue: total.toLocaleString('id-ID'),
                refreshLabel: loading ? 'Memuat...' : baseConfig.table.refreshLabel,
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
    }, [loading, page.warehouse, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

    return mode === 'table' ? (
        <WarehouseTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
        />
    ) : (
        <WarehouseFormView
            config={config}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
