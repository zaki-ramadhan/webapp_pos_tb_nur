import TextInput from '@/components/ui/TextInput';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import {
    TransactionDataTable,
    TransactionToolbarIconButton,
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { SearchIcon, TableActionIcon } from '@/features/workspace/shared/Icons';

export function WorkOrderSectionHeader({ searchValue, onSearchChange, placeholder, title, actionButton }) {
    const isAccountLookup = placeholder === 'Cari/Pilih Akun Perkiraan...';

    return (
        <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-[720px]">
                <div className="min-w-0 flex-1">
                    {isAccountLookup ? (
                        <AccountLookupTextInput
                            value={searchValue}
                            placeholder={placeholder}
                            searchLabel={`Cari ${title}`}
                            dialogTitle={`Pilih ${title}`}
                            onSelectAccount={(_, label) => onSearchChange({ target: { value: label } })}
                        />
                    ) : (
                        <TextInput
                            value={searchValue}
                            onChange={onSearchChange}
                            placeholder={placeholder}
                            trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        />
                    )}
                </div>

                {actionButton}
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
                <TransactionToolbarIconButton label={`Cari ${title}`}>
                    <SearchIcon className="h-4.5 w-4.5" />
                </TransactionToolbarIconButton>
                <div className="text-right text-2xl font-normal text-[#1f2436]">
                    {title} <span className="text-[#ED3969]">*</span>
                </div>
            </div>
        </div>
    );
}

export function WorkOrderSectionTable({ columns, rows, emptyLabel, onRowClick, clickable = false }) {
    return (
        <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
            <TransactionDataTable
                columns={columns}
                rows={rows}
                emptyLabel={emptyLabel}
                minWidthClassName="min-w-[980px]"
                onRowClick={clickable ? onRowClick : null}
                getRowClassName={() => (clickable ? 'cursor-pointer hover:bg-[#eef3fb]' : '')}
                renderCell={({ row, column }) => <span className="block truncate">{formatTableTextValue(row[column.id])}</span>}
            />
        </div>
    );
}

export function WorkOrderItemsSection({ config, values, setValues, isDetail, onOpenItem }) {
    return (
        <div className="flex min-h-[520px] flex-col">
            <WorkOrderSectionHeader
                searchValue={values.itemSearch}
                onSearchChange={(event) =>
                    setValues((current) => ({
                        ...current,
                        itemSearch: event.target.value,
                    }))
                }
                placeholder={config.itemSearchPlaceholder}
                title={values.itemCountLabel ?? config.itemSectionTitle}
                actionButton={
                    isDetail ? (
                        <TransactionToolbarSplitButton
                            label="Aksi rincian barang"
                            icon={<TableActionIcon className="h-4.5 w-4.5" />}
                            items={[{ id: 'copy-items', label: 'Salin rincian barang' }]}
                        />
                    ) : null
                }
            />

            <WorkOrderSectionTable
                columns={config.itemTable.columns}
                rows={values.items}
                emptyLabel={config.itemTable.emptyLabel}
                onRowClick={onOpenItem}
                clickable={isDetail}
            />
        </div>
    );
}

export function WorkOrderChargesSection({ config, values, setValues }) {
    return (
        <div className="flex min-h-[520px] flex-col">
            <WorkOrderSectionHeader
                searchValue={values.chargeSearch}
                onSearchChange={(event) =>
                    setValues((current) => ({
                        ...current,
                        chargeSearch: event.target.value,
                    }))
                }
                placeholder={config.chargeSearchPlaceholder}
                title={config.chargeSectionTitle}
            />

            <WorkOrderSectionTable
                columns={config.chargeTable.columns}
                rows={values.additionalCosts}
                emptyLabel={config.chargeTable.emptyLabel}
            />
        </div>
    );
}
