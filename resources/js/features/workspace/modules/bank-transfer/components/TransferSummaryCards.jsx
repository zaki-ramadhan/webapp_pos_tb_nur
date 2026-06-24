import { TransactionTotalCard } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function TransferSummaryCards({ values }) {
    return (
        <div className="grid w-full max-w-[566px] overflow-hidden rounded-[4px] border border-table-cell-border bg-white shadow-card-medium sm:grid-cols-2">
            <TransactionTotalCard label={values.fromTotalLabel} value={values.fromTotalValue} className="max-w-none rounded-none border-0 shadow-none sm:border-r sm:border-r-ui-border-medium" />
            <TransactionTotalCard label={values.toTotalLabel} value={values.toTotalValue} className="max-w-none rounded-none border-0 shadow-none" />
        </div>
    );
}
