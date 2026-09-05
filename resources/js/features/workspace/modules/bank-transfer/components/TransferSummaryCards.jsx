import { TransactionDualTotalCard } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { extractCleanAccountName } from '../bankTransferCalculations';

export default function TransferSummaryCards({ values }) {
    const fromAccountName = extractCleanAccountName(values?.fromBankAccounts?.[0]);
    const toAccountName = extractCleanAccountName(values?.toBankAccounts?.[0]);

    const items = [
        {
            label: fromAccountName ? `Total ${fromAccountName}` : (values?.fromTotalLabel && values.fromTotalLabel !== 'Total Dari Kas/Bank' ? values.fromTotalLabel : 'Total'),
            value: values?.fromTotalValue || '0',
        },
        {
            label: toAccountName ? `Total ${toAccountName}` : (values?.toTotalLabel && values.toTotalLabel !== 'Total Ke Kas/Bank' ? values.toTotalLabel : 'Total'),
            value: values?.toTotalValue || '0',
        },
    ];

    return <TransactionDualTotalCard items={items} />;
}
