import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
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
        resource: 'access-groups',
        initialPerPage: 25,
    });
    const resolvedRows = useMemo(
        () => backendRows.map((record) => buildGroupAccessRow(record, page.form)),
        [backendRows, page.form],
    );
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
            rows: resolvedRows,
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
            emptyLabel: error || page.table?.emptyLabel || 'Belum ada data',
            refreshLabel: loading ? 'Memuat data...' : page.table?.refreshLabel,
        }),
        [error, loading, page.table, resolvedRows, total],
    );

    return mode === 'table' ? (
        <GroupAccessTableView
            table={resolvedTable}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            loading={loading}
            error={error}
            onRefresh={reload}
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
