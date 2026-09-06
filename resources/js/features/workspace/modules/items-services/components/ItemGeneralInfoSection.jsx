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
                    value={values.category?.[0]?.name ?? (typeof values.category?.[0] === 'string' ? values.category[0] : (values.categoryName ?? ''))}
                    placeholder="Cari/Pilih Kategori..."
                    searchLabel="Cari kategori barang"
                    onSelect={(option) => {
                        onChange('category', [{ id: option.id, name: option.name }]);
                        onChange('categoryId', option.id);
                    }}
                    onClear={() => {
                        onChange('category', []);
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

            {values.kind !== 'Non Persediaan' && (
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
                        value={values.primaryUnit?.[0]?.name ?? (typeof values.primaryUnit?.[0] === 'string' ? values.primaryUnit[0] : (values.unitName ?? ''))}
                        placeholder="Cari/Pilih Satuan..."
                        searchLabel="Cari satuan"
                        onSelect={(option) => {
                            onChange('primaryUnit', [{ id: option.id, name: option.name }]);
                            onChange('baseUnitId', option.id);
                        }}
                        onClear={() => {
                            onChange('primaryUnit', []);
                            onChange('baseUnitId', null);
                        }}
                    />
                </div>
            </FormRow>
        </section>
    );
}
