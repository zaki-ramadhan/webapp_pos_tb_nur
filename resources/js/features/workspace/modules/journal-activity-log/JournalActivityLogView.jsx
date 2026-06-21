import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { mapJournalActivityRows } from '@/features/workspace/backend/workspaceBackendAdapters';
import JournalActivityLogTableView from './components/JournalActivityLogTableView';
import JournalActivityLogDetailView from './components/JournalActivityLogDetailView';

export default function JournalActivityLogView({ page, activeLevel2Tab, onOpenDetail }) {
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
        resource: 'journal-activity-logs',
        initialPerPage: 25,
    });

    const mappedRows = useMemo(() => mapJournalActivityRows(backendRows), [backendRows]);

    const config = useMemo(
        () => ({
            ...page.journalActivityLog,
            table: {
                ...page.journalActivityLog.table,
                rows: mappedRows,
                pageValue: total.toLocaleString('id-ID'),
                loading,
                refreshLabel: loading ? 'Memuat data...' : page.journalActivityLog.table?.refreshLabel,
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
            },
            rowMap: mappedRows.reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
        }),
        [error, loading, mappedRows, page.journalActivityLog, reload, total],
    );

    return activeLevel2Tab?.tabType === 'detail' ? (
        <JournalActivityLogDetailView config={config} activeLevel2Tab={activeLevel2Tab} />
    ) : (
        <JournalActivityLogTableView config={config} onOpenDetail={onOpenDetail} />
    );
}
