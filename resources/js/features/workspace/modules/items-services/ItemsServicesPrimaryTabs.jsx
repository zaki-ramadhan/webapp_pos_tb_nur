import SelectField from '@/components/ui/SelectField';
import { TransactionSwitch } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    isWorkspaceControlInactive,
    WORKSPACE_INACTIVE_BADGE_LABEL,
    WORKSPACE_INACTIVE_HINT,
} from '@/features/workspace/shared/workspaceAvailability';
import { InfoIcon } from '@/features/workspace/shared/Icons';
import {
    ClearableTextInput,
    CodeFieldRow,
    FormRow,
    LookupField,
    SectionHeading,
    SimpleTextField,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';

export function ItemGeneralTab({ config, values, onChange, isDetail }) {
    const isBrandFieldInactive = isWorkspaceControlInactive('item-brand-field');

    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <section className="space-y-4">
                <SectionHeading title={config.labels.generalInfo} />

                <FormRow label="Nama Barang" required>
                    <ClearableTextInput
                        value={values.name}
                        onChange={(event) => onChange('name', event.target.value)}
                    />
                </FormRow>

                <FormRow label="Kategori Barang" required>
                    <LookupField
                        values={values.category}
                        placeholder="Cari/Pilih..."
                        searchLabel="Cari kategori barang"
                        onRemove={(item) =>
                            onChange(
                                'category',
                                values.category.filter((value) => value !== item),
                            )
                        }
                    />
                </FormRow>

                <FormRow label="Jenis Barang" info>
                    <SelectField
                        value={values.kind}
                        onChange={(event) => onChange('kind', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-[15px] text-[#1f2436]"
                    >
                        {config.kindOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>
                </FormRow>

                <CodeFieldRow values={values} onChange={onChange} isDetail={isDetail} />

                <FormRow label="UPC/Barcode" info>
                    <ClearableTextInput
                        value={values.barcode}
                        onChange={(event) => onChange('barcode', event.target.value)}
                    />
                </FormRow>

                <FormRow label="Satuan" required>
                    <div className="space-y-3">
                        <LookupField
                            values={values.primaryUnit}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari satuan"
                            onRemove={(item) =>
                                onChange(
                                    'primaryUnit',
                                    values.primaryUnit.filter((value) => value !== item),
                                )
                            }
                            className="max-w-[420px]"
                        />

                        {values.unitConversions.map((conversion, index) => (
                            <div
                                key={conversion.id}
                                className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_26px_86px_auto] sm:items-center"
                            >
                                <LookupField
                                    values={conversion.unit}
                                    placeholder="Cari/Pilih..."
                                    searchLabel={`Cari satuan konversi ${index + 1}`}
                                    onRemove={(item) =>
                                        onChange(
                                            'unitConversions',
                                            values.unitConversions.map((entry) =>
                                                entry.id === conversion.id
                                                    ? {
                                                          ...entry,
                                                          unit: entry.unit.filter(
                                                              (value) => value !== item,
                                                          ),
                                                      }
                                                    : entry,
                                            ),
                                        )
                                    }
                                    className="max-w-[332px]"
                                />
                                <span className="text-center text-[18px] text-[#1f2436]">=</span>
                                <SimpleTextField
                                    value={conversion.quantity}
                                    onChange={(event) =>
                                        onChange(
                                            'unitConversions',
                                            values.unitConversions.map((entry) =>
                                                entry.id === conversion.id
                                                    ? {
                                                          ...entry,
                                                          quantity: event.target.value,
                                                      }
                                                    : entry,
                                            ),
                                        )
                                    }
                                    className="h-[34px]"
                                    inputClassName="text-right"
                                />
                                <span className="text-[15px] text-[#1f2436]">
                                    {conversion.baseUnit}
                                </span>
                            </div>
                        ))}
                    </div>
                </FormRow>
            </section>

            <section className="space-y-4">
                <SectionHeading title={config.labels.moreInfo} />

                <FormRow label="Merek Barang">
                    <div className="space-y-2">
                        <LookupField
                            values={values.brand}
                            placeholder="Cari/Pilih Merek..."
                            searchLabel="Cari merek"
                            onRemove={(item) =>
                                onChange(
                                    'brand',
                                    values.brand.filter((value) => value !== item),
                                )
                            }
                            disabled={isBrandFieldInactive}
                        />
                        {isBrandFieldInactive ? (
                            <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#9a7b35]">
                                <span className="rounded-full bg-[#f6dfab] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8b6511]">
                                    {WORKSPACE_INACTIVE_BADGE_LABEL}
                                </span>
                                <span>{WORKSPACE_INACTIVE_HINT}</span>
                            </div>
                        ) : null}
                    </div>
                </FormRow>

                <div className="flex items-center gap-10 pt-2">
                    <TransactionSwitch
                        checked={values.serialEnabled}
                        onChange={(nextValue) => onChange('serialEnabled', nextValue)}
                    />
                    <span className="text-[17px] text-[#1f2436]">
                        Aktifkan No. Seri/Produksi
                    </span>
                </div>
            </section>
        </div>
    );
}

export function ItemSalesPurchaseTab({ config, values, onChange }) {
    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]">
            <section className="space-y-4">
                <SectionHeading title={config.labels.salesInfo} />

                <FormRow label="Default Diskon (%)">
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,280px)_auto] sm:items-center">
                        <SimpleTextField
                            value={values.defaultDiscount}
                            onChange={(event) =>
                                onChange('defaultDiscount', event.target.value)
                            }
                        />
                        <span className="text-[17px] text-[#1f2436]">/ Semua Satuan</span>
                    </div>
                </FormRow>

                <FormRow label="Def. Hrg. Jual Satuan #1">
                    <SimpleTextField
                        value={values.sellPriceLevel1}
                        onChange={(event) => onChange('sellPriceLevel1', event.target.value)}
                    />
                </FormRow>

                <FormRow label="Minimum Jual">
                    <SimpleTextField
                        value={values.minimumSell}
                        onChange={(event) => onChange('minimumSell', event.target.value)}
                    />
                </FormRow>

                <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-10">
                        <TransactionSwitch
                            checked={values.bulkPricingEnabled}
                            onChange={(nextValue) => onChange('bulkPricingEnabled', nextValue)}
                        />
                        <span className="text-[17px] text-[#1f2436]">
                            Menerapkan Harga / Diskon Grosir{' '}
                            <InfoIcon className="ml-1 inline-flex h-4.5 w-4.5 align-[-2px] text-[#394157]" />
                        </span>
                    </div>
                    <div className="flex items-center gap-10">
                        <TransactionSwitch
                            checked={values.substituteEnabled}
                            onChange={(nextValue) => onChange('substituteEnabled', nextValue)}
                        />
                        <span className="text-[17px] text-[#1f2436]">Substitusi dengan</span>
                    </div>
                </div>
            </section>

            <section className="space-y-7">
                <div className="space-y-4">
                    <SectionHeading title={config.labels.purchaseInfo} />

                    <FormRow label="Pemasok Utama" info>
                        <LookupField
                            values={values.mainSupplier}
                            placeholder="Cari/Pilih Pemasok..."
                            searchLabel="Cari pemasok"
                            onRemove={(item) =>
                                onChange(
                                    'mainSupplier',
                                    values.mainSupplier.filter((value) => value !== item),
                                )
                            }
                        />
                    </FormRow>

                    <FormRow label="Satuan Beli">
                        <LookupField
                            values={values.purchaseUnit}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari satuan beli"
                            onRemove={(item) =>
                                onChange(
                                    'purchaseUnit',
                                    values.purchaseUnit.filter((value) => value !== item),
                                )
                            }
                            className="max-w-[420px]"
                        />
                    </FormRow>

                    <FormRow label="Harga Beli" info>
                        <SimpleTextField
                            value={values.purchasePrice}
                            onChange={(event) => onChange('purchasePrice', event.target.value)}
                            prefix="Rp"
                            className="max-w-[420px]"
                        />
                    </FormRow>

                    <FormRow label="Minimum Beli">
                        <SimpleTextField
                            value={values.minimumBuy}
                            onChange={(event) => onChange('minimumBuy', event.target.value)}
                            className="max-w-[420px]"
                        />
                    </FormRow>

                    <FormRow label="Batas Minimum Stok">
                        <SimpleTextField
                            value={values.minimumStock}
                            onChange={(event) => onChange('minimumStock', event.target.value)}
                            className="max-w-[420px]"
                        />
                    </FormRow>
                </div>

                <div className="space-y-4">
                    <SectionHeading title={config.labels.taxInfo} />

                    <FormRow label="Ref Kode Pajak" info>
                        <LookupField
                            values={values.taxReference}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari referensi pajak"
                            onRemove={(item) =>
                                onChange(
                                    'taxReference',
                                    values.taxReference.filter((value) => value !== item),
                                )
                            }
                            className="max-w-[460px]"
                        />
                    </FormRow>

                    <FormRow label="PPN">
                        <LookupField
                            values={values.ppn}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari PPN"
                            onRemove={(item) =>
                                onChange('ppn', values.ppn.filter((value) => value !== item))
                            }
                        />
                    </FormRow>

                    <FormRow label="PPh">
                        <LookupField
                            values={values.pph}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari PPh"
                            onRemove={(item) =>
                                onChange('pph', values.pph.filter((value) => value !== item))
                            }
                        />
                    </FormRow>
                </div>
            </section>
        </div>
    );
}
