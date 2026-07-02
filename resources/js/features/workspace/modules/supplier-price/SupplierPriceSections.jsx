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
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { SearchIcon, SortIcon, ChevronDownIcon } from '@/features/workspace/shared/Icons';
import { Trash2 } from 'lucide-react';

export function SupplierPriceHeader({ config, values, setValues }) {
    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-2 gap-x-8">
            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.supplier} required />
                    <AccountLookupTextInput
                        id="supplierPriceSupplier"
                        resource="suppliers"
                        value={values.supplier?.[0] ?? ''}
                        placeholder={config.supplierPlaceholder}
                        searchLabel="Cari pemasok"
                        onSelectAccount={(record, label) => {
                            if (record) {
                                setValues((current) => ({
                                    ...current,
                                    __supplierId: record.id,
                                    supplier: [label],
                                }));
                            } else {
                                setValues((current) => ({
                                    ...current,
                                    __supplierId: null,
                                    supplier: [],
                                }));
                            }
                        }}
                    />
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-start gap-x-4">
                    <div className="flex flex-col gap-y-2">
                        <TransactionFieldLabel label={config.labels.effectiveDate} required className="pt-2" />
                        <CheckboxField
                            id="supplier-price-auto-end-date"
                            label={config.labels.autoEndDate}
                            checked={values.autoEndDate}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    autoEndDate: event.target.checked,
                                    endDate: event.target.checked ? current.endDate : '',
                                }))
                            }
                            align="center"
                            labelClassName="text-xs sm:text-sm text-brand-dark ml-1 whitespace-nowrap"
                            inputClassName="mt-0 h-[16px] w-[16px]"
                            containerClassName="w-auto shrink-0 mt-6"
                        />
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                        <TransactionDateInput 
                            value={values.effectiveDate} 
                            onChange={(nextVal) => setValues(curr => ({ ...curr, effectiveDate: nextVal }))}
                            className="w-[160px] shrink-0" 
                        />
                        {values.autoEndDate && (
                            <>
                                <span className="text-xs sm:text-sm text-brand-dark shrink-0">s/d</span>
                                <TransactionDateInput 
                                    value={values.endDate ?? ''} 
                                    onChange={(nextVal) => setValues(curr => ({ ...curr, endDate: nextVal }))}
                                    disableAutoInit={true}
                                    className="w-[160px] shrink-0" 
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div className="flex items-center justify-start gap-4">
                        <TransactionFieldLabel label={config.labels.documentNumber} required />
                    </div>

                    <div className="max-w-[320px] w-full justify-self-end">
                        <SelectField
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
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SupplierPriceDetailsSection({ config, values, setValues, isDetail }) {
    return (
        <div className="flex min-h-[560px] flex-col">
            <div className="flex flex-col gap-3 pb-1 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    {!isDetail && (
                        <div className="min-w-0 flex-1 sm:max-w-[320px] md:max-w-[380px]">
                            <AccountLookupTextInput
                                id="supplierPriceItemSearch"
                                resource="products"
                                value={values.itemSearch}
                                placeholder={config.itemSearchPlaceholder}
                                searchLabel="Cari barang atau jasa"
                                onSelectAccount={(record, label) => {
                                    if (record) {
                                        const exists = (values.itemLines ?? []).some(
                                            (line) => line.__productId === record.id
                                        );
                                        if (exists) return;

                                        const newLine = {
                                            id: `temp-${Date.now()}`,
                                            __productId: record.id,
                                            name: record.name || label,
                                            code: record.code || '',
                                            unit: record.unit?.name || 'PCS',
                                            __unitId: record.unit?.id || null,
                                            newPrice: 0,
                                        };

                                        setValues((current) => ({
                                            ...current,
                                            itemSearch: '',
                                            itemLines: [...(current.itemLines ?? []), newLine],
                                        }));
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3">
                    <div className="text-right text-2xl font-normal text-brand-dark">
                        {config.itemSectionTitle} <span className="text-tab-active-border-t">*</span>
                    </div>
                </div>
            </div>

            <div className="mt-1 min-h-0 flex-1 overflow-x-auto">
                <div className="min-w-[980px]">
                    <DataTable wrapperClassName="border-table-wrapper-border">
                        <DataTableHeader className="bg-table-header-bg">
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
                            {(values.itemLines ?? []).length > 0 ? (
                                values.itemLines.map((row, index) => (
                                    <DataTableRow key={row.id || index} className="bg-white border-ui-border-row">
                                        <DataTableCell className="px-3 text-base text-text-workspace-dark">
                                            {row.name}
                                        </DataTableCell>
                                        <DataTableCell className="px-3 text-base text-text-workspace-dark">
                                            {row.code}
                                        </DataTableCell>
                                        <DataTableCell className="px-3 text-base text-text-workspace-dark">
                                            {row.unit}
                                        </DataTableCell>
                                        <DataTableCell className="px-3 text-right text-base text-text-workspace-dark font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <TextInput
                                                    type="number"
                                                    value={row.newPrice || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setValues((current) => ({
                                                            ...current,
                                                            itemLines: current.itemLines.map((line, idx) =>
                                                                idx === index ? { ...line, newPrice: val } : line
                                                            ),
                                                        }));
                                                    }}
                                                    className="w-[140px] text-right h-[36px]"
                                                    inputClassName="text-right text-xs sm:text-sm text-brand-dark"
                                                />
                                                {!isDetail && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setValues((current) => ({
                                                                ...current,
                                                                itemLines: current.itemLines.filter((_, idx) => idx !== index),
                                                            }));
                                                        }}
                                                        className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[4px] border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition duration-150 shrink-0 cursor-pointer"
                                                        title="Hapus baris"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </DataTableCell>
                                    </DataTableRow>
                                ))
                            ) : (
                                <DataTableRow className="bg-white">
                                    <DataTableCell
                                        colSpan={config.itemTable.columns.length}
                                        className="px-3 py-3 text-center text-base text-text-workspace-dark"
                                    >
                                        {config.itemTable.emptyLabel}
                                    </DataTableCell>
                                </DataTableRow>
                            )}
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
                        className="rounded-[4px] border-ui-border"
                        textareaClassName="min-h-[70px] text-xs sm:text-sm text-brand-dark"
                    />
                </div>
            </div>
        </div>
    );
}
