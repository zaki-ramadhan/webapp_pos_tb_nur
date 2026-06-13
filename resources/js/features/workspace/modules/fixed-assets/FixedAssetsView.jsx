import { useMemo } from 'react';

import { buildFixedAssetsConfig } from '@/features/workspace/modules/fixed-assets/fixedAssetsConfig';
import FixedAssetsFormView from '@/features/workspace/modules/fixed-assets/FixedAssetsFormView';
import FixedAssetsTableView from '@/features/workspace/modules/fixed-assets/FixedAssetsTableView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { mapFixedAssetRows, buildFixedAssetsFilters } from '@/features/workspace/backend/workspaceBackendAdapters';

export default function FixedAssetsView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
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
        resource: 'fixed-assets',
        initialPerPage: 25,
        enabled: true,
    });

    const config = useMemo(() => {
        const baseConfig = buildFixedAssetsConfig(page.fixedAssets);
        const mappedRows = mapFixedAssetRows(rows);
        const dynamicFilters = buildFixedAssetsFilters(mappedRows);

        return {
            ...baseConfig,
            table: {
                ...baseConfig.table,
                rows: mappedRows,
                filters: dynamicFilters,
                pageValue: total.toLocaleString('id-ID'),
                loading,
                refreshLabel: loading ? 'Memuat data...' : baseConfig.table.refreshLabel,
                emptyLabel: error || 'Belum ada data',
                onRefresh: reload,
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
            },
        };
    }, [page.fixedAssets, rows, total, loading, error, reload, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

    if (mode === 'table') {
        return <FixedAssetsTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />;
    }

    return <FixedAssetsFormView config={config} activeLevel2Tab={activeLevel2Tab} />;
}
