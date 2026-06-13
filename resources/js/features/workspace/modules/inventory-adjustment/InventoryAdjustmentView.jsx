import { useMemo } from 'react';

import {
    buildInventoryAdjustmentRecord as buildBackendInventoryAdjustmentRecord,
    buildInventoryAdjustmentTableRows,
    INVENTORY_ADJUSTMENT_BACKEND_CONFIG,
} from '@/features/workspace/backend/inventoryAdjustmentBackend';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import {
    buildInventoryAdjustmentConfig,
    buildInventoryAdjustmentRecord,
} from '@/features/workspace/modules/price-adjustment/priceAdjustmentConfig';
import {
    InventoryAdjustmentFormView,
    InventoryAdjustmentTableView,
} from '@/features/workspace/modules/inventory-adjustment/InventoryAdjustmentWorkspace';

export default function InventoryAdjustmentView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
}) {
    const backendConfig = INVENTORY_ADJUSTMENT_BACKEND_CONFIG[page.id] ?? null;
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
    const pageConfig = page.inventoryAdjustment ?? page.priceAdjustment;
    const config = useMemo(
        () => {
            const baseConfig = buildInventoryAdjustmentConfig(pageConfig);

            if (!backendConfig) {
                return baseConfig;
            }

            const mappedRows = buildInventoryAdjustmentTableRows(rows);

            return {
                ...baseConfig,
                table: {
                    ...baseConfig.table,
                    rows: mappedRows,
                    pageValue: total.toLocaleString('id-ID'),
                    loading,
                    refreshLabel: loading ? 'Memuat data...' : baseConfig.table.refreshLabel,
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
        },
        [backendConfig, error, loading, pageConfig, reload, rows, total],
    );
    const resolvedBuildRecord = useMemo(
        () => (row = {}) => {
            if (row.__backendRecord) {
                return buildBackendInventoryAdjustmentRecord(row.__backendRecord, config);
            }

            return buildInventoryAdjustmentRecord(row, config);
        },
        [config],
    );

    return mode === 'table' ? (
        <InventoryAdjustmentTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    ) : (
        <InventoryAdjustmentFormView
            pageId={page.id}
            config={config}
            activeLevel2Tab={activeLevel2Tab}
            buildRecord={resolvedBuildRecord}
            backendConfig={backendConfig}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
