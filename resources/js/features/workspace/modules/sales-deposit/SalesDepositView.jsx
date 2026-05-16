import { useMemo } from 'react';

import { buildSalesDepositConfig, buildSalesDepositRecord } from '@/features/workspace/modules/sales-deposit/salesDepositConfig';
import SalesDepositFormView from './SalesDepositFormView';
import SalesDepositTableView from './SalesDepositTableView';

export default function SalesDepositView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildSalesDepositConfig(page.salesDeposit), [page.salesDeposit]);

    return mode === 'table' ? (
        <SalesDepositTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <SalesDepositFormView
            pageId={page.id}
            config={config}
            buildRecord={buildSalesDepositRecord}
            activeLevel2Tab={activeLevel2Tab}
        />
    );
}
