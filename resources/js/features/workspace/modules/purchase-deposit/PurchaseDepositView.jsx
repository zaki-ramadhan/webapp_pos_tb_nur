import { useMemo } from 'react';

import { buildPurchaseDepositConfig } from './purchaseDepositConfig';
import {
    DepositTableView,
} from '@/features/workspace/modules/shared/DepositWorkspaceShared';
import PurchaseDepositFormView from './PurchaseDepositFormView';

export default function PurchaseDepositView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildPurchaseDepositConfig(page.purchaseDeposit), [page.purchaseDeposit]);

    return mode === 'table' ? (
        <DepositTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            rowSearchFields={['number', 'billNumber', 'supplier', 'notes', 'status', 'total']}
        />
    ) : (
        <PurchaseDepositFormView config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
