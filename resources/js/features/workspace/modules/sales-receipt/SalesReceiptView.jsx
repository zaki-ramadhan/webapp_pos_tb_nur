import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { buildSalesReceiptConfig } from '@/features/workspace/modules/sales-receipt/salesReceiptConfig';
import SalesReceiptFormView from '@/features/workspace/modules/sales-receipt/SalesReceiptFormView';
import SalesReceiptTableView from '@/features/workspace/modules/sales-receipt/SalesReceiptTableView';
import {
    buildSalesReceiptFilters,
    buildSalesReceiptRow,
    buildSalesReceiptRecord,
} from '@/features/workspace/modules/sales-receipt/salesReceiptViewShared';

export default function SalesReceiptView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'sales-receipts',
        filters: {
            per_page: 100,
        },
    });
    const config = useMemo(() => {
        const baseConfig = buildSalesReceiptConfig(page.salesReceipt);
        const mappedRows = rows.map(buildSalesReceiptRow);

        return {
            ...baseConfig,
            rowMap: mappedRows.reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
            table: {
                ...baseConfig.table,
                rows: mappedRows,
                filters: buildSalesReceiptFilters(baseConfig.table?.filters, mappedRows),
                pageValue: total.toLocaleString('id-ID'),
                refreshLabel: loading ? 'Memuat data...' : baseConfig.table?.refreshLabel,
            },
        };
    }, [loading, page.salesReceipt, rows, total]);

    return mode === 'table' ? (
        <SalesReceiptTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            loading={loading}
            error={error}
            onRefresh={reload}
        />
    ) : (
        <SalesReceiptFormView
            pageId={page.id}
            config={config}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
            buildRecord={buildSalesReceiptRecord}
        />
    );
}
