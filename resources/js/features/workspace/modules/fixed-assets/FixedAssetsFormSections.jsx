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
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { SearchIcon } from '@/features/workspace/shared/Icons';
import {
    FixedAssetFieldRow,
    FixedAssetLookupField,
    FixedAssetsProcessButton,
    InlineCheckboxField,
    resolveFixedAssetsAlignClassName,
    SectionCard,
} from '@/features/workspace/modules/fixed-assets/fixedAssetsViewShared';

export function FixedAssetsHeader({ config, values, setValues, isDetail }) {
    return (
        <SectionCard>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] xl:items-start">
                <div className="grid gap-4 sm:max-w-[700px]">
                    <div className="grid gap-2">
                        <TransactionFieldLabel label={config.labels.name} required />
                        <TextInput
                            value={values.name}
                            readOnly={isDetail}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    name: event.target.value,
                                }))
                            }
                            trailing={isDetail ? <span className="text-[22px] font-semibold text-[#1f2436]">×</span> : null}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                            trailingClassName="px-3"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <TransactionFieldLabel label={config.labels.purchaseDate} required />
                            <TransactionDateInput value={values.purchaseDate} className="w-full" />
                        </div>
                        <div className="grid gap-2">
                            <TransactionFieldLabel label={config.labels.usageDate} required />
                            <TransactionDateInput value={values.usageDate} className="w-full" />
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 xl:justify-self-end xl:min-w-[420px]">
                    <div className="flex flex-wrap items-center justify-start gap-3 xl:justify-end">
                        <TransactionFieldLabel label={config.labels.code} required />
                        {!isDetail ? (
                            <TransactionSwitch
                                checked={values.autoCode}
                                onChange={(nextValue) =>
                                    setValues((current) => ({
                                        ...current,
                                        autoCode: nextValue,
                                    }))
                                }
                            />
                        ) : null}

                        {values.autoCode && !isDetail ? (
                            <SelectField
                                value={values.codeType}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        codeType: event.target.value,
                                    }))
                                }
                                containerClassName="w-full xl:w-[400px]"
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                selectClassName="text-[15px] text-[#1f2436]"
                            >
                                {config.codeTypeOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </SelectField>
                        ) : (
                            <TextInput
                                value={values.code}
                                readOnly
                                trailing={isDetail ? <span className="text-[22px] font-semibold text-[#1f2436]">×</span> : null}
                                className="h-[40px] w-full rounded-[4px] border-[#cfd6e2] xl:w-[400px]"
                                inputClassName="text-[15px] text-[#1f2436]"
                                trailingClassName="px-3"
                            />
                        )}
                    </div>

                    {isDetail ? (
                        <div className="flex justify-end">
                            <FixedAssetsProcessButton items={values.processItems ?? []} />
                        </div>
                    ) : null}
                </div>
            </div>
        </SectionCard>
    );
}

export function FixedAssetsGeneralSection({ config, values, setValues, isDetail }) {
    return (
        <SectionCard className="min-h-[620px]">
            <TransactionSectionHeading title="Informasi umum" icon="info" />

            <div className="mt-5 grid gap-5 xl:grid-cols-2 xl:gap-x-9">
                <div className="space-y-4">
                    <FixedAssetFieldRow label={config.labels.intangibleAsset}>
                        {isDetail ? (
                            <TextInput
                                value={values.intangibleAsset ? 'Ya' : 'Tidak'}
                                readOnly
                                className="h-[40px] rounded-[4px] border-[#cfd6e2] bg-[#f8f9fb]"
                                inputClassName="text-[15px] text-[#4b5565]"
                            />
                        ) : (
                            <InlineCheckboxField checked={values.intangibleAsset} />
                        )}
                    </FixedAssetFieldRow>

                    <FixedAssetFieldRow label={config.labels.depreciationMethod}>
                        {isDetail ? (
                            <TextInput
                                value={values.depreciationMethod}
                                readOnly
                                className="h-[40px] rounded-[4px] border-[#cfd6e2] bg-[#f8f9fb]"
                                inputClassName="text-[15px] text-[#4b5565]"
                            />
                        ) : (
                            <SelectField
                                value={values.depreciationMethod}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        depreciationMethod: event.target.value,
                                    }))
                                }
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                selectClassName="text-[15px] text-[#1f2436]"
                            >
                                {config.depreciationMethodOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </SelectField>
                        )}
                    </FixedAssetFieldRow>

                    <FixedAssetFieldRow label={config.labels.assetAccount} required>
                        <FixedAssetLookupField
                            values={values.assetAccount}
                            placeholder="Cari/Pilih Akun Perkiraan..."
                            searchLabel="Cari akun aset"
                        />
                    </FixedAssetFieldRow>

                    <FixedAssetFieldRow label={config.labels.accumulatedDepreciationAccount} required>
                        <FixedAssetLookupField
                            values={values.accumulatedDepreciationAccount}
                            placeholder="Cari/Pilih Akun Perkiraan..."
                            searchLabel="Cari akun akumulasi penyusutan"
                        />
                    </FixedAssetFieldRow>

                    <FixedAssetFieldRow label={config.labels.depreciationExpenseAccount} required>
                        <FixedAssetLookupField
                            values={values.depreciationExpenseAccount}
                            placeholder="Cari/Pilih Akun Perkiraan..."
                            searchLabel="Cari akun beban penyusutan"
                        />
                    </FixedAssetFieldRow>
                </div>

                <div className="space-y-4">
                    <FixedAssetFieldRow label={config.labels.quantity} required>
                        <TextInput
                            value={values.quantity}
                            readOnly={isDetail}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    quantity: event.target.value,
                                }))
                            }
                            className="h-[40px] rounded-[4px] border-[#cfd6e2] sm:max-w-[286px]"
                            inputClassName="text-right text-[15px] text-[#1f2436]"
                        />
                    </FixedAssetFieldRow>

                    <FixedAssetFieldRow label={config.labels.assetLife} required>
                        <div className="grid gap-3 sm:grid-cols-[minmax(0,286px)_auto] sm:items-center">
                            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                                <TextInput
                                    value={values.assetLifeYears}
                                    readOnly={isDetail}
                                    onChange={(event) =>
                                        setValues((current) => ({
                                            ...current,
                                            assetLifeYears: event.target.value,
                                        }))
                                    }
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-right text-[15px] text-[#1f2436]"
                                />
                                <span className="text-[15px] text-[#1f2436]">Tahun</span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                                <TextInput
                                    value={values.assetLifeMonths}
                                    readOnly={isDetail}
                                    onChange={(event) =>
                                        setValues((current) => ({
                                            ...current,
                                            assetLifeMonths: event.target.value,
                                        }))
                                    }
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-right text-[15px] text-[#1f2436]"
                                />
                                <span className="text-[15px] text-[#1f2436]">Bulan</span>
                            </div>
                        </div>
                    </FixedAssetFieldRow>

                    <FixedAssetFieldRow label={config.labels.ratio}>
                        <div className="grid gap-3 sm:grid-cols-[minmax(0,286px)_auto] sm:items-center">
                            <TextInput
                                value={values.ratio}
                                readOnly={isDetail}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        ratio: event.target.value,
                                    }))
                                }
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-right text-[15px] text-[#1f2436]"
                            />
                            <span className="text-[15px] text-[#1f2436]">%</span>
                        </div>
                    </FixedAssetFieldRow>

                    <FixedAssetFieldRow label={config.labels.residualValue}>
                        <TextInput
                            value={values.residualValue}
                            readOnly={isDetail}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    residualValue: event.target.value,
                                }))
                            }
                            prefix="Rp"
                            className="h-[40px] rounded-[4px] border-[#cfd6e2] sm:max-w-[286px]"
                            inputClassName="text-right text-[15px] text-[#1f2436]"
                            prefixClassName="min-w-[46px] justify-center px-0 text-[#7a8498]"
                        />
                    </FixedAssetFieldRow>
                </div>
            </div>
        </SectionCard>
    );
}

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

export function FixedAssetsExpenseSection({ config, values, onOpenExpense }) {
    return (
        <SectionCard className="min-h-[620px]">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 lg:flex-row lg:items-start lg:justify-between">
                <TextInput
                    value={values.expenseSearch}
                    readOnly
                    placeholder="Cari/Pilih Akun Perkiraan..."
                    trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2] lg:max-w-[560px]"
                    inputClassName="text-[15px] text-[#1f2436]"
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
