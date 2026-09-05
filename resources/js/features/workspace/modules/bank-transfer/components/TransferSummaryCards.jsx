import { TransactionDualTotalCard } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { extractCleanAccountName } from '../bankTransferCalculations';

export default function TransferSummaryCards({ values }) {
    const rawFrom = values?.fromBankAccounts?.[0] || values?.fromBankLabel || values?.fromBankFull || values?.fromBank || '';
    const rawTo = values?.toBankAccounts?.[0] || values?.toBankLabel || values?.toBankFull || values?.toBank || '';
    const fromAccountName = extractCleanAccountName(rawFrom);
    const toAccountName = extractCleanAccountName(rawTo);

    const fromLabel = fromAccountName
        ? `Total ${fromAccountName}`
        : (values?.fromTotalLabel && values.fromTotalLabel !== 'Total Dari Kas/Bank' && values.fromTotalLabel !== 'Total Kas/Bank Asal' ? values.fromTotalLabel : 'Total');

    const toLabel = toAccountName
        ? `Total ${toAccountName}`
        : (values?.toTotalLabel && values.toTotalLabel !== 'Total Ke Kas/Bank' && values.toTotalLabel !== 'Total Kas/Bank Tujuan' ? values.toTotalLabel : 'Total');

    const items = [
        {
            label: fromLabel,
            value: values?.fromTotalValue || '0',
        },
        {
            label: toLabel,
            value: values?.toTotalValue || '0',
        },
    ];

    return <TransactionDualTotalCard items={items} />;
}
