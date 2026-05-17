import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    CloseIcon,
    FunnelIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionHeaderButton,
    TransactionLineItemsSection,
    TransactionReadonlyTextarea,
    TransactionSectionHeading,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export function PaymentLineItemsSection({ config, values, setValues, handlers = {} }) {
    const detailTitle = values.lineItems.length
        ? `${values.lineItems.length} ${config.lineSectionTitle}`
        : config.lineSectionTitle;

    return (
        <TransactionLineItemsSection
            searchValue={values.lineLookup}
            onSearchChange={() => {}}
            searchReadOnly
            searchPlaceholder={config.lineSearchPlaceholder}
            searchInput={
                <AccountLookupTextInput
                    value={values.lineLookup}
                    placeholder={config.lineSearchPlaceholder}
                    searchLabel="Cari akun pembayaran"
                    dialogTitle="Pilih Akun Pembayaran"
                    onSelectAccount={(record) => handlers.onSelectLineAccount?.(record)}
                />
            }
            title={detailTitle}
            columns={config.lineTable.columns}
            rows={values.lineItems}
            emptyLabel={config.lineTable.emptyLabel}
            onRowClick={handlers.onEditLineItem}
            getRowClassName={
                handlers.onEditLineItem
                    ? () => 'cursor-pointer transition hover:bg-[#eef3fb]'
                    : undefined
            }
            spacerCellContent={
                <span className="inline-flex items-center justify-center text-[#a8afbe]">
                    <TableActionIcon className="h-4 w-4" />
                </span>
            }
            emptyLeadingCellContent={
                <span className="inline-flex items-center justify-center">
                    <TableActionIcon className="h-4 w-4" />
                </span>
            }
        />
    );
}

export function PaymentInfoSection({ config, values, isDetail, handlers = {} }) {
    return (
        <div className="min-h-[540px]">
            <div className={`grid gap-8 ${isDetail ? 'xl:grid-cols-2' : ''}`.trim()}>
                <section className="min-w-0">
                    <TransactionSectionHeading title={config.infoTitle} icon="document" />

                    <div className="mt-4 grid gap-y-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.checkNumber} />
                        <div className="max-w-[276px]">
                            <TextInput
                                value={values.checkNumber}
                                readOnly
                                className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                            />
                        </div>

                        <TransactionFieldLabel label={config.labels.recipient} />
                        <TransactionReadonlyTextarea value={values.recipient} className="min-h-[56px]" />

                        {isDetail ? (
                            <>
                                <TransactionFieldLabel label={config.labels.voided} />
                                <label className="inline-flex h-[34px] items-center gap-2 text-[17px] text-[#1f2436]">
                                    <input
                                        type="checkbox"
                                        checked={values.voided}
                                        readOnly
                                        className="h-[24px] w-[24px] rounded-[4px] border border-[#cfd6e2]"
                                    />
                                    <span>Ya</span>
                                </label>
                            </>
                        ) : null}

                        <TransactionFieldLabel label={config.labels.branch} required />
                        <ChipLookupField
                            values={values.branches}
                            placeholder={config.branchPlaceholder}
                            onRemove={(value) => handlers.onRemoveBranch?.(value)}
                            searchLabel="Cari cabang"
                            onSearch={handlers.onSelectBranch}
                        />

                        <TransactionFieldLabel label={config.labels.notes} />
                        <TransactionReadonlyTextarea value={values.notes} rows={4} className="min-h-[70px]" />

                        {isDetail ? (
                            <>
                                <TransactionFieldLabel label={config.labels.reconcileStatus} />
                                <div className="pt-1 text-[17px] italic text-[#1f2436]">{values.reconcileStatus}</div>

                                <TransactionFieldLabel label={config.labels.printStatus} />
                                <TextInput
                                    value={values.printStatus}
                                    readOnly
                                    className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-[15px] text-[#5f6779]"
                                />
                            </>
                        ) : null}
                    </div>
                </section>

                {isDetail ? (
                    <section className="min-w-0">
                        <TransactionSectionHeading title={config.additionalInfoTitle} icon="payment" />

                        <div className="mt-4 grid gap-y-4 sm:grid-cols-[250px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                            <TransactionFieldLabel label={config.labels.kapKjs} />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <TextInput
                                    value={values.kapNumber}
                                    readOnly
                                    className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-[15px] text-[#1f2436]"
                                />
                                <TextInput
                                    value={values.kjsNumber}
                                    readOnly
                                    className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-[15px] text-[#1f2436]"
                                />
                            </div>

                            <TransactionFieldLabel label={config.labels.ntpn} />
                            <TextInput
                                value={values.ntpn}
                                readOnly
                                className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                            />
                        </div>
                    </section>
                ) : null}
            </div>
        </div>
    );
}

export function CashPaymentHeader({ config, values, setValues, activeRecordId, handlers = {} }) {
    return (
        <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <div className="grid gap-y-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.cashBank} required />
                <ChipLookupField
                    values={values.bankAccounts}
                    placeholder={config.cashBankPlaceholder}
                    onRemove={(value) => handlers.onRemoveBankAccount?.(value)}
                    searchLabel="Cari kas atau bank"
                    onSearch={handlers.onSelectBankAccount}
                />

                <TransactionFieldLabel label={config.labels.entryDate} required />
                <TransactionDateInput
                    value={values.entryDate}
                    onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                    className="w-full max-w-[238px]"
                />
            </div>

            <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <div className="flex items-center justify-start gap-4 sm:justify-end">
                    <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                    {!activeRecordId ? (
                        <TransactionSwitch
                            checked={values.autoNumber}
                            onChange={(nextChecked) =>
                                setValues((current) => ({
                                    ...current,
                                    autoNumber: nextChecked,
                                }))
                            }
                        />
                    ) : null}
                </div>

                {values.autoNumber ? (
                    <SelectField
                        value={values.numberingType}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                numberingType: event.target.value,
                            }))
                        }
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
                        trailing={<CloseIcon className="h-4 w-4 text-[#1f2436]" />}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                        trailingClassName="px-3"
                    />
                )}

                <div />
                <div className="flex justify-end">
                    <TransactionHeaderButton label={config.takeButtonLabel} trailingChevron />
                </div>
            </div>
        </div>
    );
}

export function PaymentTableFilterBar({ table, filters, setFilters }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {table.filters.map((filter) => (
                <SelectField
                    key={filter.id}
                    value={filters[filter.id]}
                    onChange={(event) =>
                        setFilters((current) => ({
                            ...current,
                            [filter.id]: event.target.value,
                        }))
                    }
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
