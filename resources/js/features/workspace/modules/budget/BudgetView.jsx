import { useMemo } from 'react';
import BudgetFormView from './BudgetFormView';
import BudgetTableView from './BudgetTableView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { buildOperationDocumentTableRows } from '@/features/workspace/backend/operationDocumentBackend';

export default function BudgetView({ page, mode, activeLevel2Tab, onOpenContent }) {
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'budgets',
        filters: {
            per_page: 100,
        },
        enabled: true,
    });

    const pageWithDynamicData = useMemo(() => {
        if (!page.budgetPage) {
            return page;
        }

        const mappedRows = buildOperationDocumentTableRows('budget', rows);

        const budgetTableRows = mappedRows.map((row) => {
            const rawRecord = row.__backendRecord;
            return {
                id: row.id,
                __backendRecord: rawRecord,
                status: row.status,
                number: row.number,
                department: rawRecord.department?.name ?? '-',
                type: 'Anggaran Beban',
                notes: row.notes,
                totalValue: 'Rp ' + Number(rawRecord.total_amount ?? 0).toLocaleString('id-ID'),
                departmentValue: rawRecord.department_id ? String(rawRecord.department_id) : 'all',
                typeValue: 'all',
            };
        });

        return {
            ...page,
            budgetPage: {
                ...page.budgetPage,
                table: {
                    ...page.budgetPage.table,
                    rows: budgetTableRows,
                    pageValue: total.toLocaleString('id-ID'),
                    loading,
                    refreshLabel: loading ? 'Memuat data...' : page.budgetPage.table.refreshLabel,
                    emptyLabel: error || 'Belum ada data',
                    onRefresh: reload,
                }
            }
        };
    }, [page, rows, total, loading, error, reload]);

    return mode === 'table'
        ? <BudgetTableView page={pageWithDynamicData} onCreate={onOpenContent} />
        : <BudgetFormView page={pageWithDynamicData} activeLevel2Tab={activeLevel2Tab} />;
}
