import CheckboxField from '@/components/ui/CheckboxField';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSwitch,
    TransactionToolbarIconButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { SearchIcon, SortIcon, ChevronDownIcon } from '@/features/workspace/shared/Icons';

function FormFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[170px_minmax(0,1fr)] lg:items-center">
            <TransactionFieldLabel label={label} required={required} />
            <div>{children}</div>
        </div>
    );
}

export function SupplierPriceHeader({ config, values, setValues }) {
    return (
        <div className="grid gap-x-10 gap-y-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
            <div className="space-y-3">
                <FormFieldRow label={config.labels.supplier} required>
                    <ChipLookupField values={values.supplier} placeholder={config.supplierPlaceholder} searchLabel="Cari pemasok" />
                </FormFieldRow>

                <FormFieldRow label={config.labels.effectiveDate} required>
                    <TransactionDateInput value={values.effectiveDate} className="max-w-[282px]" />
                </FormFieldRow>

                <div className="lg:pl-[182px]">
                    <CheckboxField
                        id="supplier-price-auto-end-date"
                        label={config.labels.autoEndDate}
                        checked={values.autoEndDate}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                autoEndDate: event.target.checked,
                            }))
                        }
                        align="center"
                        labelClassName="text-base md:text-base"
                        inputClassName="mt-0 h-[18px] w-[18px]"
                        containerClassName="w-auto"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <div className="grid gap-3 lg:grid-cols-[140px_minmax(0,1fr)] lg:items-center">
                    <div className="flex items-center justify-start gap-4 lg:justify-end">
                        <TransactionFieldLabel label={config.labels.documentNumber} required />
                        <TransactionSwitch
                            checked={values.autoNumber}
                            onChange={(nextValue) =>
                                setValues((current) => ({
                                    ...current,
                                    autoNumber: nextValue,
                                }))
                            }
                        />
                    </div>

                    <SelectField
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
                </div>

                <FormFieldRow label={config.labels.currency} required>
                    <ChipLookupField values={values.currencies} placeholder={config.currencyPlaceholder} searchLabel="Cari mata uang" />
                </FormFieldRow>
            </div>
        </div>
    );
}

export function SupplierPriceDetailsSection({ config, values, setValues }) {
    return (
        <div className="flex min-h-[560px] flex-col">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1 sm:max-w-[590px]">
                        <TextInput
                            value={values.itemSearch}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    itemSearch: event.target.value,
                                }))
                            }
                            placeholder={config.itemSearchPlaceholder}
                            trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        />
                    </div>

                    <button
                        type="button"
                        className="inline-flex h-[36px] shrink-0 items-center justify-center gap-1 rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-base text-[#21539b]"
                    >
                        <span>{config.takeButtonLabel}</span>
                        <ChevronDownIcon className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <TransactionToolbarIconButton label="Cari rincian barang">
                        <SearchIcon className="h-4.5 w-4.5" />
                    </TransactionToolbarIconButton>
                    <div className="text-right text-2xl font-normal text-[#1f2436]">
                        {config.itemSectionTitle} <span className="text-[#ED3969]">*</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
                <div className="min-w-[980px]">
                    <DataTable wrapperClassName="border-[#d1d8e4]">
                        <DataTableHeader className="bg-[#5f7690]">
                            <tr>
                                {config.itemTable.columns.map((column) => (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-3 text-base font-medium text-white ${
                                            column.align === 'right'
                                                ? 'text-right'
                                                : column.align === 'center'
                                                  ? 'text-center'
                                                  : 'text-left'
                                        }`.trim()}
                                    >
                                        <span
                                            className={`flex items-center gap-2 ${
                                                column.align === 'right'
                                                    ? 'justify-end'
                                                    : column.align === 'center'
                                                      ? 'justify-center'
                                                      : 'justify-start'
                                            }`.trim()}
                                        >
                                            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                                            <span>{column.label}</span>
                                        </span>
                                    </DataTableHead>
                                ))}
                            </tr>
                        </DataTableHeader>

                        <DataTableBody>
                            <DataTableRow className="bg-white">
                                <DataTableCell
                                    colSpan={config.itemTable.columns.length}
                                    className="px-3 py-3 text-center text-base text-[#131a28]"
                                >
                                    {config.itemTable.emptyLabel}
                                </DataTableCell>
                            </DataTableRow>
                        </DataTableBody>
                    </DataTable>
                </div>
            </div>
        </div>
    );
}

export function SupplierPriceInfoSection({ config, values, setValues }) {
    return (
        <div className="min-h-[560px]">
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

                <div className="mt-4 grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start">
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
                        className="rounded-[4px] border-[#cfd6e2]"
                        textareaClassName="min-h-[70px] text-xs sm:text-sm text-[#1f2436]"
                    />
                </div>
            </div>
        </div>
    );
}
