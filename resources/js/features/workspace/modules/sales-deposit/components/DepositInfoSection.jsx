import TextareaField from '@/components/ui/TextareaField';
import {
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function DepositInfoSection({ config, values, setValues, isDetail }) {
    return (
        <section>
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.infoTitle} icon="info" />

                <div className="mt-4 grid gap-y-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4 pl-3 sm:pl-5">
                    <TransactionFieldLabel label={config.labels.address} />
                    <div className="max-w-[480px] w-full">
                        <TextareaField
                            value={values.address || ''}
                            onChange={isDetail ? undefined : (event) =>
                                setValues((current) => ({
                                    ...current,
                                    address: event.target.value,
                                }))
                            }
                            readOnly={isDetail}
                            rows={4}
                            className="border-ui-border bg-slate-50"
                            textareaClassName="min-h-[84px] text-xs sm:text-sm text-brand-dark bg-transparent"
                        />
                    </div>

                    <TransactionFieldLabel label={config.labels.notes} />
                    <div className="max-w-[480px] w-full">
                        <TextareaField
                            value={values.notes}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    notes: event.target.value,
                                }))
                            }
                            rows={4}
                            className="border-ui-border bg-slate-50"
                            textareaClassName="min-h-[84px] text-xs sm:text-sm text-brand-dark bg-transparent"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
