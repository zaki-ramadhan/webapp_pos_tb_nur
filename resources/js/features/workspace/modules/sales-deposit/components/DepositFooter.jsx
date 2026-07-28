import { DepositAmountField, DepositStamp, DepositStatusPill } from '@/features/workspace/modules/shared/DepositWorkspaceShared';
import { TransactionDualTotalCard } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export { DepositAmountField, DepositStamp };

export default function DepositFooter({ values }) {
    const items = [
        { label: 'Sub Total', value: values.subtotal },
    ];

    if (values.taxEnabled && values.__taxId) {
        const rateLabel = values.taxRate ? ` (${values.taxRate}%)` : '';
        items.push({
            label: `PPN${rateLabel}`,
            value: values.taxTotalFormatted || 'Rp 0',
        });
    }

    items.push({ label: 'Total', value: values.total });

    return <TransactionDualTotalCard items={items} />;
}
