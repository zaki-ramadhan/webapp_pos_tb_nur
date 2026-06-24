import { useState, useRef } from 'react';

import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    CloseIcon,
    FunnelIcon,
    ChevronDownIcon,
} from '@/features/workspace/shared/Icons';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
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
                    ? () => 'cursor-pointer transition hover:bg-workspace-hover-bg'
                    : undefined
            }
        />
    );
}

export function PaymentInfoSection({ config, values, isDetail, handlers = {} }) {
    return (
        <div className="min-h-[540px]">
            <div className={`grid gap-8 ${isDetail ? 'xl:grid-cols-2' : ''}`.trim()}>
                <section className={`min-w-0 ${!isDetail ? 'lg:max-w-[50%] w-full' : ''}`.trim()}>
                    <TransactionSectionHeading title={config.infoTitle} icon="document" />

                    <div className="mt-4 grid gap-y-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.checkNumber} />
                        <div className="max-w-[276px]">
                            <TextInput
                                value={values.checkNumber}
                                readOnly
                                className="h-[34px] rounded-[4px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                            />
                        </div>

                        <TransactionFieldLabel label={config.labels.recipient} />
                        <TransactionReadonlyTextarea value={values.recipient} className="min-h-[56px]" />

                        {isDetail ? (
                            <>
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
                                <TransactionFieldLabel label={config.labels.reconcileStatus} />
                                <div className="pt-1 text-base italic text-brand-dark">{values.reconcileStatus}</div>

                                <TransactionFieldLabel label={config.labels.printStatus} />
                                <TextInput
                                    value={values.printStatus}
                                    readOnly
                                    className="h-[34px] rounded-[4px] border-ui-border"
                                    inputClassName="text-xs sm:text-sm text-text-workspace-muted"
                                />
                            </>
                        ) : null}
                    </div>
                </section>

                {isDetail ? (
                    <section className="min-w-0">
                        <TransactionSectionHeading title={config.additionalInfoTitle} icon="payment" />

                        <div className="mt-4 grid gap-y-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                            <TransactionFieldLabel label={config.labels.kapKjs} />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <TextInput
                                    value={values.kapNumber}
                                    readOnly
                                    className="h-[34px] rounded-[4px] border-ui-border"
                                    inputClassName="text-xs sm:text-sm text-brand-dark"
                                />
                                <TextInput
                                    value={values.kjsNumber}
                                    readOnly
                                    className="h-[34px] rounded-[4px] border-ui-border"
                                    inputClassName="text-xs sm:text-sm text-brand-dark"
                                />
                            </div>

                            <TransactionFieldLabel label={config.labels.ntpn} />
                            <TextInput
                                value={values.ntpn}
                                readOnly
                                className="h-[34px] rounded-[4px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                            />
                        </div>
                    </section>
                ) : null}
            </div>
        </div>
    );
}

export function CashPaymentHeader({ config, values, setValues, activeRecordId, handlers = {} }) {
    const [openAmbil, setOpenAmbil] = useState(false);
    const ambilButtonRef = useRef(null);

    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
            <div className="flex flex-col gap-y-3 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.cashBank} required htmlFor="cashBank" />
                    <div className="max-w-[320px] w-full">
                        <ChipLookupField
                            id="cashBank"
                            values={values.bankAccounts}
                            placeholder={config.cashBankPlaceholder}
                            onRemove={(value) => handlers.onRemoveBankAccount?.(value)}
                            searchLabel="Cari kas atau bank"
                            onSearch={handlers.onSelectBankAccount}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.entryDate} required htmlFor="entryDate" />
                    <TransactionDateInput
                        id="entryDate"
                        value={values.entryDate}
                        onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-y-3 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div className="flex items-center justify-start gap-4">
                        <TransactionFieldLabel label={config.labels.documentNumber} required htmlFor="documentNumber" />
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

                    <div className="max-w-[240px] w-full justify-self-end">
                        {values.autoNumber ? (
                            <SelectField
                                id="documentNumber"
                                value={values.numberingType}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        numberingType: event.target.value,
                                    }))
                                }
                                className="h-[40px] rounded-[4px] border-ui-border"
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
                                id="documentNumber"
                                value={values.documentNumber}
                                onChange={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value }))}
                                onBlur={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value.trim() }))}
                                maxLength={120}
                                readOnly={Boolean(activeRecordId)}
                                trailing={<CloseIcon className="h-4 w-4 text-brand-dark" />}
                                className="h-[40px] rounded-[4px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                                trailingClassName="px-3"
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div />
                    <div className="flex justify-end relative justify-self-end">
                        <button
                            ref={ambilButtonRef}
                            type="button"
                            onClick={() => setOpenAmbil((o) => !o)}
                            className="inline-flex h-[34px] items-center justify-center gap-1 rounded-[4px] border border-brand-blue-border bg-white px-4 text-xs sm:text-sm font-medium text-brand-blue-accent"
                        >
                            <span>{config.takeButtonLabel}</span>
                            <ChevronDownIcon className="h-4 w-4" />
                        </button>
                        <DropdownMenu
                            open={openAmbil}
                            onClose={() => setOpenAmbil(false)}
                            anchorRef={ambilButtonRef}
                            align="start"
                            widthClassName="w-[180px]"
                        >
                            <DropdownMenuItem
                                onClick={() => {
                                    setOpenAmbil(false);
                                    handlers.onTakeExpenseEntry?.();
                                }}
                            >
                                Pencatatan Beban
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    setOpenAmbil(false);
                                    handlers.onTakePayrollEntry?.();
                                }}
                            >
                                Pencatatan Gaji
                            </DropdownMenuItem>
                        </DropdownMenu>
                    </div>
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
                    className="h-[34px] min-w-[126px] rounded-[4px] border-ui-border"
                    selectClassName="px-3 text-xs sm:text-sm text-filter-select-text"
                    iconClassName="mr-2 text-filter-icon"
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
                className="inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-action-btn-active-bg text-brand-blue"
                aria-label={table.filterButtonLabel}
            >
                <FunnelIcon className="h-4.5 w-4.5" />
            </button>
        </div>
    );
}
