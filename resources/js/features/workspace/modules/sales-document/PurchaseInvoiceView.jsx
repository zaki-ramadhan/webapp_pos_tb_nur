import { useMemo } from 'react';

import { buildPurchaseInvoiceConfig, buildPurchaseInvoiceRecord } from '@/features/workspace/modules/sales-document/purchaseInvoiceConfig';
import SalesDocumentView from '@/features/workspace/modules/sales-document/SalesDocumentView';

export default function PurchaseInvoiceView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildPurchaseInvoiceConfig(page.purchaseInvoice), [page.purchaseInvoice]);
    const buildRecord = useMemo(() => (row = {}) => buildPurchaseInvoiceRecord(row, config), [config]);

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
