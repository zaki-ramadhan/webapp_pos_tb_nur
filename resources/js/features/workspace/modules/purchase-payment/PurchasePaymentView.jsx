import { useMemo } from 'react';

import { buildPurchasePaymentConfig } from './purchasePaymentConfig';
import PurchasePaymentFormView from './PurchasePaymentFormView';
import PurchasePaymentTableView from './PurchasePaymentTableView';

export default function PurchasePaymentView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(
        () => ({
            ...buildPurchasePaymentConfig(page.purchasePayment),
            rowMap: (page.purchasePayment?.table?.rows ?? []).reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
        }),
        [page.purchasePayment],
    );

    return mode === 'table' ? (
        <PurchasePaymentTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <PurchasePaymentFormView pageId={page.id} config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
