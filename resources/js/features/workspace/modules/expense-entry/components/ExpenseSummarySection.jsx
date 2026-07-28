import { TransactionSectionHeading } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function ExpenseSummarySection({ config, values }) {
    return (
        <div className="min-h-0">
            <TransactionSectionHeading title={config.summaryTitle} icon="document" />

            <div className="mt-4 max-w-[860px] overflow-hidden rounded-[4px] border border-table-cell-border bg-white shadow-card-medium">
                <div className="grid grid-cols-[minmax(0,1fr)_220px] border-b border-ui-border-medium px-4 py-3 text-xs sm:text-sm text-brand-dark">
                    <span>{config.summaryRows.paidAmountLabel}</span>
                    <span className="text-right font-semibold text-text-darkest">{values.paidAmount}</span>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_220px] px-4 py-3 text-xs sm:text-sm text-brand-dark">
                    <span>{config.summaryRows.statusLabel}</span>
                    <span className="text-right font-semibold text-text-darkest">{values.status}</span>
                </div>
            </div>
        </div>
    );
}
