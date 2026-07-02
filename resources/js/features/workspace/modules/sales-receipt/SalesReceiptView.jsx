import { useEffect, useMemo, useState } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { buildSalesReceiptConfig } from '@/features/workspace/modules/sales-receipt/salesReceiptConfig';
import SalesReceiptFormView from '@/features/workspace/modules/sales-receipt/SalesReceiptFormView';
import SalesReceiptTableView from '@/features/workspace/modules/sales-receipt/SalesReceiptTableView';
import {
    buildSalesReceiptFilters,
    buildSalesReceiptRow,
    buildSalesReceiptRecord,
} from '@/features/workspace/modules/sales-receipt/salesReceiptViewShared';

export default function SalesReceiptView({ page, mode, activeLevel2Tab, level2Tabs = [], onOpenContent, onOpenDetail, onCloseDetail}) {
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
        resource: 'sales-receipts',
        initialPerPage: 25,
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
                loading,

                ...baseConfig.table,
                rows: mappedRows,
                filters: buildSalesReceiptFilters(baseConfig.table?.filters, mappedRows),
                pageValue: total.toLocaleString('id-ID'),
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
                refreshLabel: loading ? 'Memuat data...' : baseConfig.table?.refreshLabel,
            },
        };
    }, [loading, page.salesReceipt, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

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
                <SalesReceiptTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            loading={loading}
            error={error}
            onRefresh={reload}
        />
            </div>
            {lastActiveFormTab && (
                <div className={mode === 'form' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                    <SalesReceiptFormView
            pageId={page.id}
            config={config}
            activeLevel2Tab={lastActiveFormTab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
            buildRecord={buildSalesReceiptRecord}
        />
                </div>
            )}
        </div>
    );
}
