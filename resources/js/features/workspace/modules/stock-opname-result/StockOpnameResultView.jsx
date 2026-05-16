import { useMemo } from 'react';

import {
    buildStockOpnameResultConfig,
} from '@/features/workspace/modules/stock-opname-result/stockOpnameResultConfig';
import StockOpnameResultFormView from './StockOpnameResultFormView';
import StockOpnameResultTableView from './StockOpnameResultTableView';

export default function StockOpnameResultView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildStockOpnameResultConfig(page.stockOpnameResult), [page.stockOpnameResult]);

    if (mode === 'table') {
        return <StockOpnameResultTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />;
    }

    return <StockOpnameResultFormView config={config} activeLevel2Tab={activeLevel2Tab} />;
}
