import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import {
    TransactionFieldLabel,
    TransactionReadonlyTextarea,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export function PurchasePaymentAdditionalInfoSection({ config, values, setValues, isDetail, handlers = {} }) {
    return (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.infoTitle} icon="document" />

                <div className="mt-4 grid gap-y-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4 pl-3 sm:pl-5">
                    <TransactionFieldLabel label={config.labels.paymentMethod} />
                    <div className="max-w-[276px]">
                        <SelectField
                            value={values.paymentMethod}
                            onChange={(event) =>
                                setValues?.((current) => ({
                                    ...current,
                                    paymentMethod: event.target.value,
                                }))
                            }
                            className="h-[40px] rounded-[4px] border-ui-border"
                            selectClassName="text-xs sm:text-sm text-brand-dark"
                        >
                            {['Tunai', 'Cek/Giro', 'Transfer Bank', 'Kartu Debit', 'Kartu Kredit', 'QRIS', 'Dompet Digital', 'Non Tunai Lainnya'].map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </div>

                    {isDetail ? (
                        <>
                            <TransactionFieldLabel label={config.labels.dueDatePph} />
                            <div className="max-w-[276px]">
                                <TextInput
                                    value={values.dueDatePph}
                                    readOnly
                                    className="h-[34px] rounded-[4px] border-ui-border"
                                    inputClassName="text-xs sm:text-sm text-brand-dark"
                                />
                            </div>

                            <TransactionFieldLabel label={config.labels.voided} />
                            <CheckboxField
                                id="voided"
                                label="Ya"
                                checked={values.voided}
                                disabled
                                align="center"
                                inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                containerClassName="w-auto inline-flex"
                            />
                        </>
                    ) : null}

                    <TransactionFieldLabel label={config.labels.notes} />
                    <TransactionReadonlyTextarea value={values.notes} rows={4} className="min-h-[70px]" />

                    {isDetail ? (
                        <>
                            <TransactionFieldLabel label={config.labels.printStatus} />
                            <TextInput
                                value={values.printStatus}
                                readOnly
                                className="h-[34px] max-w-[262px] rounded-[4px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-text-workspace-muted"
                            />
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
