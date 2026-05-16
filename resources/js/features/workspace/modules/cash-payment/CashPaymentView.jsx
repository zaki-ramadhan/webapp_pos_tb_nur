import { useMemo } from 'react';

import CashPaymentFormView from './CashPaymentFormView';
import CashPaymentTableView from './CashPaymentTableView';

export default function CashPaymentView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(
        () => ({
            ...page.cashPayment,
            rowMap: (page.cashPayment.table?.rows ?? []).reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
        }),
        [page.cashPayment],
    );

    return mode === 'table' ? (
        <CashPaymentTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <CashPaymentFormView pageId={page.id} config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
