import { useMemo } from 'react';
import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';
import CashReceiptFormView from '@/features/workspace/modules/cash-receipt/CashReceiptFormView';
import CashReceiptTableView from '@/features/workspace/modules/cash-receipt/CashReceiptTableView';
import { buildCashReceiptFilters, buildCashReceiptRow } from '@/features/workspace/modules/cash-receipt/cashReceiptViewShared';

export default function CashReceiptView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const resource = useWorkspaceResource({
        resource: 'cash-receipts',
        initialPerPage: 25,
        mapRow: buildCashReceiptRow,
    });

    const { mappedRows, tableProps, total } = resource;

    const config = useMemo(() => {
        const rows = mappedRows;
        return {
            ...page.cashReceipt,
            rowMap: rows.reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
            table: {
                ...page.cashReceipt.table,
                ...tableProps,
                filters: buildCashReceiptFilters(page.cashReceipt.table?.filters, rows),
                pageValue: total.toLocaleString('id-ID'),
            },
        };
    }, [page.cashReceipt, mappedRows, tableProps, total]);

    return mode === 'table' ? (
        <CashReceiptTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            loading={resource.loading}
            error={resource.error}
            onRefresh={resource.reload}
        />
    ) : (
        <CashReceiptFormView
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
