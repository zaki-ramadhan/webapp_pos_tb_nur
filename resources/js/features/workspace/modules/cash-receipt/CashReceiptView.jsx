import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import CashReceiptFormView from '@/features/workspace/modules/cash-receipt/CashReceiptFormView';
import CashReceiptTableView from '@/features/workspace/modules/cash-receipt/CashReceiptTableView';
import { buildCashReceiptFilters, buildCashReceiptRow } from '@/features/workspace/modules/cash-receipt/cashReceiptViewShared';

export default function CashReceiptView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'cash-receipts',
        filters: {
            per_page: 100,
        },
    });
    const config = useMemo(
        () => {
            const mappedRows = rows.map(buildCashReceiptRow);

            return {
                ...page.cashReceipt,
                rowMap: mappedRows.reduce((result, row) => {
                    result[row.id] = row;
                    return result;
                }, {}),
                table: {
                    ...page.cashReceipt.table,
                    rows: mappedRows,
                    filters: buildCashReceiptFilters(page.cashReceipt.table?.filters, mappedRows),
                    pageValue: total.toLocaleString('id-ID'),
                    refreshLabel: loading ? 'Memuat data...' : page.cashReceipt.table?.refreshLabel,
                },
            };
        },
        [loading, page.cashReceipt, rows, total],
    );

    return mode === 'table' ? (
        <CashReceiptTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            loading={loading}
            error={error}
            onRefresh={reload}
        />
    ) : (
        <CashReceiptFormView
            pageId={page.id}
            config={config}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
