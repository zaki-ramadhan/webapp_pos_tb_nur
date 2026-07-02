import { useEffect, useMemo, useState } from 'react';
import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';
import CashReceiptFormView from '@/features/workspace/modules/cash-receipt/CashReceiptFormView';
import CashReceiptTableView from '@/features/workspace/modules/cash-receipt/CashReceiptTableView';
import { buildCashReceiptFilters, buildCashReceiptRow } from '@/features/workspace/modules/cash-receipt/cashReceiptViewShared';

export default function CashReceiptView({ page, mode, activeLevel2Tab, level2Tabs = [], onOpenContent, onOpenDetail, onCloseDetail}) {
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

        const [lastActiveFormTab, setLastActiveFormTab] = useState(null);

    useEffect(() => {
        if (activeLevel2Tab && activeLevel2Tab.kind === 'content') {
            setLastActiveFormTab(activeLevel2Tab);
        } else if (!activeLevel2Tab) {
            setLastActiveFormTab(null);
        }
    }, [activeLevel2Tab]);

    return (
        <div className="flex flex-1 flex-col min-h-0 w-full h-full relative">
            <div className={mode === 'table' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                <CashReceiptTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            loading={resource.loading}
            error={resource.error}
            onRefresh={resource.reload}
        />
            </div>
            {lastActiveFormTab && (
                <div className={mode === 'form' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                    <CashReceiptFormView
            pageId={page.id}
            config={config}
            activeLevel2Tab={lastActiveFormTab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={resource.reload}
        />
                </div>
            )}
        </div>
    );
}
