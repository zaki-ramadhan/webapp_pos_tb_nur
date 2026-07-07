import { useEffect, useMemo, useState } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { buildPurchasePaymentConfig } from './purchasePaymentConfig';
import PurchasePaymentFormView from './PurchasePaymentFormView';
import PurchasePaymentTableView from './PurchasePaymentTableView';
import {
    buildPurchasePaymentFilters,
    buildPurchasePaymentRecordFromBackend,
    buildPurchasePaymentRow,
} from './purchasePaymentShared';

export default function PurchasePaymentView({ page, mode, activeLevel2Tab, level2Tabs = [], onOpenContent, onOpenDetail, onCloseDetail}) {
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
        resource: 'purchase-payments',
        initialPerPage: 25,
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
                loading,

                    ...baseConfig.table,
                    rows: mappedRows,
                    filters: buildPurchasePaymentFilters(baseConfig.table?.filters, mappedRows),
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
                onRefresh: reload,
                },
            };
        },
        [loading, page.purchasePayment, rows, total, reload],
    );

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
                <PurchasePaymentTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            loading={loading}
            error={error}
            onRefresh={reload}
        />
            </div>
            {level2Tabs.map((tab) => {
                if (tab.kind !== 'content') return null;

                const isCurrentForm = mode === 'form' && activeLevel2Tab?.id === tab.id;

                return (
                    <div
                        key={tab.id}
                        className={isCurrentForm ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}
                    >
                        <PurchasePaymentFormView
                            key={tab.id}
            pageId={page.id}
            config={config}
            activeLevel2Tab={tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
            buildRecord={buildPurchasePaymentRecordFromBackend}
                        />
                    </div>
                );
            })}
        </div>
    );
}
