import { useCallback, useEffect, useMemo, useState } from 'react';

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
    activeLevel2Tab, level2Tabs = [],
    onOpenContent,
    onOpenDetail,
    onCloseDetail,}) {
    const mapRow = useCallback(
        (record) => buildGroupAccessRow(record, page.form),
        [page.form],
    );

    const {
        mappedRows: resolvedRows,
        tableProps,
        reload,
    } = useWorkspaceResource({
        resource: 'access-groups',
        initialPerPage: 25,
        mapRow,
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
                <GroupAccessTableView
            table={resolvedTable}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
            </div>
            {lastActiveFormTab && (
                <div className={mode === 'form' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                    <GroupAccessFormView
            pageId={page.id}
            activeLevel2Tab={lastActiveFormTab}
            form={resolvedForm}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
                </div>
            )}
        </div>
    );
}
