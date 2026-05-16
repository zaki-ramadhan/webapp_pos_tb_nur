import { useMemo } from 'react';

import { buildStockOpnameOrderConfig } from '@/features/workspace/modules/stock-opname-order/stockOpnameOrderConfig';
import StockOpnameOrderFormView from './StockOpnameOrderFormView';
import StockOpnameOrderTableView from './StockOpnameOrderTableView';

export default function StockOpnameOrderView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildStockOpnameOrderConfig(page.stockOpnameOrder), [page.stockOpnameOrder]);

    if (mode === 'table') {
        return <StockOpnameOrderTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />;
    }

    return <StockOpnameOrderFormView config={config} activeLevel2Tab={activeLevel2Tab} />;
}
