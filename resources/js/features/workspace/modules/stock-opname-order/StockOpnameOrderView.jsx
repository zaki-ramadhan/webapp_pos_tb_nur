import { useMemo } from 'react';

import { buildStockOpnameOrderConfig } from '@/features/workspace/modules/stock-opname-order/stockOpnameOrderConfig';
import StockOpnameOrderFormView from './StockOpnameOrderFormView';
import StockOpnameOrderTableView from './StockOpnameOrderTableView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { mapStockOpnameOrderRow } from '@/features/workspace/backend/workspaceBackendAdapters';

export default function StockOpnameOrderView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'stock-opname-orders',
        filters: {
            per_page: 100,
        },
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
            },
        };
    }, [loading, page.stockOpnameOrder, reload, rows, total]);

    if (mode === 'table') {
        return <StockOpnameOrderTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />;
    }

    return <StockOpnameOrderFormView config={config} activeLevel2Tab={activeLevel2Tab} onRefresh={reload} />;
}
