import CheckboxField from '@/components/ui/CheckboxField';
import TextareaField from '@/components/ui/TextareaField';
import {
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export function ItemRequestAdditionalInfoSection({ config, values, setValues, isDetail, handlers = {} }) {
    return (
        <div className="min-h-[520px]">
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

                <div className="mt-4 space-y-3 pl-3 sm:pl-5">
                    <div className="grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start">
                        <TransactionFieldLabel label={config.labels.notes} />
                        <TextareaField
                            value={values.notes}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    notes: event.target.value,
                                }))
                            }
                            rows={4}
                            className="rounded-[4px] border-ui-border"
                            textareaClassName="min-h-[70px] text-xs sm:text-sm text-brand-dark"
                        />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center">
                        <TransactionFieldLabel label={config.labels.closeRequest} />
                        <CheckboxField
                            id="closeRequest"
                            label="Ya (Tidak dapat diproses lagi)"
                            checked={Boolean(values.closeRequest)}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    closeRequest: event.target.checked,
                                }))
                            }
                            align="center"
                            inputClassName="h-3.5 w-3.5 rounded-[3px]"
                            containerClassName="w-auto inline-flex"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
