import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    AccountLookupField,
    AccountLookupTextInput,
} from '@/features/workspace/shared/AccountLookupControls';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';

export function AssetChangeFieldRow({ label, required = false, children, alignTop = false, labelClassName = '' }) {
    return (
        <div className={`grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-x-4 ${alignTop ? 'sm:items-start' : 'sm:items-center'}`.trim()}>
            <TransactionFieldLabel label={label} required={required} className={`${alignTop ? 'pt-2' : ''} ${labelClassName}`.trim()} />
            <div>{children}</div>
        </div>
    );
}

export function AssetChangeLookupField({ values, placeholder, searchLabel, onRemove = null, className = '' }) {
    return (
        <ChipLookupField
            values={values}
            placeholder={placeholder}
            searchLabel={searchLabel}
            onRemove={onRemove}
            className={className}
            heightClassName="h-[40px]"
        />
    );
}

export function InlineCheckboxField({ checked, label = 'Ya' }) {
    return (
        <CheckboxField
            checked={checked}
            onChange={() => {}}
            readOnly
            label={label}
            size="md"
            align="center"
            containerClassName="w-auto"
            className="gap-2 text-base"
            labelClassName="text-base"
        />
    );
}

export function AssetChangeHeader({ config, values, setValues, isDetail }) {
    return (
        <div className="border-b border-[#d8dde7] px-4 py-4">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] xl:items-start">
                <div className="space-y-3">
                    <AssetChangeFieldRow label={config.labels.changeType}>
                        <SelectField value={values.changeType} disabled={isDetail} onChange={(event) => setValues((current) => ({ ...current, changeType: event.target.value }))} containerClassName="w-full sm:max-w-[334px]" className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-xs sm:text-sm text-[#1f2436]">
                            {config.changeTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                        </SelectField>
                    </AssetChangeFieldRow>
                    <AssetChangeFieldRow label={config.labels.asset} required>
                        <AssetChangeLookupField values={values.asset} placeholder={config.assetPlaceholder} searchLabel={config.assetSearchLabel} onRemove={isDetail ? null : (value) => setValues((current) => ({ ...current, asset: current.asset.filter((item) => item !== value) }))} className="max-w-[600px]" />
                    </AssetChangeFieldRow>
                    <AssetChangeFieldRow label={config.labels.lastDepreciation}>
                        <TextInput value={values.lastDepreciation} readOnly className="h-[40px] rounded-[4px] border-[#cfd6e2] sm:max-w-[334px]" inputClassName="text-xs sm:text-sm text-[#6b7280]" />
                    </AssetChangeFieldRow>
                </div>

                <div className="space-y-3 xl:justify-self-end xl:min-w-[420px]">
                    {isDetail ? (
                        <AssetChangeFieldRow label={config.labels.number} required labelClassName="sm:text-right">
                            <TextInput value={values.documentNumber} readOnly trailing={<span className="text-2xl font-semibold text-[#1f2436]">x</span>} className="h-[40px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-xs sm:text-sm text-[#1f2436]" trailingClassName="px-3" />
                        </AssetChangeFieldRow>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            <div className="flex items-center justify-start gap-4 sm:justify-end">
                                <TransactionFieldLabel label={config.labels.number} required />
                                <TransactionSwitch checked={values.autoNumber} onChange={(nextValue) => setValues((current) => ({ ...current, autoNumber: nextValue }))} />
                            </div>
                            {values.autoNumber ? (
                                <SelectField value={values.numberingType} onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))} className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-xs sm:text-sm text-[#1f2436]">
                                    {config.numberingOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                </SelectField>
                            ) : (
                                <TextInput value={values.documentNumber} onChange={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value }))} className="h-[40px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />
                            )}
                        </div>
                    )}
                    <AssetChangeFieldRow label={config.labels.date} labelClassName="sm:text-right">
                        <TransactionDateInput value={values.transactionDate} onChange={(nextValue) => setValues((current) => ({ ...current, transactionDate: nextValue }))} className="w-full sm:max-w-[230px]" />
                    </AssetChangeFieldRow>
                    <AssetChangeFieldRow label={config.labels.bookValue} labelClassName="sm:text-right">
                        <TextInput value={values.bookValue} readOnly className="h-[40px] rounded-[4px] border-[#cfd6e2] sm:max-w-[230px]" inputClassName="text-right text-xs sm:text-sm text-[#6b7280]" />
                    </AssetChangeFieldRow>
                </div>
            </div>
        </div>
    );
}

export function AssetChangeGeneralSection({ config, values, setValues, isDetail }) {
    return (
        <div className="min-h-[560px]">
            <TransactionSectionHeading title="Informasi umum" icon="document" />
            <div className="mt-4 grid gap-5 lg:max-w-[980px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                <div className="space-y-3">
                    <AssetChangeFieldRow label={config.labels.depreciationMethod}>
                        <SelectField value={values.depreciationMethod} disabled={isDetail} onChange={(event) => setValues((current) => ({ ...current, depreciationMethod: event.target.value }))} className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-xs sm:text-sm text-[#1f2436]">
                            {config.depreciationMethodOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                        </SelectField>
                    </AssetChangeFieldRow>
                    <AssetChangeFieldRow label={config.labels.residualValue}>
                        <FormattedAmountInput value={values.residualValue} readOnly={isDetail} onChange={(event) => setValues((current) => ({ ...current, residualValue: event.target.value }))} prefix="Rp" className="h-[40px] rounded-[4px] border-[#cfd6e2] sm:max-w-[406px]" inputClassName="text-right text-xs sm:text-sm text-[#1f2436]" prefixClassName="min-w-[46px] justify-center px-0 text-[#7a8498]" />
                    </AssetChangeFieldRow>
                </div>
                <div className="space-y-3">
                    <AssetChangeFieldRow label={config.labels.changeNotes} alignTop>
                        <TextareaField value={values.changeNotes} readOnly={isDetail} onChange={(event) => setValues((current) => ({ ...current, changeNotes: event.target.value }))} rows={4} className="rounded-[4px] border-[#cfd6e2]" textareaClassName="min-h-[140px] text-xs sm:text-sm text-[#1f2436]" />
                    </AssetChangeFieldRow>
                </div>
            </div>
        </div>
    );
}

export function AssetChangeExpenseSection({ config, values, setValues }) {
    return (
        <div className="min-h-[560px]">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 lg:flex-row lg:items-start lg:justify-between">
                <AccountLookupTextInput value={values.expenseSearch} placeholder={config.expenseSearchPlaceholder} className="h-[40px] rounded-[4px] border-[#cfd6e2] lg:max-w-[560px]" inputClassName="text-xs sm:text-sm text-[#1f2436]" dialogTitle="Pilih Akun Pengeluaran" searchLabel="Cari akun pengeluaran" onSelectAccount={(_, label) => setValues((current) => ({ ...current, expenseSearch: label }))} />
                <div className="text-right text-2xl font-normal text-[#1f2436]">{config.labels.expenseTitle}</div>
            </div>
            <div className="mt-4 overflow-x-auto">
                <TransactionDataTable columns={config.expenseTable.columns} rows={values.expenseRows} emptyLabel={config.expenseTable.emptyLabel} minWidthClassName={config.expenseTable.minWidthClassName} renderCell={({ row, column }) => row[column.id] ?? ''} />
            </div>
        </div>
    );
}
