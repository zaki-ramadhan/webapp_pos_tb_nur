import { useMemo } from 'react';

import {
    buildStockTransferConfig,
} from '@/features/workspace/modules/stock-transfer/stockTransferConfig';
import StockTransferFormView from './StockTransferFormView';
import StockTransferTableView from './StockTransferTableView';

export default function StockTransferView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildStockTransferConfig(page.stockTransfer), [page.stockTransfer]);

    if (mode === 'table') {
        return <StockTransferTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />;
    }

    return <StockTransferFormView pageId={page.id} config={config} activeLevel2Tab={activeLevel2Tab} />;
}
