import { useMemo } from 'react';

import GeneralJournalFormView from './GeneralJournalFormView';
import GeneralJournalTableView from './GeneralJournalTableView';

export default function GeneralJournalView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(
        () => ({
            ...page.generalJournal,
            rowMap: (page.generalJournal.table?.rows ?? []).reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
        }),
        [page.generalJournal],
    );

    return mode === 'table' ? (
        <GeneralJournalTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <GeneralJournalFormView pageId={page.id} config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
