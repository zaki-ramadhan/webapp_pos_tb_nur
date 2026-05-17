import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import GeneralJournalFormView from './GeneralJournalFormView';
import GeneralJournalTableView from './GeneralJournalTableView';
import { buildGeneralJournalFilters, buildGeneralJournalRow } from './generalJournalShared';

export default function GeneralJournalView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'general-journals',
        filters: {
            per_page: 100,
        },
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
                    ...page.generalJournal.table,
                    rows: mappedRows,
                    filters: buildGeneralJournalFilters(page.generalJournal.table?.filters, mappedRows),
                    pageValue: total.toLocaleString('id-ID'),
                    refreshLabel: loading ? 'Memuat data...' : page.generalJournal.table?.refreshLabel,
                },
            };
        },
        [error, loading, page.generalJournal, rows, total],
    );

    return mode === 'table' ? (
        <GeneralJournalTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            loading={loading}
            error={error}
            onRefresh={reload}
        />
    ) : (
        <GeneralJournalFormView
            pageId={page.id}
            config={config}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
