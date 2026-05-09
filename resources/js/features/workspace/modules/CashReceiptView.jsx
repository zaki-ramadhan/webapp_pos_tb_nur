import { useMemo } from 'react';

import CashReceiptFormView from '@/features/workspace/modules/cash-receipt/CashReceiptFormView';
import CashReceiptTableView from '@/features/workspace/modules/cash-receipt/CashReceiptTableView';

export default function CashReceiptView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(
        () => ({
            ...page.cashReceipt,
            rowMap: (page.cashReceipt.table?.rows ?? []).reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
        }),
        [page.cashReceipt],
    );

    return mode === 'table' ? (
        <CashReceiptTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <CashReceiptFormView config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
