import SelectField from '@/components/ui/SelectField';
import RadioField from '@/components/ui/RadioField';
import { TransactionSwitch } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    ClearableTextInput,
    CodeFieldRow,
    FormRow,
    LookupField,
    SectionHeading,
    SimpleTextField,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';
import {
    isWorkspaceControlInactive,
    WORKSPACE_INACTIVE_BADGE_LABEL,
    WORKSPACE_INACTIVE_HINT,
} from '@/features/workspace/shared/workspaceAvailability';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';

export function ItemGeneralInfoSection({ config, values, onChange, isDetail }) {
    return (
        <section className="space-y-2">
            <SectionHeading title={config.labels.generalInfo} />

            <FormRow label="Nama Barang" required>
                <ClearableTextInput
                    value={values.name}
                    onChange={(event) => onChange('name', event.target.value)}
                    maxLength={150}
                    minLength={1}
                />
            </FormRow>

            <FormRow label="Kategori Barang" required>
                <BackendLookupField
                    resource="product-categories"
                    values={(values.category || []).map((item) => (typeof item === 'string' ? { name: item } : item))}
                    placeholder="Cari/Pilih Kategori..."
                    searchLabel="Cari kategori barang"
                    onSelect={(option) => {
                        const current = values.category || [];
                        if (!current.includes(option.name)) {
                            onChange('category', [...current, option.name]);
                        }
                    }}
                    onRemove={(option) => {
                        const current = values.category || [];
                        onChange('category', current.filter((x) => x !== option.name));
                    }}
                />
            </FormRow>

            <FormRow
                label="Jenis Barang"
                info="Pilih jenis barang sesuai fungsinya. Untuk barang yang menghitung stok dan nilai persediaan, pilih Persediaan. Tipe tidak dapat diubah setelah disimpan."
            >
                <SelectField
                    value={values.kind}
                    onChange={(event) => onChange('kind', event.target.value)}
                    className="h-[40px] rounded-[4px] border-ui-border"
                    selectClassName="text-xs sm:text-sm text-brand-dark"
                >
                    {config.kindOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </SelectField>
            </FormRow>

            <CodeFieldRow values={values} onChange={onChange} isDetail={isDetail} />

            {values.kind !== 'Non Persediaan' && values.kind !== 'Jasa' && (
                <FormRow
                    label="UPC/Barcode"
                    info="Kode barcode standar yang dapat dibaca oleh alat Scanner/Barcode Reader."
                >
                    <ClearableTextInput
                        value={values.barcode}
                        onChange={(event) => onChange('barcode', event.target.value)}
                        maxLength={64}
                    />
                </FormRow>
            )}

            <FormRow label="Satuan" required>
                <div className="w-full max-w-[282px]">
                    <BackendLookupField
                        resource="units"
                        values={(values.primaryUnit || []).map((item) => (typeof item === 'string' ? { name: item } : item))}
                        placeholder="Cari/Pilih Satuan..."
                        searchLabel="Cari satuan"
                        onSelect={(option) => {
                            onChange('primaryUnit', [option.name]);
                        }}
                        onRemove={() => {
                            onChange('primaryUnit', []);
                        }}
                    />
                </div>
            </FormRow>
        </section>
    );
}

export function ItemMoreInfoSection({ config, values, onChange }) {
    const isBrandFieldInactive = isWorkspaceControlInactive('item-brand-field');

    return (
        <section className="space-y-2">
            <SectionHeading title={config.labels.moreInfo} />

            {values.kind !== 'Jasa' && (
                <FormRow label="Merek Barang">
                    <div className="space-y-2">
                        <BackendLookupField
                            resource="brands"
                            values={(values.brand || []).map((item) => (typeof item === 'string' ? { name: item } : item))}
                            placeholder="Cari/Pilih Merek..."
                            searchLabel="Cari merek"
                            onSelect={(option) => {
                                onChange('brand', [option.name]);
                            }}
                            onRemove={() => {
                                onChange('brand', []);
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
            )}

            {values.kind !== 'Non Persediaan' && values.kind !== 'Jasa' && (
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
