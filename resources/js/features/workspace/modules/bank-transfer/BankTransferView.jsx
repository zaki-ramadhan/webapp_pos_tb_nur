import { useMemo } from 'react';

import BankTransferFormView from './BankTransferFormView';
import BankTransferTableView from './BankTransferTableView';

export default function BankTransferView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(
        () => ({
            ...page.bankTransfer,
            rowMap: (page.bankTransfer.table?.rows ?? []).reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
        }),
        [page.bankTransfer],
    );

    return mode === 'table' ? (
        <BankTransferTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <BankTransferFormView pageId={page.id} config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
