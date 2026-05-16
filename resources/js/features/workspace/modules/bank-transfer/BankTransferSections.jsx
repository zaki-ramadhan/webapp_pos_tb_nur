import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { FunnelIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import {
    TransactionDataTable,
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionReadonlyTextarea,
    TransactionSectionHeading,
    TransactionSwitch,
    TransactionTotalCard,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export function TransferValueInput({ prefix, value, maxWidthClassName = 'max-w-[276px]' }) {
    return (
        <div className={maxWidthClassName}>
            <TextInput
                value={value}
                readOnly
                prefix={prefix}
                className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                prefixClassName="min-w-[42px] justify-center border-r-[#d8dde7] bg-[#fbfcfe] px-2 text-[15px] text-[#9097aa]"
                inputClassName="text-right text-[15px] text-[#1f2436]"
            />
        </div>
    );
}

export function TransferMoneySection({ config, values, isDetail }) {
    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.transferTitle} icon="document" />

            <div className="mt-4 grid gap-10 xl:grid-cols-2">
                <section className="grid gap-y-4 sm:grid-cols-[280px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                    <TransactionFieldLabel label={config.labels.fromBank} required />
                    <ChipLookupField values={values.fromBankAccounts} placeholder={config.bankPlaceholder} onRemove={() => {}} searchLabel="Cari kas bank asal" />

                    <TransactionFieldLabel label={config.labels.fromBranch} required />
                    <ChipLookupField values={values.fromBranches} placeholder={config.branchPlaceholder} onRemove={() => {}} searchLabel="Cari cabang asal" />

                    {isDetail ? (
                        <>
                            <TransactionFieldLabel label={config.labels.exchangeRate} />
                            <div className="max-w-[276px]">
                                <div className="mb-1 text-[15px] text-[#1f2436]">{values.exchangeRateLabel}</div>
                                <TransferValueInput prefix="Rp" value={values.exchangeRate} />
                            </div>
                        </>
                    ) : null}

                    <TransactionFieldLabel label={config.labels.transferValue} required />
                    <div className="max-w-[276px]">
                        <TransferValueInput prefix={values.transferPrefix} value={values.transferValue} maxWidthClassName="" />
                    </div>

                    {isDetail ? (
                        <>
                            <div />
                            <div className="text-[17px] italic text-[#1f2436]">{values.transferWords}</div>
                        </>
                    ) : null}
                </section>

                <section className="grid gap-y-4 sm:grid-cols-[280px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                    <TransactionFieldLabel label={config.labels.toBank} required />
                    <ChipLookupField values={values.toBankAccounts} placeholder={config.bankPlaceholder} onRemove={() => {}} searchLabel="Cari kas bank tujuan" />

                    <TransactionFieldLabel label={config.labels.toBranch} required />
                    <ChipLookupField values={values.toBranches} placeholder={config.branchPlaceholder} onRemove={() => {}} searchLabel="Cari cabang tujuan" />

                    {isDetail ? (
                        <>
                            <TransactionFieldLabel label={config.labels.resultValue} required />
                            <TransferValueInput prefix={values.resultPrefix} value={values.resultValue} />

                            <div />
                            <div className="text-[17px] italic text-[#1f2436]">{values.resultWords}</div>
                        </>
                    ) : null}
                </section>
            </div>
        </div>
    );
}

export function TransferFeeSection({ config, values }) {
    return (
        <div className="flex min-h-[540px] flex-col">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 sm:max-w-[560px]">
                    <TextInput
                        value={values.feeLookup}
                        readOnly
                        placeholder={config.feeLookupPlaceholder}
                        trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </div>

                <div className="text-right text-[24px] font-normal text-[#1f2436]">{config.feeTitle}</div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
                <TransactionDataTable
                    columns={config.feeTable.columns}
                    rows={values.feeRows}
                    emptyLabel={config.feeTable.emptyLabel}
                    minWidthClassName="min-w-[880px]"
                />
            </div>
        </div>
    );
}

export function TransferInfoSection({ config, values, isDetail }) {
    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.infoTitle} icon="receipt" />

            <div className="mt-4 grid gap-y-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.notes} />
                <TransactionReadonlyTextarea value={values.notes} rows={4} className="min-h-[70px]" />

                {isDetail ? (
                    <>
                        <TransactionFieldLabel label={config.labels.reconcileStatus} />
                        <div className="space-y-4 pt-1">
                            {values.reconciliations.map((item) => (
                                <div key={item.id} className="grid gap-1 sm:grid-cols-[220px_1fr]">
                                    <div className="text-[17px] text-[#1f2436]">{item.bank}</div>
                                    <div className="text-[17px] text-[#1f2436]">
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
    );
}

export function TransferSummaryCards({ values }) {
    return (
        <div className="grid w-full max-w-[566px] overflow-hidden rounded-[4px] border border-[#d2d8e3] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)] sm:grid-cols-2">
            <TransactionTotalCard label={values.fromTotalLabel} value={values.fromTotalValue} className="max-w-none rounded-none border-0 shadow-none sm:border-r sm:border-r-[#d8dde7]" />
            <TransactionTotalCard label={values.toTotalLabel} value={values.toTotalValue} className="max-w-none rounded-none border-0 shadow-none" />
        </div>
    );
}

export function BankTransferHeader({ config, values, setValues, activeRecordId }) {
    return (
        <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <div className="grid gap-y-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.entryDate} required />
                <TransactionDateInput
                    value={values.entryDate}
                    onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                    className="max-w-[296px]"
                />
            </div>

            <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <div className="flex items-center justify-start gap-4 sm:justify-end">
                    <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                    {!activeRecordId ? (
                        <TransactionSwitch
                            checked={values.autoNumber}
                            onChange={(nextChecked) => setValues((current) => ({ ...current, autoNumber: nextChecked }))}
                        />
                    ) : null}
                </div>

                {values.autoNumber ? (
                    <SelectField
                        value={values.numberingType}
                        onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-[15px] text-[#1f2436]"
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
                        readOnly
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                )}
            </div>
        </div>
    );
}

export function TransferTableFilterBar({ table, filters, setFilters }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {table.filters.map((filter) => (
                <SelectField
                    key={filter.id}
                    value={filters[filter.id]}
                    onChange={(event) => setFilters((current) => ({ ...current, [filter.id]: event.target.value }))}
                    containerClassName="w-auto shrink-0"
                    className="h-[34px] min-w-[126px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="px-3 text-[15px] text-[#394157]"
                    iconClassName="mr-2 text-[#6c7894]"
                >
                    {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            ))}

            <button
                type="button"
                className="inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                aria-label={table.filterButtonLabel}
            >
                <FunnelIcon className="h-4.5 w-4.5" />
            </button>
        </div>
    );
}
