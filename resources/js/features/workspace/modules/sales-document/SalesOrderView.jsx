import { useMemo } from 'react';

import SalesDocumentView from '@/features/workspace/modules/sales-document/SalesDocumentView';
import { buildSalesOrderConfig, buildSalesOrderRecord } from '@/features/workspace/modules/sales-document/salesOrderConfig';

export default function SalesOrderView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildSalesOrderConfig(page.salesOrder), [page.salesOrder]);

    return (
        <SalesDocumentView
            pageId={page.id}
            config={config}
            buildRecord={buildSalesOrderRecord}
            mode={mode}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    );
}
