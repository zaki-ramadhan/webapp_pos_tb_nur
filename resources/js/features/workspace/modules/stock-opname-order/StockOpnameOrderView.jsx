import { useMemo } from 'react';

import { buildStockOpnameOrderConfig } from '@/features/workspace/modules/stock-opname-order/stockOpnameOrderConfig';
import StockOpnameOrderFormView from './StockOpnameOrderFormView';
import StockOpnameOrderTableView from './StockOpnameOrderTableView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { mapStockOpnameOrderRow } from '@/features/workspace/backend/workspaceBackendAdapters';

export default function StockOpnameOrderView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
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
        resource: 'stock-opname-orders',
        initialPerPage: 25,
    });

    const config = useMemo(() => {
        const baseConfig = buildStockOpnameOrderConfig(page.stockOpnameOrder);
        return {
            ...baseConfig,
            table: {
                ...baseConfig.table,
                rows: rows.map(mapStockOpnameOrderRow),
                pageValue: total.toLocaleString('id-ID'),
                refreshLabel: loading ? 'Memuat...' : baseConfig.table.refreshLabel,
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
    }, [loading, page.stockOpnameOrder, reload, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

    if (mode === 'table') {
        return <StockOpnameOrderTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />;
    }

    return <StockOpnameOrderFormView config={config} activeLevel2Tab={activeLevel2Tab} onRefresh={reload} />;
}
