import { useState, useRef } from 'react';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import TextInput from '@/components/ui/TextInput';
import PortalDropdown from '@/components/ui/PortalDropdown';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import TakeItemsModal from '@/features/workspace/shared/TakeItemsModal';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { SortIcon, ChevronDownIcon } from '@/features/workspace/shared/Icons';
import { Trash2 } from 'lucide-react';
import { requireSupplierSelection } from '../supplierPriceShared';

export default function SupplierPriceDetailsSection({ config, values, setValues, isDetail }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const dropdownRef = useRef(null);

    return (
        <div className="flex min-h-[560px] flex-col">
            <div className="flex flex-col gap-3 pb-1 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 sm:max-w-[420px] md:max-w-[480px]">
                        <div className="flex-1 min-w-0">
                            <AccountLookupTextInput
                                id="supplierPriceItemSearch"
                                resource="products"
                                value={values.itemSearch}
                                placeholder={config.itemSearchPlaceholder}
                                searchLabel="Cari barang atau jasa"
                                onSelectAccount={(record, label) => {
                                    if (!requireSupplierSelection(values)) return;
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
                                            newPrice: parseFloat(record.default_purchase_price) || 0,
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

                        <div className="relative shrink-0" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!requireSupplierSelection(values)) return;
                                    setDropdownOpen((prev) => !prev);
                                }}
                                className="inline-flex h-[40px] items-center justify-center gap-1.5 rounded-[4px] border border-brand-blue-border bg-white px-3 text-sm font-medium text-brand-blue-accent hover:bg-brand-blue-lightest transition cursor-pointer shrink-0"
                                title="Ambil opsi barang"
                            >
                                <span>Ambil</span>
                                <ChevronDownIcon className="h-4 w-4 text-current" />
                            </button>

                            {dropdownOpen && (
                                <PortalDropdown
                                    anchorRef={dropdownRef}
                                    open={dropdownOpen}
                                    onClose={() => setDropdownOpen(false)}
                                    align="start"
                                    className="min-w-[200px] w-max py-1 bg-white border border-ui-border rounded-md shadow-lg"
                                >
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            if (!requireSupplierSelection(values)) return;
                                            setImportModalOpen(true);
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs sm:text-sm text-brand-dark hover:bg-slate-50 cursor-pointer"
                                    >
                                        Daftar Barang & Jasa
                                    </DropdownMenuItem>
                                </PortalDropdown>
                            )}
                        </div>
                    </div>
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
                                        <DataTableCell className="px-3 text-right text-base text-text-workspace-dark font-normal">
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

            <TakeItemsModal
                open={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                mode="purchase"
                onApply={(selectedProducts) => {
                    setValues((current) => {
                        const existingLines = current.itemLines ?? [];
                        const merged = [...existingLines];

                        selectedProducts.forEach((item) => {
                            const exists = merged.some((l) => l.__productId === item.id);
                            if (!exists) {
                                merged.push({
                                    id: `take-${Date.now()}-${item.id}`,
                                    __productId: item.id,
                                    name: item.name || '',
                                    code: item.code || '',
                                    unit: item.unit?.name || item.unit || 'PCS',
                                    newPrice: parseFloat(item.default_purchase_price) || 0,
                                });
                            }
                        });

                        return {
                            ...current,
                            itemLines: merged,
                        };
                    });
                }}
            />
        </div>
    );
}
