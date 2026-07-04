import { useEffect, useMemo, useState } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import GeneralJournalFormView from './GeneralJournalFormView';
import GeneralJournalTableView from './GeneralJournalTableView';
import { buildGeneralJournalFilters, buildGeneralJournalRow } from './generalJournalShared';

export default function GeneralJournalView({ page, mode, activeLevel2Tab, level2Tabs = [], onOpenContent, onOpenDetail, onCloseDetail}) {
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
        resource: 'general-journals',
        initialPerPage: 25,
    });
    const config = useMemo(
        () => {
            const mappedRows = rows.map(buildGeneralJournalRow);

            return {
                ...page.generalJournal,
                rowMap: mappedRows.reduce((result, row) => {
                    result[row.id] = row;
                    return result;
                }, {}),
                records: {
                    ...(page.generalJournal.records ?? {}),
                },
                table: {
                loading,

                    ...page.generalJournal.table,
                    rows: mappedRows,
                    filters: buildGeneralJournalFilters(page.generalJournal.table?.filters, mappedRows),
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
                    refreshLabel: loading ? 'Memuat data...' : page.generalJournal.table?.refreshLabel,
                onRefresh: reload,
                },
            };
        },
        [error, loading, page.generalJournal, rows, total, reload],
    );

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
                <GeneralJournalTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            loading={loading}
            error={error}
            onRefresh={reload}
        />
            </div>
            {lastActiveFormTab && (
                <div className={mode === 'form' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                    <GeneralJournalFormView
            pageId={page.id}
            config={config}
            activeLevel2Tab={lastActiveFormTab}
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
