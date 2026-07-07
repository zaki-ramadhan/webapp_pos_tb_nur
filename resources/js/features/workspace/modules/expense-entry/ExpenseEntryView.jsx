import { useEffect, useMemo, useState } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import ExpenseEntryFormView from './ExpenseEntryFormView';
import ExpenseEntryTableView from './ExpenseEntryTableView';
import {
    buildExpenseEntryFilters,
    buildExpenseEntryRecord,
    buildExpenseEntryRow,
} from './expenseEntryShared';

export default function ExpenseEntryView({ page, mode, activeLevel2Tab, level2Tabs = [], onOpenContent, onOpenDetail, onCloseDetail}) {
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
        resource: 'expense-entries',
        initialPerPage: 25,
    });
    const config = useMemo(() => {
        const mappedRows = rows.map(buildExpenseEntryRow);

        return {
            ...page.expenseEntry,
            rowMap: mappedRows.reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
            table: {
                loading,

                ...page.expenseEntry.table,
                rows: mappedRows,
                filters: buildExpenseEntryFilters(page.expenseEntry.table?.filters, mappedRows),
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
                emptyLabel: error || page.expenseEntry.table?.emptyLabel,
                refreshLabel: loading ? 'Memuat data...' : page.expenseEntry.table?.refreshLabel,
                onRefresh: reload,
            },
        };
    }, [error, loading, page.expenseEntry, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage, reload]);

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
                <ExpenseEntryTableView
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
                        <ExpenseEntryFormView
                            key={tab.id}
            pageId={page.id}
            config={config}
            activeLevel2Tab={tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
            buildRecord={buildExpenseEntryRecord}
                        />
                    </div>
                );
            })}
        </div>
    );
}
