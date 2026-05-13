import { useMemo } from 'react';

import SalesDocumentView from '@/features/workspace/modules/SalesDocumentView';
import { buildSalesInvoiceConfig, buildSalesInvoiceRecord } from '@/features/workspace/modules/salesOrderConfig';

export default function SalesInvoiceView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildSalesInvoiceConfig(page.salesInvoice), [page.salesInvoice]);

    return (
        <SalesDocumentView
            pageId={page.id}
            config={config}
            buildRecord={buildSalesInvoiceRecord}
            mode={mode}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    );
}
