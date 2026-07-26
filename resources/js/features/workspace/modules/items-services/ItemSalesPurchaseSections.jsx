import { TransactionSwitch } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import Tooltip from '@/components/ui/Tooltip';
import { InfoIcon } from '@/features/workspace/shared/Icons';
import CheckboxField from '@/components/ui/CheckboxField';
import {
    FormRow,
    LookupField,
    SectionHeading,
    SimpleTextField,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';

export function ItemSalesInfoSection({ config, values, onChange, isLoading }) {
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
                        isLoading={isLoading}
                    />
                    <span className="text-xs sm:text-sm text-brand-dark">/ Semua Satuan</span>
                </div>
            </FormRow>

            <FormRow label="Def. Hrg. Jual Satuan #1">
                {values.kind === 'Grup' && !values.bulkPricingEnabled ? (
                    <div className="space-y-2">
                        <CheckboxField
                            id="useGroupPrice"
                            label="Ambil Harga dari Rincian Barang"
                            checked={values.useGroupPrice !== false}
                            onChange={(e) => onChange('useGroupPrice', e.target.checked)}
                            size="sm"
                        />
                        {values.useGroupPrice === false ? (
                            <SimpleTextField
                                value={values.sellPriceLevel1}
                                onChange={(event) => onChange('sellPriceLevel1', event.target.value)}
                                className="max-w-[280px]"
                                formatAsAmount
                                isLoading={isLoading}
                            />
                        ) : null}
                    </div>
                ) : (
                    <SimpleTextField
                        value={values.sellPriceLevel1}
                        onChange={(event) => onChange('sellPriceLevel1', event.target.value)}
                        className="max-w-[280px]"
                        formatAsAmount
                        isLoading={isLoading}
                    />
                )}
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
                        Menerapkan Harga / Diskon Grosir
                    </span>
                </div>

                {values.kind !== 'Non Persediaan' && values.kind !== 'Jasa' && (
                    <>
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
                            <span className="text-xs sm:text-sm text-brand-dark">
                                Substitusi dengan{' '}
                                <Tooltip content="Menghubungkan barang-barang yang bisa menjadi barang pengganti jika stoknya kosong saat jual" portal>
                                    <InfoIcon className="ml-1 inline-flex h-3.5 w-3.5 align-middle text-filter-select-text cursor-help" />
                                </Tooltip>
                            </span>
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
                    </>
                )}
            </div>
        </section>
    );
}

export function ItemPurchaseTaxSection({ config, values, onChange, isLoading }) {
    if (values.kind === 'Jasa') {
        return null;
    }

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
                            onChange('mainSupplier', [{ id: option.id, name: option.name }]);
                            onChange('mainSupplierId', option.id);
                        }}
                        onRemove={() => {
                            onChange('mainSupplier', []);
                            onChange('mainSupplierId', null);
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
                            onChange('purchaseUnit', [{ id: option.id, name: option.name }]);
                            onChange('purchaseUnitId', option.id);
                        }}
                        onRemove={() => {
                            onChange('purchaseUnit', []);
                            onChange('purchaseUnitId', null);
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
                        isLoading={isLoading}
                    />
                </FormRow>

                <FormRow label="Minimum Pembelian">
                    <SimpleTextField
                        value={values.minimumPurchase}
                        onChange={(event) => onChange('minimumPurchase', event.target.value)}
                        className="max-w-[420px]"
                        formatAsAmount
                        allowDecimal={false}
                        maxLength={11}
                        isLoading={isLoading}
                    />
                </FormRow>

                {values.kind !== 'Non Persediaan' && (
                    <FormRow label="Batas Minimum Stok">
                        <SimpleTextField
                            value={values.minimumStock}
                            onChange={(event) => onChange('minimumStock', event.target.value)}
                            className="max-w-[420px]"
                            formatAsAmount
                            allowDecimal={false}
                            maxLength={11}
                            isLoading={isLoading}
                        />
                    </FormRow>
                )}
            </div>
        </section>
    );
}
