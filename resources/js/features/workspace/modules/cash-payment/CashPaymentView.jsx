import { useEffect, useMemo, useState } from 'react';
import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';
import CashPaymentFormView from './CashPaymentFormView';
import CashPaymentTableView from './CashPaymentTableView';
import { buildCashPaymentFilters, buildCashPaymentRow } from './cashPaymentShared';

export default function CashPaymentView({ page, mode, activeLevel2Tab, level2Tabs = [], onOpenContent, onOpenDetail, onCloseDetail}) {
    const resource = useWorkspaceResource({
        resource: 'cash-payments',
        initialPerPage: 25,
        mapRow: buildCashPaymentRow,
    });

    const { mappedRows, tableProps, total } = resource;

    const config = useMemo(() => {
        const rows = mappedRows;
        return {
            ...page.cashPayment,
            rowMap: rows.reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
            table: {
                ...page.cashPayment.table,
                ...tableProps,
                filters: buildCashPaymentFilters(page.cashPayment.table?.filters, rows),
                pageValue: total.toLocaleString('id-ID'),
            },
        };
    }, [page.cashPayment, mappedRows, tableProps, total]);

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
                <CashPaymentTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            loading={resource.loading}
            error={resource.error}
            onRefresh={resource.reload}
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
                        <CashPaymentFormView
                            key={tab.id}
                        pageId={page.id}
                        config={config}
                        activeLevel2Tab={tab}
                        onOpenContent={onOpenContent}
                        onOpenDetail={onOpenDetail}
                        onCloseDetail={onCloseDetail}
                        onRefresh={resource.reload}
                        />
                    </div>
                );
            })}
        </div>
    );
}
