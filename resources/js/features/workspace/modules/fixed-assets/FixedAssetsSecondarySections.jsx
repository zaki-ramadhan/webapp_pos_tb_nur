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
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import {
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    FixedAssetFieldRow,
    FixedAssetLookupField,
    InlineCheckboxField,
    SectionCard,
    resolveFixedAssetsAlignClassName,
} from '@/features/workspace/modules/fixed-assets/fixedAssetsViewShared';

export function FixedAssetsAdditionalInfoSection({ config, values, setValues, isDetail }) {
    return (
        <SectionCard className="min-h-[620px]">
            <TransactionSectionHeading title="Info lainnya" icon="info" />

            <div className="mt-5 grid gap-5 xl:grid-cols-2 xl:gap-x-9">
                <div className="space-y-4">
                    <FixedAssetFieldRow label={config.labels.category} required>
                        <FixedAssetLookupField values={values.category} placeholder="Cari/Pilih..." searchLabel="Cari kategori aset" />
                    </FixedAssetFieldRow>

                    <FixedAssetFieldRow label={config.labels.branch} required={!isDetail}>
                        {isDetail ? (
                            <TextInput
                                value={values.branch[0] ?? ''}
                                readOnly
                                className="h-[40px] rounded-[4px] border-[#cfd6e2] bg-[#f8f9fb]"
                                inputClassName="text-[15px] text-[#4b5565]"
                            />
                        ) : (
                            <FixedAssetLookupField values={values.branch} placeholder="Cari/Pilih..." searchLabel="Cari cabang" />
                        )}
                    </FixedAssetFieldRow>

                    <FixedAssetFieldRow label={config.labels.department}>
                        <FixedAssetLookupField values={values.department} placeholder="Cari/Pilih..." searchLabel="Cari departemen" />
                    </FixedAssetFieldRow>

                    <FixedAssetFieldRow label={config.labels.initialLocation}>
                        <FixedAssetLookupField values={values.initialLocation} placeholder="Cari/Pilih..." searchLabel="Cari lokasi aset" />
                    </FixedAssetFieldRow>

                    <FixedAssetFieldRow label={config.labels.notes}>
                        <TextareaField
                            value={values.notes}
                            readOnly={isDetail}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    notes: event.target.value,
                                }))
                            }
                            rows={4}
                            className="rounded-[4px] border-[#cfd6e2]"
                            textareaClassName="min-h-[96px] text-[15px] text-[#1f2436]"
                        />
                    </FixedAssetFieldRow>
                </div>

                <div className="space-y-4">
                    {isDetail ? (
                        <>
                            <FixedAssetFieldRow label={config.labels.lastDepreciation}>
                                <TextInput
                                    value={values.lastDepreciation}
                                    readOnly
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2] bg-[#f8f9fb] sm:max-w-[286px]"
                                    inputClassName="text-[15px] text-[#4b5565]"
                                />
                            </FixedAssetFieldRow>

                            <FixedAssetFieldRow label={config.labels.tax}>
                                <TextInput
                                    value={values.taxEnabled ? 'Ya' : 'Tidak'}
                                    readOnly
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2] bg-[#f8f9fb] sm:max-w-[286px]"
                                    inputClassName="text-[15px] text-[#4b5565]"
                                />
                            </FixedAssetFieldRow>

                            <FixedAssetFieldRow label={config.labels.taxCategory} required>
                                <FixedAssetLookupField values={values.taxCategory} placeholder="Cari/Pilih..." searchLabel="Cari kategori pajak" />
                            </FixedAssetFieldRow>
                        </>
                    ) : (
                        <FixedAssetFieldRow label={config.labels.tax}>
                            <InlineCheckboxField checked={values.taxEnabled} />
                        </FixedAssetFieldRow>
                    )}
                </div>
            </div>
        </SectionCard>
    );
}

export function FixedAssetsExpenseSection({ config, values, setValues, onOpenExpense }) {
    return (
        <SectionCard className="min-h-[620px]">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 lg:flex-row lg:items-start lg:justify-between">
                <AccountLookupTextInput
                    value={values.expenseSearch}
                    placeholder="Cari/Pilih Akun Perkiraan..."
                    className="h-[40px] rounded-[4px] border-[#cfd6e2] lg:max-w-[560px]"
                    inputClassName="text-[15px] text-[#1f2436]"
                    dialogTitle="Pilih Akun Pengeluaran"
                    searchLabel="Cari akun pengeluaran"
                    onSelectAccount={(_, label) =>
                        setValues((current) => ({
                            ...current,
                            expenseSearch: label,
                        }))
                    }
                />

                <div className="text-right text-[22px] font-normal text-[#1f2436]">
                    {config.labels.expenseAccount} <span className="text-[#ED3969]">*</span>
                </div>
            </div>

            <div className="mt-4 min-h-0 overflow-x-auto">
                <DataTable className="min-w-[900px]" wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {[
                                { id: 'code', label: 'Kode #', width: 'w-[140px]' },
                                { id: 'description', label: 'Deskripsi', width: 'w-[40%]' },
                                { id: 'date', label: 'Tanggal', width: 'w-[150px]' },
                                { id: 'amount', label: 'Jumlah', width: 'w-[180px]', align: 'right' },
                            ].map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.width} px-3 text-[16px] font-medium text-white ${resolveFixedAssetsAlignClassName(column.align)}`.trim()}
                                >
                                    {column.label}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {values.expenseRows.length ? (
                            values.expenseRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`cursor-pointer border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'} hover:bg-[#eef3fb]`.trim()}
                                    onClick={() => onOpenExpense(row)}
                                >
                                    <DataTableCell className="px-3 text-[15px] text-[#131a28]">{row.code}</DataTableCell>
                                    <DataTableCell className="px-3 text-[15px] text-[#131a28]">{row.description}</DataTableCell>
                                    <DataTableCell className="px-3 text-[15px] text-[#131a28]">{row.date}</DataTableCell>
                                    <DataTableCell className="px-3 text-right text-[15px] text-[#131a28]">{row.amount}</DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={4} className="px-3 py-3 text-center text-[15px] text-[#131a28]">
                                    Belum ada data
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </SectionCard>
    );
}

export function FixedAssetsLocationSection({ config, values }) {
    return (
        <SectionCard className="min-h-[620px]">
            <div className="flex justify-end border-b border-[#d8dde7] pb-3">
                <div className="text-right text-[22px] font-normal text-[#1f2436]">{config.labels.assetLocation}</div>
            </div>

            <div className="mt-4 min-h-0 overflow-x-auto">
                <DataTable className="min-w-[900px]" wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {[
                                { id: 'symbol', label: '', width: 'w-[42px]', align: 'center' },
                                { id: 'name', label: 'Keterangan', width: 'w-[200px]' },
                                { id: 'address', label: 'Alamat', width: 'w-[58%]' },
                                { id: 'quantity', label: 'Kuantitas', width: 'w-[120px]', align: 'right' },
                            ].map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.width} px-3 text-[16px] font-medium text-white ${resolveFixedAssetsAlignClassName(column.align)}`.trim()}
                                >
                                    {column.label}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {values.locationRows.length ? (
                            values.locationRows.map((row, index) => (
                                <DataTableRow key={row.id} className={`${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'} border-[#dde1e8]`.trim()}>
                                    <DataTableCell className="px-3 text-center text-[15px] text-[#a0a7b6]">{row.symbol}</DataTableCell>
                                    <DataTableCell className="px-3 text-[15px] text-[#131a28]">{row.name}</DataTableCell>
                                    <DataTableCell className="px-3 text-[15px] text-[#131a28]">{row.address}</DataTableCell>
                                    <DataTableCell className="px-3 text-right text-[15px] text-[#131a28]">{row.quantity}</DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={4} className="px-3 py-3 text-center text-[15px] text-[#131a28]">
                                    Belum ada data
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </SectionCard>
    );
}
