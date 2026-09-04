import { TransactionDualTotalCard } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function TransferSummaryCards({ values }) {
    const items = [
        { label: values?.fromTotalLabel || 'Total Dari Kas/Bank', value: values?.fromTotalValue || '0' },
        { label: values?.toTotalLabel || 'Total Ke Kas/Bank', value: values?.toTotalValue || '0' },
    ];

    return <TransactionDualTotalCard items={items} />;
}
