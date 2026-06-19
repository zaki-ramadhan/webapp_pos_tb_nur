import { useMemo } from 'react';
import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';
import CashPaymentFormView from './CashPaymentFormView';
import CashPaymentTableView from './CashPaymentTableView';
import { buildCashPaymentFilters, buildCashPaymentRow } from './cashPaymentShared';

export default function CashPaymentView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const resource = useWorkspaceResource({
        resource: 'cash-payments',
        initialPerPage: 25,
        mapRow: buildCashPaymentRow,
    });

    const config = useMemo(() => {
        const rows = resource.mappedRows;
        return {
            ...page.cashPayment,
            rowMap: rows.reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
            table: {
                ...page.cashPayment.table,
                ...resource.tableProps,
                filters: buildCashPaymentFilters(page.cashPayment.table?.filters, rows),
                pageValue: resource.total.toLocaleString('id-ID'),
            },
        };
    }, [page.cashPayment, resource]);

    return mode === 'table' ? (
        <CashPaymentTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            loading={resource.loading}
            error={resource.error}
            onRefresh={resource.reload}
        />
    ) : (
        <CashPaymentFormView
            pageId={page.id}
            config={config}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={resource.reload}
        />
    );
}
