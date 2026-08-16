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

            <FormRow label="Def. Hrg. Jual Satuan 1">
                {values.kind === 'Grup' ? (
                    <div className="space-y-2">
                        <CheckboxField
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
        </section>
    );
}

export function ItemPurchaseTaxSection({ config, values, onChange, isLoading }) {
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
