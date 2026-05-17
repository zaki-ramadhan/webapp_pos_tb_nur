import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import ExpenseEntryFormView from './ExpenseEntryFormView';
import ExpenseEntryTableView from './ExpenseEntryTableView';
import {
    buildExpenseEntryFilters,
    buildExpenseEntryRecord,
    buildExpenseEntryRow,
} from './expenseEntryShared';

export default function ExpenseEntryView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'expense-entries',
        filters: {
            per_page: 100,
        },
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
                ...page.expenseEntry.table,
                rows: mappedRows,
                filters: buildExpenseEntryFilters(page.expenseEntry.table?.filters, mappedRows),
                pageValue: total.toLocaleString('id-ID'),
                emptyLabel: error || page.expenseEntry.table?.emptyLabel,
                refreshLabel: loading ? 'Memuat data...' : page.expenseEntry.table?.refreshLabel,
            },
        };
    }, [error, loading, page.expenseEntry, rows, total]);

    return mode === 'table' ? (
        <ExpenseEntryTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            loading={loading}
            error={error}
            onRefresh={reload}
        />
    ) : (
        <ExpenseEntryFormView
            pageId={page.id}
            config={config}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
            buildRecord={buildExpenseEntryRecord}
        />
    );
}
