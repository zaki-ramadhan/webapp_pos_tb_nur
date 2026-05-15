import { useMemo } from 'react';

import SalesDocumentView from '@/features/workspace/modules/sales-document/SalesDocumentView';
import { buildSalesDocumentRecord, buildSalesOrderConfig, sharedDetailDockActions } from '@/features/workspace/modules/sales-document/salesOrderConfig';

export default function PurchaseOrderView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildSalesOrderConfig(page.purchaseOrder), [page.purchaseOrder]);

    const buildRecord = useMemo(
        () => (row = {}) =>
            buildSalesDocumentRecord(row, config.draft, config.detailRecords, {
                customerPrefix: '[VJKT-0002]',
                includeAdvanceSummary: false,
                includePrintedSummary: true,
                dockActions: sharedDetailDockActions,
                showProcessButton: true,
                processStamp: row.status ? row.status.toUpperCase() : '',
            }),
        [config.detailRecords, config.draft],
    );

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
