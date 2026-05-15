import { useMemo } from 'react';

import SalesDocumentView from '@/features/workspace/modules/sales-document/SalesDocumentView';
import { buildSalesQuoteConfig, buildSalesQuoteRecord } from '@/features/workspace/modules/sales-document/salesOrderConfig';

export default function SalesQuoteView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildSalesQuoteConfig(page.salesQuote), [page.salesQuote]);

    return (
        <SalesDocumentView
            pageId={page.id}
            config={config}
            buildRecord={buildSalesQuoteRecord}
            mode={mode}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    );
}
