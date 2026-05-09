import { useMemo } from 'react';

import { buildSalesReceiptConfig } from '@/features/workspace/modules/salesReceiptConfig';
import SalesReceiptFormView from '@/features/workspace/modules/sales-receipt/SalesReceiptFormView';
import SalesReceiptTableView from '@/features/workspace/modules/sales-receipt/SalesReceiptTableView';

export default function SalesReceiptView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => {
        const baseConfig = buildSalesReceiptConfig(page.salesReceipt);

        return {
            ...baseConfig,
            rowMap: (baseConfig.table.rows ?? []).reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
        };
    }, [page.salesReceipt]);

    return mode === 'table' ? (
        <SalesReceiptTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <SalesReceiptFormView config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
