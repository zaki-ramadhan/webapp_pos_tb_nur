import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import PayrollEntryFormView from './PayrollEntryFormView';
import PayrollEntryTableView from './PayrollEntryTableView';
import { mapPayrollEntryRow, buildPayrollEntryRecord } from './payrollEntryShared';

export default function PayrollEntryView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const {
        rows: backendRows,
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
        resource: 'payroll-entries',
        initialPerPage: 25,
    });

    const mappedRows = useMemo(() => backendRows.map(mapPayrollEntryRow), [backendRows]);

    const resolvedConfig = useMemo(() => ({
        ...page.payrollEntry,
        rowMap: mappedRows.reduce((result, row) => {
            result[row.id] = row;
            return result;
        }, {}),
        table: {
            ...page.payrollEntry.table,
            rows: mappedRows,
            pageValue: total.toLocaleString('id-ID'),
            loading,
            refreshLabel: loading ? 'Memuat data...' : page.payrollEntry.table?.refreshLabel,
            emptyLabel: error || page.payrollEntry.table?.emptyLabel || 'Belum ada data',
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
        },
    }), [error, loading, mappedRows, page.payrollEntry, reload, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

    return mode === 'table' ? (
        <PayrollEntryTableView config={resolvedConfig} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <PayrollEntryFormView
            pageId={page.id}
            activeLevel2Tab={activeLevel2Tab}
            config={resolvedConfig}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
            buildRecord={buildPayrollEntryRecord}
        />
    );
}
