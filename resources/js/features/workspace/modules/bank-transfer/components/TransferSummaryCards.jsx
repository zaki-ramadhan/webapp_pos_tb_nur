import { TransactionDualTotalCard } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { extractCleanAccountName } from '../bankTransferCalculations';

export default function TransferSummaryCards({ values }) {
    // Prioritaskan nilai computed dari buildTotals (atomic, selalu sinkron dengan state).
    // Fallback ke re-komputasi lokal jika computed belum tersedia (e.g., render pertama).
    const computedFromLabel = values?.fromTotalLabel;
    const computedToLabel = values?.toTotalLabel;

    const rawFrom = values?.fromBankAccounts?.[0] || values?.fromBankLabel || values?.fromBankFull || values?.fromBank || '';
    const rawTo = values?.toBankAccounts?.[0] || values?.toBankLabel || values?.toBankFull || values?.toBank || '';
    const fromAccountName = extractCleanAccountName(rawFrom);
    const toAccountName = extractCleanAccountName(rawTo);

    const fromLabel = fromAccountName
        ? `Total ${fromAccountName}`
        : (computedFromLabel && computedFromLabel !== 'Total' && computedFromLabel !== 'Total Dari Kas/Bank' && computedFromLabel !== 'Total Kas/Bank Asal'
            ? computedFromLabel
            : 'Total');

    const toLabel = toAccountName
        ? `Total ${toAccountName}`
        : (computedToLabel && computedToLabel !== 'Total' && computedToLabel !== 'Total Ke Kas/Bank' && computedToLabel !== 'Total Kas/Bank Tujuan'
            ? computedToLabel
            : 'Total');

    const items = [
        {
            id: 'transfer-from-total-card',
            label: fromLabel,
            value: values?.fromTotalValue || '0',
        },
        {
            id: 'transfer-to-total-card',
            label: toLabel,
            value: values?.toTotalValue || '0',
        },
    ];

    return <TransactionDualTotalCard items={items} />;
}
