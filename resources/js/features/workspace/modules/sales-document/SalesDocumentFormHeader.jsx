import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    SalesDocumentHeaderButtons,
} from '@/features/workspace/modules/sales-document/salesDocumentViewShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';

export default function SalesDocumentFormHeader({
    pageId,
    config,
    values,
    setValues,
    isDetail,
    backendConfig,
    handlers,
    onSelectCustomer,
}) {
    return (
        <div className="px-4 pt-4 pb-0">
            <div className={`grid gap-x-8 gap-y-3 ${isDetail ? 'xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]' : 'xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]'}`.trim()}>
                <div className="grid gap-y-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                    <TransactionFieldLabel label={config.labels.customer} required />
                    <ChipLookupField
                        values={values.customer}
                        placeholder={config.customerPlaceholder ?? 'Cari/Pilih Pelanggan...'}
                        onRemove={() =>
                            setValues((current) => ({
                                ...current,
                                customer: [],
                                __partnerId: null,
                            }))
                        }
                        onSearch={onSelectCustomer}
                        searchLabel={config.customerSearchLabel ?? 'Cari pelanggan'}
                    />

                    <TransactionFieldLabel label={config.labels.entryDate} required />
                    <TransactionDateInput
                        value={values.entryDate}
                        onChange={(nextDisplayValue) =>
                            setValues((current) => ({
                                ...current,
                                entryDate: nextDisplayValue,
                            }))
                        }
                    />



                    {config.headerTextField ? (
                        <>
                            <TransactionFieldLabel label={config.headerTextField.label} required={config.headerTextField.required} />
                            <TextInput
                                value={values[config.headerTextField.valueKey] ?? ''}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        [config.headerTextField.valueKey]: event.target.value,
                                    }))
                                }
                                trailing={
                                    values[config.headerTextField.valueKey] ? (
                                        <button
                                            type="button"
                                            className="text-lg font-semibold text-[#1f2436]"
                                            onClick={() =>
                                                setValues((current) => ({
                                                    ...current,
                                                    [config.headerTextField.valueKey]: '',
                                                }))
                                            }
                                        >
                                            ×
                                        </button>
                                    ) : null
                                }
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-xs sm:text-sm text-[#1f2436]"
                                trailingClassName="px-3"
                            />
                            {isDetail ? <div /> : null}
                        </>
                    ) : null}
                </div>

                <div className="grid gap-y-3 sm:grid-cols-[230px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                    <div className="flex items-center justify-start gap-4 sm:justify-end">
                        <TransactionFieldLabel label={config.labels.documentNumber} required className="whitespace-nowrap sm:text-right" />
                        {!isDetail ? (
                            <TransactionSwitch checked={values.autoNumber} onChange={(nextValue) => setValues((current) => ({ ...current, autoNumber: nextValue }))} />
                        ) : null}
                    </div>

                    <div className="flex sm:justify-end">
                        {!isDetail && values.autoNumber ? (
                            <SelectField
                                value={values.numberingType}
                                onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2] max-w-[282px] w-full"
                                selectClassName="text-xs sm:text-sm text-[#1f2436]"
                            >
                                {config.numberingOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </SelectField>
                        ) : (
                            <TextInput
                                value={values.documentNumber}
                                onChange={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value, autoNumber: false }))}
                                onBlur={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value.trim() }))}
                                maxLength={120}
                                readOnly={isDetail}
                                trailing={<span className="text-lg font-semibold text-[#1f2436]">×</span>}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2] max-w-[282px] w-full"
                                inputClassName="text-xs sm:text-sm text-[#1f2436]"
                                trailingClassName="px-3"
                            />
                        )}
                    </div>

                    <div />
                    <div className="flex sm:justify-end">
                        <SalesDocumentHeaderButtons config={config} values={values} isDetail={isDetail} />
                    </div>
                </div>
            </div>
        </div>
    );
}
