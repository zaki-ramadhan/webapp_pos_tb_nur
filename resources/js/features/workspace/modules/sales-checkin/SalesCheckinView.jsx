import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import {
    buildSalesCheckinFilters,
    mapSalesCheckinRows,
} from '@/features/workspace/backend/workspaceBackendAdapters';
import TableListView from '@/features/workspace/modules/TableListView';

export default function SalesCheckinView({ page }) {
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
        resource: 'sales-checkins',
        initialPerPage: 25,
    });
    const table = useMemo(() => {
        const mappedRows = mapSalesCheckinRows(rows);

        return {
            ...page.table,
            rows: mappedRows,
            filters: buildSalesCheckinFilters(mappedRows),
            pageValue: total.toLocaleString('id-ID'),
            loading,
            refreshLabel: page.table?.refreshLabel || 'Muat ulang',
            emptyLabel: error || 'Belum ada data',
            onRefresh: reload,
            importButton: false,
            printButton: false,
            exportConfig: false,
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
        };
    }, [error, loading, page.table, reload, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

    return <TableListView table={table} />;
}
