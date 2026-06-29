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
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';

export default function SalesDocumentFormHeader({
    pageId,
    config,
    values,
    setValues,
    isDetail,
    backendConfig,
    handlers,
}) {
    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
            {/* Left Column */}
            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.customer} required />
                    <div className="max-w-[320px] w-full">
                        <AccountLookupTextInput
                            id="customer"
                            resource={backendConfig?.partnerResource ?? 'customers'}
                            value={values.customer?.[0] ?? ''}
                            placeholder={config.customerPlaceholder ?? 'Cari/Pilih Pelanggan...'}
                            searchLabel={config.customerSearchLabel ?? 'Cari pelanggan'}
                            onSelectAccount={(record, label) => {
                                setValues((current) => ({
                                    ...current,
                                    __partnerId: record ? record.id : null,
                                    customer: label ? [label] : [],
                                    address: record ? (record.shipping_address ?? record.billing_address ?? current.address) : '',
                                }));
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
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
                </div>

                {config.headerSelectLookupField ? (
                    <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                        <TransactionFieldLabel label={config.headerSelectLookupField.label} required={config.headerSelectLookupField.required} />
                        <div className="max-w-[320px] w-full flex items-center gap-x-2">
                            <div className="w-[110px] shrink-0">
                                <SelectField
                                    value={values[config.headerSelectLookupField.selectValueKey] ?? 'Faktur'}
                                    onChange={(event) =>
                                        setValues((current) => ({
                                            ...current,
                                            [config.headerSelectLookupField.selectValueKey]: event.target.value,
                                        }))
                                    }
                                    className="h-[40px] rounded-[4px] border-ui-border w-full"
                                    selectClassName="text-xs sm:text-sm text-brand-dark"
                                >
                                    {config.headerSelectLookupField.options.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </SelectField>
                            </div>
                            <div className="flex-1 min-w-0">
                                <AccountLookupTextInput
                                    id={config.headerSelectLookupField.valueKey}
                                    resource={String(pageId).toLowerCase().includes('purchase') ? 'purchase-invoices' : 'sales-invoices'}
                                    value={values[config.headerSelectLookupField.valueKey]?.[0] ?? ''}
                                    placeholder={config.headerSelectLookupField.placeholder ?? 'Cari/Pilih Faktur...'}
                                    searchLabel={config.headerSelectLookupField.searchLabel ?? 'Cari faktur'}
                                    onSelectAccount={(record, label) => {
                                        setValues((current) => ({
                                            ...current,
                                            __relatedDocumentId: record ? record.id : null,
                                            [config.headerSelectLookupField.valueKey]: label ? [label] : [],
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ) : null}

                {config.headerTextField ? (
                    <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                        <TransactionFieldLabel label={config.headerTextField.label} required={config.headerTextField.required} />
                        <div className="max-w-[320px] w-full">
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
                                            className="text-lg font-semibold text-brand-dark"
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
                                className="h-[40px] rounded-[4px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                                trailingClassName="px-3"
                            />
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px] md:pl-12 lg:pl-16 xl:pl-20 2xl:pl-28">
                <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div className="flex items-center justify-start gap-4">
                        <TransactionFieldLabel label={config.labels.documentNumber} required />
                    </div>

                    <div className="max-w-[282px] w-full justify-self-end">
                        {!isDetail && values.autoNumber ? (
                            <SelectField
                                value={values.numberingType}
                                onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))}
                                className="h-[40px] rounded-[4px] border-ui-border w-full"
                                selectClassName="text-xs sm:text-sm text-brand-dark"
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
                                trailing={<span className="text-lg font-semibold text-brand-dark">×</span>}
                                className="h-[40px] rounded-[4px] border-ui-border w-full"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                                trailingClassName="px-3"
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div />
                    <div className="flex justify-end relative justify-self-end">
                        <SalesDocumentHeaderButtons config={config} values={values} setValues={setValues} isDetail={isDetail} />
                    </div>
                </div>
            </div>
        </div>
    );
}
