import TextareaField from '@/components/ui/TextareaField';
import {
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function TransferInfoSection({ config, values, setValues, isDetail }) {
    return (
        <div className="min-h-[540px]">
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.infoTitle} icon="receipt" />

                <div className="mt-4 grid gap-y-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
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
                            <TransactionFieldLabel label={config.labels.reconcileStatus} />
                            <div className="space-y-3 pt-1">
                                {values.reconciliations.map((item) => (
                                    <div key={item.id} className="grid gap-1 sm:grid-cols-[160px_1fr]">
                                        <div className="text-xs sm:text-sm text-brand-dark">{item.bank}</div>
                                        <div className="text-xs sm:text-sm text-brand-dark">
                                            <span className="italic">{item.status}</span>
                                            {item.date ? <span className="ml-8">{item.date}</span> : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
