import { useMemo } from 'react';

import SalesDocumentView from '@/features/workspace/modules/sales-document/SalesDocumentView';
import { buildSalesReturnConfig, buildSalesReturnRecord } from '@/features/workspace/modules/sales-document/salesReturnConfig';

export default function SalesReturnView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildSalesReturnConfig(page.salesReturn), [page.salesReturn]);
    const buildRecord = useMemo(() => (row = {}) => buildSalesReturnRecord(row, config), [config]);

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
