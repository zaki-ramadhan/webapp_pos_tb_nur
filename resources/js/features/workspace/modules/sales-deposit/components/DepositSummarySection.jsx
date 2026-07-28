import { DepositStatusPill } from '@/features/workspace/modules/shared/DepositWorkspaceShared';
import { TransactionSectionHeading } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function DepositSummarySection({ config, values }) {
    return (
        <div className="w-full max-w-[540px]">
            <TransactionSectionHeading title={config.summaryTitle} icon="payment" />
            <section className="mt-4 rounded-[4px] border border-ui-border bg-white">
                <div className="py-1">
                    {values.summary.map(([label, value]) => (
                        label === 'Status' ? (
                            <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-ui-border-lightest px-4 py-2">
                                <span className="text-xs sm:text-sm text-brand-dark font-normal">{label}</span>
                                <DepositStatusPill value={value} />
                            </div>
                        ) : (
                            <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-ui-border-lightest px-4 py-2 last:border-b-0">
                                <span className="text-xs sm:text-sm text-brand-dark font-normal">{label}</span>
                                <span className="text-right text-xs sm:text-sm font-semibold text-text-darkest">
                                    {value}
                                </span>
                            </div>
                        )
                    ))}
                </div>
            </section>
        </div>
    );
}
