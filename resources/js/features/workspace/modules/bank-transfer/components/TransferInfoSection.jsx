import TextareaField from '@/components/ui/TextareaField';
import {
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function TransferInfoSection({ config, values, setValues, isDetail }) {
    return (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.infoTitle} icon="receipt" />

                <div className="mt-4 grid gap-y-2.5 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4 pl-3 sm:pl-5">
                    <TransactionFieldLabel label={config.labels.notes} />
                    <TextareaField
                        value={values.notes}
                        onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))}
                        rows={4}
                        className="rounded-[4px] border-ui-border"
                        textareaClassName="min-h-[70px] px-4 py-3 text-xs sm:text-sm text-brand-dark"
                    />

                    {isDetail ? (
                        <>
                            <TransactionFieldLabel label={config.labels.reconcileStatus} className="mt-6 sm:mt-8" />
                            <div className="space-y-3 pt-1 mt-6 sm:mt-8">
                                {values.reconciliations.map((item) => {
                                    const isReconciled = item.status === 'Ya' || item.status?.startsWith('Ya');
                                    const hasDateInStatus = item.status?.includes('(');
                                    const statusLabel = isReconciled ? 'Ya' : (item.status || 'Belum');
                                    const dateFromStatus = hasDateInStatus ? item.status.match(/\([^)]+\)/)?.[0] : null;
                                    const rawDate = item.date || dateFromStatus;
                                    const displayDate = rawDate
                                        ? (rawDate.startsWith('(') ? rawDate : `(${rawDate})`)
                                        : null;

                                    return (
                                        <div key={item.id} className="grid gap-1 sm:grid-cols-[160px_1fr]">
                                            <div className="text-xs sm:text-sm text-brand-dark">{item.bank}</div>
                                            <div className="text-xs sm:text-sm text-brand-dark">
                                                <span className="italic">{statusLabel}</span>
                                                {statusLabel === 'Ya' && displayDate ? (
                                                    <span className="ml-2">{displayDate}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
