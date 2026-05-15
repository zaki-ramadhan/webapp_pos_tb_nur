import { useMemo } from 'react';

import SalesDocumentView from '@/features/workspace/modules/sales-document/SalesDocumentView';
import { buildSalesDeliveryConfig, buildSalesDeliveryRecord } from '@/features/workspace/modules/sales-document/salesOrderConfig';

export default function SalesDeliveryView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildSalesDeliveryConfig(page.salesDelivery), [page.salesDelivery]);

    return (
        <SalesDocumentView
            pageId={page.id}
            config={config}
            buildRecord={buildSalesDeliveryRecord}
            mode={mode}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    );
}
