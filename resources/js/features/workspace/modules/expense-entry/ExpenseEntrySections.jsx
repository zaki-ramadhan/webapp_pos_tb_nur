import { useRef, useState } from 'react';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { AccountLookupField, AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { CloseIcon, FunnelIcon, SortIcon, ChevronDownIcon } from '@/features/workspace/shared/Icons';
import TextareaField from '@/components/ui/TextareaField';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionHeaderButton,
    TransactionLineItemsSection,
    TransactionSectionHeading,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export function ExpenseLineItemsSection({ config, values, setValues, handlers = {} }) {
    const detailTitle = values.lineItems.length
        ? `${values.lineItems.length} ${config.lineSectionTitle}`
        : config.lineSectionTitle;

    return (
        <TransactionLineItemsSection
            searchValue={values.lineLookup}
            onSearchChange={(event) =>
                setValues((current) => ({
                    ...current,
                    lineLookup: event.target.value,
                }))
            }
            searchPlaceholder={config.lineSearchPlaceholder}
            searchInput={
                <AccountLookupTextInput
                    value={values.lineLookup}
                    placeholder={config.lineSearchPlaceholder}
                    searchLabel="Cari akun rincian beban"
                    dialogTitle="Pilih Akun Rincian Beban"
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
        />
    );
}

export function ExpenseAdditionalInfoSection({ config, values, setValues, handlers = {} }) {
    return (
        <div className="min-h-0">
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

                <div className="mt-4 grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start">
                    <TransactionFieldLabel label={config.labels.dueDate} required />
                    <TransactionDateInput
                        value={values.dueDate}
                        onChange={(nextValue) => setValues((current) => ({ ...current, dueDate: nextValue }))}
                        className="w-full max-w-full"
                    />

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
                        className="border-[#cfd6e2]"
                        textareaClassName="min-h-[70px] text-xs sm:text-sm text-[#1f2436]"
                    />
                </div>
            </div>
        </div>
    );
}

export function ExpenseSummarySection({ config, values }) {
    return (
        <div className="min-h-0">
            <TransactionSectionHeading title={config.summaryTitle} icon="document" />

            <div className="mt-4 max-w-[860px] overflow-hidden rounded-[4px] border border-[#d2d8e3] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)]">
                <div className="grid grid-cols-[minmax(0,1fr)_220px] border-b border-[#d8dde7] px-4 py-3 text-xs sm:text-sm text-[#1f2436]">
                    <span>{config.summaryRows.paidAmountLabel}</span>
                    <span className="text-right font-semibold text-[#111827]">{values.paidAmount}</span>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_220px] px-4 py-3 text-xs sm:text-sm text-[#1f2436]">
                    <span>{config.summaryRows.statusLabel}</span>
                    <span className="text-right font-semibold text-[#111827]">{values.status}</span>
                </div>
            </div>
        </div>
    );
}

export function ExpenseEntryHeader({ config, values, setValues, showAutoNumberSwitch, handlers = {} }) {
    const processAnchorRef = useRef(null);
    const [processOpen, setProcessOpen] = useState(false);

    const handleProcessPembayaran = async () => {
        setProcessOpen(false);
        await showSystemErrorModal({
            title: 'Terjadi Permasalahan pada Pemrosesan',
            description: 'Silakan perbaiki permasalahan berikut ini:',
            message: 'Data tidak ditemukan atau sudah dihapus',
        });
    };

    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
            <div className="flex flex-col gap-y-3 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.liabilityAccount} required htmlFor="liabilityAccount" />
                    <div className="max-w-[320px] w-full">
                        <AccountLookupField
                            id="liabilityAccount"
                            values={values.liabilityAccounts}
                            placeholder={config.liabilityAccountPlaceholder}
                            dialogTitle="Pilih Akun Hutang Beban"
                            onRemove={(value) =>
                                handlers.onRemoveLiabilityAccount
                                    ? handlers.onRemoveLiabilityAccount(value)
                                    : setValues((current) => ({
                                          ...current,
                                          liabilityAccounts: current.liabilityAccounts.filter((item) => item !== value),
                                        }))
                            }
                            searchLabel="Cari akun hutang beban"
                            onSelectAccount={(record) => handlers.onSelectLiabilityAccount?.(record)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.entryDate} required htmlFor="entryDate" />
                    <TransactionDateInput
                        id="entryDate"
                        value={values.entryDate}
                        onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-y-3 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div className="flex items-center justify-start gap-4">
                        <TransactionFieldLabel label={config.labels.documentNumber} required htmlFor="documentNumber" />
                        {showAutoNumberSwitch ? (
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

                    <div className="max-w-[320px] w-full justify-self-end">
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
                                 id="documentNumber"
                                 value={values.documentNumber}
                                 onChange={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value }))}
                                 onBlur={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value.trim() }))}
                                 maxLength={120}
                                 readOnly={!showAutoNumberSwitch}
                                 trailing={<CloseIcon className="h-4 w-4 text-[#1f2436]" />}
                                 className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                 inputClassName="text-xs sm:text-sm text-[#1f2436]"
                                 trailingClassName="px-3"
                             />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div />
                    <div className="flex justify-end gap-2 w-full max-w-[320px] justify-self-end">


                        <div className="relative flex-1 max-w-[120px]">
                            <button
                                ref={processAnchorRef}
                                type="button"
                                onClick={() => setProcessOpen(prev => !prev)}
                                className="inline-flex h-[34px] w-full items-center justify-center gap-1 rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-xs sm:text-sm text-[#21539b]"
                            >
                                <span>{config.processButtonLabel || 'Proses'}</span>
                                <ChevronDownIcon className="h-4 w-4" />
                            </button>
                            <DropdownMenu
                                open={processOpen}
                                onClose={() => setProcessOpen(false)}
                                anchorRef={processAnchorRef}
                                align="start"
                                widthClassName="w-[140px]"
                            >
                                <DropdownMenuItem onClick={handleProcessPembayaran}>
                                    Pembayaran
                                </DropdownMenuItem>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ExpenseTableFilters({ table, filters, setFilters }) {
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
                    containerClassName="w-auto"
                    className="h-[34px] min-w-[118px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="px-3 text-xs sm:text-sm text-[#394157]"
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
                className="inline-flex h-[34px] w-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                aria-label={table.filterButtonLabel}
            >
                <FunnelIcon className="h-5 w-5" />
            </button>
        </div>
    );
}
