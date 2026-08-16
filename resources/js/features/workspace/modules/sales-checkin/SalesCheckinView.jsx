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
        serverTableProps,
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
            emptyLabel: loading ? 'Memuat data...' : (error || 'Tidak ada data'),
            onRefresh: reload,
            importButton: false,
            printButton: false,
            exportConfig: false,
            ...serverTableProps,
        };
    }, [error, loading, page.table, reload, rows, total, serverTableProps]);

    return <TableListView table={table} />;
}
