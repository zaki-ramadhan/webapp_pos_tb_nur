import { useMemo } from 'react';
import BudgetFormView from './BudgetFormView';
import BudgetTableView from './BudgetTableView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { buildOperationDocumentTableRows } from '@/features/workspace/backend/operationDocumentBackend';

export default function BudgetView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
}) {
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
        to,
    } = useBackendIndexResource({
        resource: 'budgets',
        initialPerPage: 25,
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
                }
            }
        };
    }, [page, rows, total, loading, error, reload, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

    return mode === 'table' ? (
        <BudgetTableView
            page={pageWithDynamicData}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
        />
    ) : (
        <BudgetFormView
            page={pageWithDynamicData}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
