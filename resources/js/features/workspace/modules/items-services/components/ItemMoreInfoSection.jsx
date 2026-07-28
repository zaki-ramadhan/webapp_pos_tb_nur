import RadioField from '@/components/ui/RadioField';
import { TransactionSwitch } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    FormRow,
    SectionHeading,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';
import {
    isWorkspaceControlInactive,
    WORKSPACE_INACTIVE_BADGE_LABEL,
    WORKSPACE_INACTIVE_HINT,
} from '@/features/workspace/shared/workspaceAvailability';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';

export function ItemMoreInfoSection({ config, values, onChange }) {
    const isBrandFieldInactive = isWorkspaceControlInactive('item-brand-field');

    if (values.kind === 'Jasa' || values.kind === 'Grup') {
        return null;
    }

    return (
        <section className="space-y-2">
            <SectionHeading title={config.labels.moreInfo} />

            <FormRow label="Merek Barang">
                <div className="space-y-2">
                    <BackendLookupField
                        resource="brands"
                        values={(values.brand || []).map((item) => (typeof item === 'string' ? { name: item } : item))}
                        placeholder="Cari/Pilih Merek..."
                        searchLabel="Cari merek"
                        onSelect={(option) => {
                            onChange('brand', [{ id: option.id, name: option.name }]);
                            onChange('brandId', option.id);
                        }}
                        onRemove={() => {
                            onChange('brand', []);
                            onChange('brandId', null);
                        }}
                        disabled={isBrandFieldInactive}
                    />
                    {isBrandFieldInactive ? (
                        <div className="flex flex-wrap items-center gap-2 text-sm text-warning-label-text">
                            <span className="rounded-full bg-bg-warning-tag px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-warning-badge-text">
                                {WORKSPACE_INACTIVE_BADGE_LABEL}
                            </span>
                            <span>{WORKSPACE_INACTIVE_HINT}</span>
                        </div>
                    ) : null}
                </div>
            </FormRow>

            {values.kind !== 'Non Persediaan' && (
                <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-3">
                        <TransactionSwitch
                            checked={values.serialEnabled}
                            onChange={(nextValue) => onChange('serialEnabled', nextValue)}
                        />
                        <span className="text-xs sm:text-sm text-brand-dark">
                            Aktifkan No. Seri/Produksi
                        </span>
                    </div>

                    {values.serialEnabled && (
                        <div className="pl-8 space-y-2">
                            <RadioField
                                id="serialTypeUnique"
                                name="serialType"
                                label="Nomor Unik"
                                checked={values.serialType === 'unique'}
                                onChange={() => onChange('serialType', 'unique')}
                            />
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                                <RadioField
                                    id="serialTypeProduction"
                                    name="serialType"
                                    label="Nomor Produksi"
                                    checked={values.serialType === 'production'}
                                    onChange={() => onChange('serialType', 'production')}
                                />
                                <div className="flex items-center gap-2 self-start sm:self-auto">
                                    <TransactionSwitch
                                        checked={values.useExpiryDate}
                                        onChange={(nextValue) => onChange('useExpiryDate', nextValue)}
                                    />
                                    <span className="text-xs sm:text-sm text-brand-dark">
                                        Pakai tanggal kadaluarsa
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
