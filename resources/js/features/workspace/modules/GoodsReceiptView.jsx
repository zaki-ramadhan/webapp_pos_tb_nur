import { useMemo } from 'react';

import SalesDocumentView from '@/features/workspace/modules/SalesDocumentView';
import { buildGoodsReceiptConfig, buildGoodsReceiptRecord } from '@/features/workspace/modules/goodsReceiptConfig';

export default function GoodsReceiptView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildGoodsReceiptConfig(page.goodsReceipt), [page.goodsReceipt]);

    const buildRecord = useMemo(() => (row = {}) => buildGoodsReceiptRecord(row, config), [config]);

    return (
        <SalesDocumentView
            pageId={page.id}
            config={config}
            buildRecord={buildRecord}
            mode={mode}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    );
}
