import { useMemo } from 'react';

import { buildPurchaseReturnConfig, buildPurchaseReturnRecord } from '@/features/workspace/modules/sales-document/purchaseReturnConfig';
import SalesDocumentView from '@/features/workspace/modules/sales-document/SalesDocumentView';

export default function PurchaseReturnView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildPurchaseReturnConfig(page.purchaseReturn), [page.purchaseReturn]);
    const buildRecord = useMemo(() => (row = {}) => buildPurchaseReturnRecord(row, config), [config]);

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
