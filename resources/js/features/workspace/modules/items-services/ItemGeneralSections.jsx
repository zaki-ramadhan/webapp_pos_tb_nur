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

export function ItemGeneralInfoSection({ config, values, onChange, isDetail, isLoading }) {
    return (
        <section className="space-y-2">
            <SectionHeading title={config.labels.generalInfo} />

            <FormRow label="Nama Barang" required>
                <ClearableTextInput
                    value={values.name}
                    onChange={(event) => onChange('name', event.target.value)}
                    maxLength={150}
                    minLength={1}
                    isLoading={isLoading}
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
                        if (!current.some((x) => (x.name ?? x) === option.name)) {
                            onChange('category', [...current, { id: option.id, name: option.name }]);
                            onChange('categoryId', option.id);
                        }
                    }}
                    onRemove={(option) => {
                        const current = values.category || [];
                        const nameToRemove = option.name ?? option;
                        onChange('category', current.filter((x) => (x.name ?? x) !== nameToRemove));
                        onChange('categoryId', null);
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

            <CodeFieldRow values={values} onChange={onChange} isDetail={isDetail} isLoading={isLoading} />

            {values.kind !== 'Non Persediaan' && values.kind !== 'Jasa' && (
                <FormRow
                    label="UPC/Barcode"
                    info="Kode barcode standar yang dapat dibaca oleh alat Scanner/Barcode Reader."
                >
                    <ClearableTextInput
                        value={values.barcode}
                        onChange={(event) => onChange('barcode', event.target.value)}
                        maxLength={64}
                        isLoading={isLoading}
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
                            onChange('primaryUnit', [{ id: option.id, name: option.name }]);
                            onChange('baseUnitId', option.id);
                        }}
                        onRemove={() => {
                            onChange('primaryUnit', []);
                            onChange('baseUnitId', null);
                        }}
                    />
                </div>
            </FormRow>
        </section>
    );
}

export function ItemMoreInfoSection() {
    return null;
}
