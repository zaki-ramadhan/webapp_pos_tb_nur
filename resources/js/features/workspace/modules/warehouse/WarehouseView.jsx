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
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'warehouses',
        filters: {
            per_page: 100,
        },
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
            },
        };
    }, [loading, page.warehouse, rows, total]);

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
