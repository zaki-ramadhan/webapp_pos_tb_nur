import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import {
    buildSalesCheckinFilters,
    mapSalesCheckinRows,
} from '@/features/workspace/backend/workspaceBackendAdapters';
import TableListView from '@/features/workspace/modules/TableListView';

export default function SalesCheckinView({ page }) {
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'sales-checkins',
        filters: {
            per_page: 100,
        },
    });
    const table = useMemo(() => {
        const mappedRows = mapSalesCheckinRows(rows);

        return {
            ...page.table,
            rows: mappedRows,
            filters: buildSalesCheckinFilters(mappedRows),
            pageValue: total.toLocaleString('id-ID'),
            loading,
            refreshLabel: loading ? 'Memuat data...' : page.table?.refreshLabel,
            emptyLabel: error || 'Belum ada data',
            onRefresh: reload,
        };
    }, [error, loading, page.table, reload, rows, total]);

    return <TableListView table={table} />;
}
