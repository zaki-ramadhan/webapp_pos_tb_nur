import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { buildPurchasePaymentConfig } from './purchasePaymentConfig';
import PurchasePaymentFormView from './PurchasePaymentFormView';
import PurchasePaymentTableView from './PurchasePaymentTableView';
import {
    buildPurchasePaymentFilters,
    buildPurchasePaymentRecordFromBackend,
    buildPurchasePaymentRow,
} from './purchasePaymentShared';

export default function PurchasePaymentView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'purchase-payments',
        filters: {
            per_page: 100,
        },
    });
    const config = useMemo(
        () => {
            const baseConfig = buildPurchasePaymentConfig(page.purchasePayment);
            const mappedRows = rows.map(buildPurchasePaymentRow);

            return {
                ...baseConfig,
                rowMap: mappedRows.reduce((result, row) => {
                    result[row.id] = row;
                    return result;
                }, {}),
                table: {
                    ...baseConfig.table,
                    rows: mappedRows,
                    filters: buildPurchasePaymentFilters(baseConfig.table?.filters, mappedRows),
                    pageValue: total.toLocaleString('id-ID'),
                    refreshLabel: loading ? 'Memuat data...' : baseConfig.table?.refreshLabel,
                },
            };
        },
        [loading, page.purchasePayment, rows, total],
    );

    return mode === 'table' ? (
        <PurchasePaymentTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            loading={loading}
            error={error}
            onRefresh={reload}
        />
    ) : (
        <PurchasePaymentFormView
            pageId={page.id}
            config={config}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
            buildRecord={buildPurchasePaymentRecordFromBackend}
        />
    );
}
