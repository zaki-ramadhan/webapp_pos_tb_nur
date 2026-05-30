import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import PayrollEntryFormView from './PayrollEntryFormView';
import PayrollEntryTableView from './PayrollEntryTableView';
import { mapPayrollEntryRow } from './payrollEntryShared';

export default function PayrollEntryView({ page, mode, activeLevel2Tab, onOpenContent }) {
    const { rows: backendRows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'payroll-entries',
        filters: {
            per_page: 100,
        },
    });

    const mappedRows = useMemo(() => backendRows.map(mapPayrollEntryRow), [backendRows]);

    const resolvedConfig = useMemo(() => ({
        ...page.payrollEntry,
        table: {
            ...page.payrollEntry.table,
            rows: mappedRows,
            pageValue: total.toLocaleString('id-ID'),
            loading,
            refreshLabel: loading ? 'Memuat data...' : page.payrollEntry.table?.refreshLabel,
            emptyLabel: error || page.payrollEntry.table?.emptyLabel || 'Belum ada data',
            onRefresh: reload,
        },
    }), [error, loading, mappedRows, page.payrollEntry, reload, total]);

    return mode === 'table' ? (
        <PayrollEntryTableView config={resolvedConfig} onCreate={onOpenContent} />
    ) : (
        <PayrollEntryFormView pageId={page.id} activeLevel2Tab={activeLevel2Tab} config={resolvedConfig} />
    );
}
