import { useMemo } from 'react';

import SalesDocumentView from '@/features/workspace/modules/sales-document/SalesDocumentView';
import { buildSalesInvoiceConfig, buildSalesInvoiceRecord } from '@/features/workspace/modules/sales-document/salesInvoiceModuleConfig';

export default function SalesInvoiceView({ page, mode, activeLevel2Tab, level2Tabs = [], onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildSalesInvoiceConfig(page.salesInvoice), [page.salesInvoice]);

    return (
        <SalesDocumentView
            pageId={page.id}
            config={config}
            buildRecord={buildSalesInvoiceRecord}
            mode={mode}
            activeLevel2Tab={activeLevel2Tab}
            level2Tabs={level2Tabs}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    );
}
