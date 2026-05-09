import { useMemo } from 'react';

import {
    mergeGroupAccessForm,
} from '@/features/workspace/modules/groupAccessUtils';
import {
    GroupAccessFormView,
    GroupAccessTableView,
} from '@/features/workspace/modules/group-access/GroupAccessViews';

export default function GroupAccessView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
}) {
    const rowMap = useMemo(
        () =>
            (page.table?.rows ?? []).reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
        [page.table?.rows],
    );
    const activeRow = activeLevel2Tab?.recordId ? rowMap[activeLevel2Tab.recordId] : null;
    const resolvedForm = useMemo(
        () => mergeGroupAccessForm(page.form, activeRow?.detailForm ?? {}),
        [activeRow?.detailForm, page.form],
    );

    return mode === 'table' ? (
        <GroupAccessTableView table={page.table} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <GroupAccessFormView form={resolvedForm} />
    );
}
