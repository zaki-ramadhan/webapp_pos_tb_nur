import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSwitch,
    TransactionToolbarIconButton,
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { CogIcon, PrintIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import TableListView from '@/features/workspace/modules/TableListView';
import { resolveAssetMoveAlignClassName } from './assetMoveShared';

export function AssetMoveFieldRow({ label, required = false, children, labelClassName = '' }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
            <TransactionFieldLabel label={label} required={required} className={labelClassName} />
            <div>{children}</div>
        </div>
    );
}

export function AssetMoveHeader({ config, values, setValues, isDetail }) {
    return (
        <div className="border-b border-[#d8dde7] px-4 py-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.94fr)] xl:items-start">
                <div className="space-y-3">
                    <AssetMoveFieldRow label={config.labels.date} required>
                        <TransactionDateInput value={values.date} className="max-w-[332px]" />
                    </AssetMoveFieldRow>

                    <AssetMoveFieldRow label={config.labels.sourceAddress} required>
                        <ChipLookupField
                            values={values.sourceAddress}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari alamat asal"
                            onRemove={(value) =>
                                setValues((current) => ({
                                    ...current,
                                    sourceAddress: current.sourceAddress.filter((item) => item !== value),
                                }))
                            }
                            className="max-w-[684px]"
                        />
                    </AssetMoveFieldRow>

                    <AssetMoveFieldRow label={config.labels.destinationAddress} required>
                        <ChipLookupField
                            values={values.destinationAddress}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari alamat tujuan"
                            onRemove={(value) =>
                                setValues((current) => ({
                                    ...current,
                                    destinationAddress: current.destinationAddress.filter((item) => item !== value),
                                }))
                            }
                            className="max-w-[684px]"
                        />
                    </AssetMoveFieldRow>
                </div>

                <div className="space-y-3">
                    {isDetail ? (
                        <AssetMoveFieldRow label={config.labels.number} required labelClassName="sm:text-right">
                            <TextInput
                                value={values.number}
                                readOnly
                                trailing={<span className="text-[22px] font-semibold text-[#1f2436]">×</span>}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                                trailingClassName="px-3"
                            />
                        </AssetMoveFieldRow>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            <div className="flex items-center justify-start gap-4 sm:justify-end">
                                <TransactionFieldLabel label={config.labels.number} required />
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

                            <TextInput
                                value={values.numberingType}
                                readOnly
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function AssetMoveDetailsSection({ config, values, setValues, isDetail, onOpenItem }) {
    return (
        <div className="flex min-h-[520px] flex-col">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 sm:max-w-[720px]">
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
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right text-[22px] font-normal text-[#1f2436]">
                        {values.itemCountLabel ?? config.labels.assetDetails} <span className="text-[#ED3969]">*</span>
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
                                        className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${resolveAssetMoveAlignClassName(column.align)}`.trim()}
                                    >
                                        {column.label}
                                    </DataTableHead>
                                ))}
                            </tr>
                        </DataTableHeader>

                        <DataTableBody>
                            {values.items.length ? (
                                values.items.map((item, index) => (
                                    <DataTableRow
                                        key={item.id}
                                        className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'} ${isDetail ? 'cursor-pointer hover:bg-[#eef3fb]' : ''}`.trim()}
                                        onClick={isDetail ? () => onOpenItem(item) : undefined}
                                    >
                                        {config.itemTable.columns.map((column) => (
                                            <DataTableCell
                                                key={column.id}
                                                className={`px-3 text-[15px] text-[#131a28] ${resolveAssetMoveAlignClassName(column.align)}`.trim()}
                                            >
                                                {formatTableTextValue(item[column.id])}
                                            </DataTableCell>
                                        ))}
                                    </DataTableRow>
                                ))
                            ) : (
                                <DataTableRow className="border-[#dde1e8] bg-white">
                                    <DataTableCell
                                        colSpan={config.itemTable.columns.length}
                                        className="px-3 py-3 text-center text-[15px] text-[#131a28]"
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

export function AssetMoveInfoSection({ config, values, setValues, isDetail }) {
    return (
        <div className="min-h-[520px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 space-y-4">
                <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,560px)] lg:items-start">
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
                        textareaClassName="min-h-[70px] text-[15px] text-[#1f2436]"
                    />
                </div>

                {isDetail ? (
                    <>
                        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,700px)] lg:items-start">
                            <TransactionFieldLabel label={config.labels.sourceAddress} />
                            <div className="text-[17px] leading-7 text-[#1f2436]">{values.sourceAddressDetail}</div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,700px)] lg:items-start">
                            <TransactionFieldLabel label={config.labels.destinationAddress} />
                            <div className="text-[17px] leading-7 text-[#1f2436]">{values.destinationAddressDetail}</div>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}

export function AssetMoveTableSection({ config, onCreate, onOpenDetail }) {
    return (
        <TableListView
            table={config.table}
            createButton={{
                label: config.table.createLabel,
                onClick: onCreate,
            }}
            rightControls={
                <>
                    <TransactionToolbarIconButton label="Cetak daftar">
                        <PrintIcon className="h-4.5 w-4.5" />
                    </TransactionToolbarIconButton>
                    <TransactionToolbarSplitButton
                        label="Pengaturan tabel"
                        icon={<CogIcon className="h-4.5 w-4.5" />}
                        items={[{ id: 'arrange-columns', label: 'Atur kolom' }]}
                    />
                </>
            }
            onRowClick={onOpenDetail ? (row) => onOpenDetail({ recordId: row.id, label: row.number }) : null}
        />
    );
}
