import { TransactionTotalCard } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function TransferSummaryCards({ values }) {
    return (
        <div className="grid w-full max-w-[566px] overflow-hidden rounded-[4px] border border-[#d2d8e3] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)] sm:grid-cols-2">
            <TransactionTotalCard label={values.fromTotalLabel} value={values.fromTotalValue} className="max-w-none rounded-none border-0 shadow-none sm:border-r sm:border-r-[#d8dde7]" />
            <TransactionTotalCard label={values.toTotalLabel} value={values.toTotalValue} className="max-w-none rounded-none border-0 shadow-none" />
        </div>
    );
}
