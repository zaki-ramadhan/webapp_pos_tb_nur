import { TransactionSwitch } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import Tooltip from '@/components/ui/Tooltip';
import { InfoIcon } from '@/features/workspace/shared/Icons';
import {
    FormRow,
    LookupField,
    SectionHeading,
    SimpleTextField,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';

export function ItemSalesInfoSection({ config, values, onChange }) {
    return (
        <section className="space-y-3">
            <SectionHeading title={config.labels.salesInfo} />

            <FormRow label="Default Diskon (%)">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,280px)_auto] sm:items-center">
                    <SimpleTextField
                        value={values.defaultDiscount}
                        onChange={(event) =>
                            onChange('defaultDiscount', event.target.value)
                        }
                    />
                    <span className="text-xs sm:text-sm text-[#1f2436]">/ Semua Satuan</span>
                </div>
            </FormRow>

            <FormRow label="Def. Hrg. Jual Satuan #1">
                <SimpleTextField
                    value={values.sellPriceLevel1}
                    onChange={(event) => onChange('sellPriceLevel1', event.target.value)}
                    formatAsAmount
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
                    <span className="text-xs sm:text-sm text-[#1f2436]">
                        Menerapkan Harga / Diskon Grosir{' '}
                        <Tooltip content="Mengaktifkan aturan tingkat harga grosir berdasarkan kuantitas pembelian." portal>
                            <InfoIcon className="ml-1 inline-flex h-4.5 w-4.5 align-[-2px] text-[#394157] cursor-help" />
                        </Tooltip>
                    </span>
                </div>
                <div className="flex items-center gap-10">
                    <TransactionSwitch
                        checked={values.substituteEnabled}
                        onChange={(nextValue) => onChange('substituteEnabled', nextValue)}
                    />
                    <span className="text-xs sm:text-sm text-[#1f2436]">Substitusi dengan</span>
                </div>
            </div>
        </section>
    );
}

export function ItemPurchaseTaxSection({ config, values, onChange }) {
    return (
        <section className="space-y-7">
            <div className="space-y-3">
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
                        formatAsAmount
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

            <div className="space-y-3">
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
    );
}
