import {
    FormRow,
    LookupField,
    SectionHeading,
    SimpleTextField,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';

export function ItemPurchaseTaxSection({ config, values, onChange, isLoading }) {
    return (
        <section className="space-y-7">
            <div className="space-y-2">
                <SectionHeading title={config.labels.purchaseInfo} />

                <FormRow label="Pemasok Utama" info>
                    <BackendLookupField
                        resource="suppliers"
                        value={values.mainSupplier?.[0]?.name ?? (typeof values.mainSupplier?.[0] === 'string' ? values.mainSupplier[0] : (values.mainSupplierName ?? ''))}
                        placeholder="Cari/Pilih Pemasok..."
                        searchLabel="Cari pemasok"
                        onSelect={(option) => {
                            onChange('mainSupplier', [{ id: option.id, name: option.name }]);
                            onChange('mainSupplierId', option.id);
                        }}
                        onClear={() => {
                            onChange('mainSupplier', []);
                            onChange('mainSupplierId', null);
                        }}
                    />
                </FormRow>

                <FormRow label="Satuan Beli">
                    <BackendLookupField
                        resource="units"
                        value={values.purchaseUnit?.[0]?.name ?? (typeof values.purchaseUnit?.[0] === 'string' ? values.purchaseUnit[0] : (values.purchaseUnitName ?? ''))}
                        placeholder="Cari/Pilih..."
                        searchLabel="Cari satuan beli"
                        onSelect={(option) => {
                            onChange('purchaseUnit', [{ id: option.id, name: option.name }]);
                            onChange('purchaseUnitId', option.id);
                        }}
                        onClear={() => {
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
