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
    const baseUnit = values.primaryUnit?.[0] ?? null;
    const baseUnitName = baseUnit?.name ?? (typeof baseUnit === 'string' ? baseUnit : (values.unitName ?? 'PCS'));
    const conversions = Array.isArray(values.unitConversions) ? values.unitConversions : [];

    const handleConversionPriceChange = (index, newPrice) => {
        const nextConversions = [...conversions];
        if (nextConversions[index]) {
            nextConversions[index] = {
                ...nextConversions[index],
                price: newPrice,
            };
            onChange('unitConversions', nextConversions);
        }
    };

    return (
        <section className="space-y-2">
            <SectionHeading title={config.labels.salesInfo} />

            <FormRow label="Def. Hrg. Jual Satuan #1">
                {values.kind === 'Grup' ? (
                    <div className="space-y-2">
                        <CheckboxField
                            label="Ambil Harga dari Rincian Barang"
                            checked={values.useGroupPrice !== false}
                            onChange={(e) => onChange('useGroupPrice', e.target.checked)}
                            size="sm"
                        />
                        {values.useGroupPrice === false ? (
                            <div className="flex items-center gap-2">
                                <SimpleTextField
                                    value={values.sellPriceLevel1}
                                    onChange={(event) => onChange('sellPriceLevel1', event.target.value)}
                                    className="max-w-[280px]"
                                    formatAsAmount
                                    isLoading={isLoading}
                                />
                                <span className="text-xs sm:text-sm text-brand-dark font-normal">/ {baseUnitName}</span>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <SimpleTextField
                            value={values.sellPriceLevel1}
                            onChange={(event) => onChange('sellPriceLevel1', event.target.value)}
                            className="max-w-[280px]"
                            formatAsAmount
                            isLoading={isLoading}
                        />
                        <span className="text-xs sm:text-sm text-brand-dark font-normal">/ {baseUnitName}</span>
                    </div>
                )}
            </FormRow>

            {conversions.map((conv, idx) => {
                const convUnit = conv.unit?.[0] ?? conv.unit ?? null;
                const convUnitName = conv.unitName ?? convUnit?.name ?? (typeof convUnit === 'string' ? convUnit : `Satuan #${idx + 2}`);
                return (
                    <FormRow key={conv.id ?? idx} label={`Def. Hrg. Jual Satuan #${idx + 2}`}>
                        <div className="flex items-center gap-2">
                            <SimpleTextField
                                value={conv.price ?? ''}
                                onChange={(event) => handleConversionPriceChange(idx, event.target.value)}
                                className="max-w-[280px]"
                                formatAsAmount
                                isLoading={isLoading}
                            />
                            <span className="text-xs sm:text-sm text-brand-dark font-normal">/ {convUnitName}</span>
                        </div>
                    </FormRow>
                );
            })}
        </section>
    );
}

export function ItemPurchaseTaxSection({ config, values, onChange, isLoading }) {
    const baseUnit = values.primaryUnit?.[0] ?? null;
    const baseUnitName = baseUnit?.name ?? (typeof baseUnit === 'string' ? baseUnit : (values.unitName ?? 'PCS'));
    const purchaseUnit = values.purchaseUnit?.[0] ?? null;
    const purchaseUnitName = purchaseUnit?.name ?? (typeof purchaseUnit === 'string' ? purchaseUnit : (values.purchaseUnitName ?? ''));
    const displayPurchaseUnit = purchaseUnitName || baseUnitName;

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
                    <div className="w-1/2">
                        <BackendLookupField
                            resource="units"
                            value={values.purchaseUnit?.[0]?.name ?? (typeof values.purchaseUnit?.[0] === 'string' ? values.purchaseUnit[0] : (values.purchaseUnitName ?? ''))}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari satuan beli"
                            onSelect={(option) => {
                                const unitName = option?.name ?? option?.label ?? '';
                                const unitId = option?.id ?? null;
                                onChange('purchaseUnit', [{ id: unitId, name: unitName }]);
                                onChange('purchaseUnitId', unitId);
                            }}
                            onClear={() => {
                                onChange('purchaseUnit', []);
                                onChange('purchaseUnitId', null);
                            }}
                            className="w-full"
                        />
                    </div>
                </FormRow>

                <FormRow label="Harga Beli" info>
                    <div className="flex items-center gap-2 w-full">
                        <div className="w-1/2">
                            <SimpleTextField
                                value={values.purchasePrice}
                                onChange={(event) => onChange('purchasePrice', event.target.value)}
                                prefix="Rp"
                                formatAsAmount
                                maxLength={11}
                                className="w-full"
                                containerClassName="w-full"
                                isLoading={isLoading}
                            />
                        </div>
                        <span className="text-xs sm:text-sm text-brand-dark font-normal shrink-0">/ {displayPurchaseUnit}</span>
                    </div>
                </FormRow>

                {values.kind !== 'Non Persediaan' && (
                    <FormRow label="Batas Minimum Stok">
                        <div className="flex items-center gap-2 w-full">
                            <div className="w-1/2">
                                <SimpleTextField
                                    value={values.minimumStock}
                                    onChange={(event) => onChange('minimumStock', event.target.value)}
                                    className="w-full"
                                    containerClassName="w-full"
                                    formatAsAmount
                                    allowDecimal={false}
                                    maxLength={11}
                                    isLoading={isLoading}
                                />
                            </div>
                            <span className="text-xs sm:text-sm text-brand-dark font-normal shrink-0">{baseUnitName}</span>
                        </div>
                    </FormRow>
                )}
            </div>
        </section>
    );
}
