import { TransactionDualTotalCard } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function TransferSummaryCards({ values }) {
    return (
        <TransactionDualTotalCard
            items={[
                { label: values.fromTotalLabel, value: values.fromTotalValue },
                { label: values.toTotalLabel, value: values.toTotalValue },
            ]}
        />
    );
}
