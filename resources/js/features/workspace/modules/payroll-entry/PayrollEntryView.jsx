import { useEffect, useMemo, useState } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import PayrollEntryFormView from './PayrollEntryFormView';
import PayrollEntryTableView from './PayrollEntryTableView';
import { mapPayrollEntryRow, buildPayrollEntryRecord } from './payrollEntryShared';

export default function PayrollEntryView({ page, mode, activeLevel2Tab, level2Tabs = [], onOpenContent, onOpenDetail, onCloseDetail}) {
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
                <PayrollEntryTableView config={resolvedConfig} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
            </div>
            {lastActiveFormTab && (
                <div className={mode === 'form' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                    <PayrollEntryFormView
            pageId={page.id}
            activeLevel2Tab={lastActiveFormTab}
            config={resolvedConfig}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
            buildRecord={buildPayrollEntryRecord}
        />
                </div>
            )}
        </div>
    );
}
