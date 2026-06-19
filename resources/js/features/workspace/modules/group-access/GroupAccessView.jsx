import { useMemo } from 'react';

import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';
import {
    buildGroupAccessRow,
    mergeGroupAccessForm,
} from './groupAccessUtils';
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
    onCloseDetail,
}) {
    const {
        mappedRows: resolvedRows,
        tableProps,
        reload,
    } = useWorkspaceResource({
        resource: 'access-groups',
        initialPerPage: 25,
        mapRow: (record) => buildGroupAccessRow(record, page.form),
    });

    const rowMap = useMemo(
        () =>
            resolvedRows.reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
        [resolvedRows],
    );
    const activeRow = activeLevel2Tab?.recordId ? rowMap[activeLevel2Tab.recordId] : null;
    const resolvedForm = useMemo(
        () => mergeGroupAccessForm(page.form, activeRow?.detailForm ?? {}),
        [activeRow?.detailForm, page.form],
    );
    const resolvedTable = useMemo(
        () => ({
            ...page.table,
            ...tableProps,
            pageValue: tableProps.total.toLocaleString('id-ID'),
        }),
        [page.table, tableProps],
    );

    return mode === 'table' ? (
        <GroupAccessTableView
            table={resolvedTable}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    ) : (
        <GroupAccessFormView
            pageId={page.id}
            activeLevel2Tab={activeLevel2Tab}
            form={resolvedForm}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
