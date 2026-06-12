import { useMemo } from 'react';

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
import {
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { SearchIcon, TableActionIcon } from '@/features/workspace/shared/Icons';

import { resolveCellAlignClassName } from './inventoryAdjustmentShared';

function InventoryAdjustmentTableSection({ columns, items, emptyLabel, isDetail, onOpenItem, minWidthClassName }) {
    return (
        <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
            <div className={minWidthClassName}>
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 py-2 text-base font-medium text-white ${resolveCellAlignClassName(column.align)}`.trim()}
                                >
                                    {column.label}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {items.length ? (
                            items.map((item, index) => (
                                <DataTableRow
                                    key={item.id}
                                    className={`border-[#dde1e8] transition ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'} ${isDetail ? 'cursor-pointer hover:bg-[#eef3fb]' : ''}`.trim()}
                                    onClick={isDetail ? () => onOpenItem(item) : undefined}
                                >
                                    {columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`px-3 text-base text-[#131a28] ${resolveCellAlignClassName(column.align)}`.trim()}
                                        >
                                            {item[column.id] ?? ''}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="border-[#dde1e8] bg-white">
                                <DataTableCell colSpan={columns.length} className="px-3 py-3 text-center text-base text-[#131a28]">
                                    {emptyLabel}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

export default function InventoryAdjustmentDetailsSection({
    config,
    values,
    setValues,
    isDetail,
    onOpenItem,
    onCreateItem,
}) {
    const filteredItems = useMemo(() => {
        const query = (values.itemSearch || '').toLowerCase().trim();
        if (!query) return values.items || [];
        return (values.items || []).filter(
            (item) =>
                (item.name || '').toLowerCase().includes(query) ||
                (item.code || '').toLowerCase().includes(query)
        );
    }, [values.items, values.itemSearch]);

    return (
        <div className="flex min-h-[520px] flex-col">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:max-w-[820px] sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                        <TextInput
                            value={values.itemSearch}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    itemSearch: event.target.value,
                                }))
                            }
                            placeholder={config.detailSearchPlaceholder}
                            trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        />
                    </div>

                    <SelectField
                        value={values.detailMode}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                detailMode: event.target.value,
                            }))
                        }
                        className="h-[34px] min-w-[82px] rounded-[4px] border-[#7aa2d5]"
                        selectClassName="text-xs sm:text-sm text-[#21539b]"
                        containerClassName="w-auto shrink-0"
                    >
                        {config.detailModeOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>

                    {isDetail ? (
                        <TransactionToolbarSplitButton
                            label="Opsi rincian barang"
                            icon={<TableActionIcon className="h-4.5 w-4.5" />}
                            items={values.copyItems ?? []}
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={onCreateItem}
                            className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-base text-[#21539b]"
                        >
                            Tambah Item
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right text-2xl font-normal text-[#1f2436]">
                        {values.itemCountLabel ?? config.itemSectionTitle} <span className="text-[#ED3969]">*</span>
                    </div>
                </div>
            </div>

            <InventoryAdjustmentTableSection
                columns={config.itemTable.columns}
                items={filteredItems}
                emptyLabel={config.itemTable.emptyLabel}
                isDetail={isDetail}
                onOpenItem={onOpenItem}
                minWidthClassName={config.itemTable.minWidthClassName}
            />
        </div>
    );
}
