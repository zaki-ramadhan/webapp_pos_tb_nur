import { useEffect, useMemo, useState } from 'react';
import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';
import CurrencyFormView from './CurrencyFormView';
import CurrencyTableView from './CurrencyTableView';
import { mapCurrencyRow } from './currencyShared';

export default function CurrencyView({ page, mode, activeLevel2Tab, level2Tabs = [], onOpenContent, onOpenDetail, onCloseDetail}) {
    const {
        loading,
        error,
        reload,
        mappedRows,
        tableProps,
    } = useWorkspaceResource({
        resource: 'currencies',
        initialPerPage: 25,
        mapRow: (row) => mapCurrencyRow(row),
    });

    const resolvedPage = useMemo(() => ({
        ...page,
        currency: {
            ...page.currency,
            table: {
                ...page.currency?.table,
                ...tableProps,
                rows: mappedRows,
            },
        },
    }), [page, mappedRows, tableProps]);

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
                <CurrencyTableView
            page={resolvedPage}
            rows={mappedRows}
            loading={loading}
            error={error}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
        />
            </div>
            {lastActiveFormTab && (
                <div className={mode === 'form' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                    <CurrencyFormView
            key={lastActiveFormTab.id}
            page={resolvedPage}
            activeLevel2Tab={lastActiveFormTab}
            tableRows={mappedRows}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
                </div>
            )}
        </div>
    );
}
