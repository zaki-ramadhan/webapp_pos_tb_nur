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
        <div className="border-b border-[#d8dde7] px-4 py-4">
            <div className={`grid gap-x-8 gap-y-3 ${isDetail ? 'xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]' : 'xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]'}`.trim()}>
                <div className={`grid gap-y-3 ${isDetail ? 'sm:grid-cols-[130px_minmax(0,1fr)_180px]' : 'sm:grid-cols-[130px_minmax(0,1fr)]'} sm:items-center sm:gap-x-4`.trim()}>
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
                    {isDetail ? (
                        <div className="max-w-[180px]">
                            <TextInput value={values.currency} readOnly className="h-[40px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />
                        </div>
                    ) : null}

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

                    {values.exchangeRate ? (
                        <>
                            <TransactionFieldLabel label={config.labels.exchangeRate ?? 'Kurs'} />
                            <div className="max-w-[520px]">
                                {values.exchangeRateLabel ? (
                                    <div className="mb-1 text-xs leading-4 text-[#1f2436]">{values.exchangeRateLabel}</div>
                                ) : null}
                                <div className="flex flex-wrap gap-3">
                                    <TextInput
                                        value={values.exchangeRate}
                                        readOnly
                                        prefix={values.exchangeRatePrefix ?? 'Rp'}
                                        className="h-[34px] w-full max-w-[186px] rounded-[4px] border-[#cfd6e2]"
                                        prefixClassName="min-w-[42px] justify-center border-r-[#d8dde7] bg-[#fbfcfe] px-2 text-xs sm:text-sm text-[#9097aa]"
                                        inputClassName="text-right text-xs sm:text-sm text-[#1f2436]"
                                    />
                                    {(values.showSecondaryExchangeRateField ?? config.showSecondaryExchangeRateField ?? Boolean(values.secondaryExchangeRate)) ? (
                                        <TextInput
                                            value={values.secondaryExchangeRate ?? ''}
                                            readOnly
                                            prefix={values.secondaryExchangeRatePrefix ?? 'Pjk'}
                                            className="h-[34px] w-full max-w-[186px] rounded-[4px] border-[#cfd6e2]"
                                            prefixClassName="min-w-[42px] justify-center border-r-[#d8dde7] bg-[#fbfcfe] px-2 text-xs sm:text-sm text-[#9097aa]"
                                            inputClassName="text-right text-xs sm:text-sm text-[#1f2436]"
                                        />
                                    ) : null}
                                </div>
                            </div>
                            {isDetail ? <div /> : null}
                        </>
                    ) : null}

                    {config.headerLookupField ? (
                        <>
                            <TransactionFieldLabel label={config.headerLookupField.label} />
                            <ChipLookupField
                                values={values[config.headerLookupField.valueKey] ?? []}
                                placeholder={config.headerLookupField.placeholder ?? 'Cari/Pilih...'}
                                onRemove={(value) =>
                                    setValues((current) => ({
                                        ...current,
                                        [config.headerLookupField.valueKey]: current[config.headerLookupField.valueKey].filter((item) => item !== value),
                                    }))
                                }
                                onSearch={handlers.onSelectShippingMethod}
                                searchLabel={config.headerLookupField.searchLabel ?? config.headerLookupField.label}
                            />
                            {isDetail ? <div /> : null}
                        </>
                    ) : null}

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

                <div className="grid gap-y-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                    <div className="flex items-center justify-start gap-4 sm:justify-end">
                        <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                        {!isDetail ? (
                            <TransactionSwitch checked={values.autoNumber} onChange={(nextValue) => setValues((current) => ({ ...current, autoNumber: nextValue }))} />
                        ) : null}
                    </div>

                    {!isDetail && values.autoNumber ? (
                        <SelectField
                            value={values.numberingType}
                            onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
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
                            readOnly={isDetail}
                            trailing={<span className="text-lg font-semibold text-[#1f2436]">×</span>}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-xs sm:text-sm text-[#1f2436]"
                            trailingClassName="px-3"
                        />
                    )}

                    <div />
                    <SalesDocumentHeaderButtons config={config} values={values} isDetail={isDetail} />
                </div>
            </div>
        </div>
    );
}
