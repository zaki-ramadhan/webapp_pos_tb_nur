import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import CashPaymentFormView from './CashPaymentFormView';
import CashPaymentTableView from './CashPaymentTableView';
import { buildCashPaymentFilters, buildCashPaymentRow } from './cashPaymentShared';

export default function CashPaymentView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'cash-payments',
        filters: {
            per_page: 100,
        },
    });
    const config = useMemo(
        () => {
            const mappedRows = rows.map(buildCashPaymentRow);

            return {
                ...page.cashPayment,
                rowMap: mappedRows.reduce((result, row) => {
                    result[row.id] = row;
                    return result;
                }, {}),
                table: {
                    ...page.cashPayment.table,
                    rows: mappedRows,
                    filters: buildCashPaymentFilters(page.cashPayment.table?.filters, mappedRows),
                    pageValue: total.toLocaleString('id-ID'),
                    refreshLabel: loading ? 'Memuat data...' : page.cashPayment.table?.refreshLabel,
                },
            };
        },
        [loading, page.cashPayment, rows, total],
    );

    return mode === 'table' ? (
        <CashPaymentTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            loading={loading}
            error={error}
            onRefresh={reload}
        />
    ) : (
        <CashPaymentFormView
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
