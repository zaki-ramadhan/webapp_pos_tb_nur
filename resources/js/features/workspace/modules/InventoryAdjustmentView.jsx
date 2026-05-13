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
} from '@/features/workspace/modules/priceAdjustmentConfig';
import {
    InventoryAdjustmentFormView,
    InventoryAdjustmentTableView,
} from '@/features/workspace/modules/shared/InventoryAdjustmentWorkspace';

export default function InventoryAdjustmentView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
}) {
    const backendConfig = INVENTORY_ADJUSTMENT_BACKEND_CONFIG[page.id] ?? null;
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: backendConfig?.resource,
        filters: {
            per_page: 100,
        },
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
                    refreshLabel: loading ? 'Memuat data...' : baseConfig.table.refreshLabel,
                    emptyLabel: error || 'Belum ada data',
                    onRefresh: reload,
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
            onRefresh={reload}
        />
    );
}
