import { TransactionDualTotalCard } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function PurchaseDepositFooter({ values }) {
    const items = [
        { label: 'Sub Total', value: values.subtotal || '0' },
    ];

    if (values.taxEnabled && values.__taxId) {
        const rateLabel = values.taxRate ? ` (${values.taxRate}%)` : '';
        items.push({
            label: `PPN${rateLabel}`,
            value: values.taxTotalFormatted || 'Rp 0',
        });
    }

    items.push({ label: 'Total', value: values.total || '0' });

    return <TransactionDualTotalCard items={items} />;
}
