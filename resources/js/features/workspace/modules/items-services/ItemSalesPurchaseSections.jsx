import { TransactionSwitch } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import Tooltip from '@/components/ui/Tooltip';
import { InfoIcon } from '@/features/workspace/shared/Icons';
import {
    FormRow,
    LookupField,
    SectionHeading,
    SimpleTextField,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';

export function ItemSalesInfoSection({ config, values, onChange }) {
    return (
        <section className="space-y-2">
            <SectionHeading title={config.labels.salesInfo} />

            <FormRow label="Default Diskon (%)">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,280px)_auto] sm:items-center">
                    <SimpleTextField
                        value={values.defaultDiscount}
                        onChange={(event) => {
                            const val = event.target.value.replace(/\D/g, '');
                            onChange('defaultDiscount', val);
                        }}
                        onBlur={(event) => {
                            const num = parseInt(event.target.value, 10);
                            if (!isNaN(num) && num > 100) {
                                onChange('defaultDiscount', '100');
                            }
                        }}
                        className="max-w-[280px]"
                        type="number"
                        maxLength={3}
                    />
                    <span className="text-xs sm:text-sm text-brand-dark">/ Semua Satuan</span>
                </div>
            </FormRow>

            <FormRow label="Def. Hrg. Jual Satuan #1">
                <SimpleTextField
                    value={values.sellPriceLevel1}
                    onChange={(event) => onChange('sellPriceLevel1', event.target.value)}
                    formatAsAmount
                    maxLength={11}
                />
            </FormRow>

            <FormRow label="Minimum Jual">
                <SimpleTextField
                    value={values.minimumSell}
                    onChange={(event) => onChange('minimumSell', event.target.value)}
                    formatAsAmount
                    allowDecimal={false}
                    maxLength={13}
                />
            </FormRow>

            <div className="space-y-2 pt-2">
                <div className="flex items-center gap-3">
                    <TransactionSwitch
                        checked={values.bulkPricingEnabled}
                        onChange={(nextValue) => onChange('bulkPricingEnabled', nextValue)}
                    />
                    <span className="text-xs sm:text-sm text-brand-dark">
                        Menerapkan Harga / Diskon Grosir{' '}
                        <Tooltip content="Mengaktifkan aturan tingkat harga grosir berdasarkan kuantitas pembelian." portal>
                            <InfoIcon className="ml-1 inline-flex h-3.5 w-3.5 align-middle text-filter-select-text cursor-help" />
                        </Tooltip>
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <TransactionSwitch
                        checked={values.substituteEnabled}
                        onChange={(nextValue) => {
                            onChange('substituteEnabled', nextValue);
                            if (!nextValue) {
                                onChange('substituteProduct', []);
                            }
                        }}
                    />
                    <span className="text-xs sm:text-sm text-brand-dark">Substitusi dengan</span>
                </div>

                {values.substituteEnabled && (
                    <FormRow label="Barang Substitusi">
                        <BackendLookupField
                            resource="products"
                            values={(values.substituteProduct || []).map((item) => (typeof item === 'string' ? { name: item } : item))}
                            placeholder="Cari/Pilih Barang Substitusi..."
                            searchLabel="Cari barang"
                            onSelect={(option) => {
                                onChange('substituteProduct', [option.name]);
                            }}
                            onRemove={() => {
                                onChange('substituteProduct', []);
                            }}
                        />
                    </FormRow>
                )}
            </div>
        </section>
    );
}

export function ItemPurchaseTaxSection({ config, values, onChange }) {
    return (
        <section className="space-y-7">
            <div className="space-y-2">
                <SectionHeading title={config.labels.purchaseInfo} />

                <FormRow label="Pemasok Utama" info>
                    <BackendLookupField
                        resource="suppliers"
                        values={(values.mainSupplier || []).map((item) => (typeof item === 'string' ? { name: item } : item))}
                        placeholder="Cari/Pilih Pemasok..."
                        searchLabel="Cari pemasok"
                        onSelect={(option) => {
                            onChange('mainSupplier', [option.name]);
                        }}
                        onRemove={() => {
                            onChange('mainSupplier', []);
                        }}
                    />
                </FormRow>

                <FormRow label="Satuan Beli">
                    <BackendLookupField
                        resource="units"
                        values={(values.purchaseUnit || []).map((item) => (typeof item === 'string' ? { name: item } : item))}
                        placeholder="Cari/Pilih..."
                        searchLabel="Cari satuan beli"
                        onSelect={(option) => {
                            onChange('purchaseUnit', [option.name]);
                        }}
                        onRemove={() => {
                            onChange('purchaseUnit', []);
                        }}
                        className="max-w-[420px]"
                    />
                </FormRow>

                <FormRow label="Harga Beli" info>
                    <SimpleTextField
                        value={values.purchasePrice}
                        onChange={(event) => onChange('purchasePrice', event.target.value)}
                        prefix="Rp"
                        formatAsAmount
                        maxLength={11}
                        className="max-w-[420px]"
                    />
                </FormRow>

                <FormRow label="Minimum Beli">
                    <SimpleTextField
                        value={values.minimumBuy}
                        onChange={(event) => onChange('minimumBuy', event.target.value)}
                        className="max-w-[420px]"
                        formatAsAmount
                        allowDecimal={false}
                        maxLength={13}
                    />
                </FormRow>

                <FormRow label="Batas Minimum Stok">
                    <SimpleTextField
                        value={values.minimumStock}
                        onChange={(event) => onChange('minimumStock', event.target.value)}
                        className="max-w-[420px]"
                        formatAsAmount
                        allowDecimal={false}
                        maxLength={11}
                    />
                </FormRow>
            </div>

            <div className="space-y-2">
                <SectionHeading title={config.labels.taxInfo} />

                <FormRow label="Ref Kode Pajak" info>
                    <BackendLookupField
                        resource="taxes"
                        values={(values.taxReference || []).map((item) => (typeof item === 'string' ? { name: item } : item))}
                        placeholder="Cari/Pilih..."
                        searchLabel="Cari referensi pajak"
                        onSelect={(option) => {
                            onChange('taxReference', [option.name]);
                        }}
                        onRemove={() => {
                            onChange('taxReference', []);
                        }}
                        className="max-w-[460px]"
                    />
                </FormRow>

                <FormRow label="PPN">
                    <BackendLookupField
                        resource="taxes"
                        values={(values.ppn || []).map((item) => (typeof item === 'string' ? { name: item } : item))}
                        placeholder="Cari/Pilih..."
                        searchLabel="Cari PPN"
                        onSelect={(option) => {
                            onChange('ppn', [option.name]);
                        }}
                        onRemove={() => {
                            onChange('ppn', []);
                        }}
                    />
                </FormRow>

                <FormRow label="PPh">
                    <BackendLookupField
                        resource="taxes"
                        values={(values.pph || []).map((item) => (typeof item === 'string' ? { name: item } : item))}
                        placeholder="Cari/Pilih..."
                        searchLabel="Cari PPh"
                        onSelect={(option) => {
                            onChange('pph', [option.name]);
                        }}
                        onRemove={() => {
                            onChange('pph', []);
                        }}
                    />
                </FormRow>
            </div>
        </section>
    );
}
