import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import {
    ClearableTextInput,
    FormRow,
    SectionHeading,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';

const CONDITION_OPTIONS = [
    { value: 'normal', label: 'Normal (Layak Jual)' },
    { value: 'expired', label: 'Kedaluwarsa (Expired)' },
    { value: 'damaged', label: 'Rusak / Afkir / Cacat' },
    { value: 'inactive', label: 'Nonaktif / Dihentikan' },
];

export function ItemMoreInfoSection({ config, values, onChange, isLoading }) {
    const isSpecialCondition = values.itemCondition === 'expired' || values.itemCondition === 'damaged';

    return (
        <section className="space-y-2">
            <SectionHeading title="Kondisi & Kelayakan Barang" />

            <FormRow
                label="Kondisi Barang"
                info="Status kelayakan fisik produk. Jika barang kedaluwarsa atau rusak fisik, pilih status terkait tanpa perlu menghapus master barang."
            >
                <SelectField
                    value={values.itemCondition || 'normal'}
                    onChange={(event) => onChange('itemCondition', event.target.value)}
                    className="h-[40px] rounded-[4px] border-ui-border bg-white"
                    selectClassName="text-xs sm:text-sm text-brand-dark"
                >
                    {CONDITION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </SelectField>
            </FormRow>

            <FormRow
                label="Tgl Kedaluwarsa"
                info="Tanggal batas akhir pemakaian barang (misal: semen mengeras, cat mengering, kompon bocor)."
            >
                <TextInput
                    type="date"
                    value={values.expiryDate || ''}
                    onChange={(event) => onChange('expiryDate', event.target.value)}
                    className="h-[40px] rounded-[4px] border-ui-border bg-white"
                    inputClassName="text-xs sm:text-sm text-brand-dark"
                    loading={isLoading}
                />
            </FormRow>

            <FormRow
                label="Keterangan Rusak / Kondisi"
                info="Catatan detail mengenai kondisi kerusakan, penyebab cacat, atau informasi kedaluwarsa barang."
            >
                <ClearableTextInput
                    value={values.conditionNotes || ''}
                    onChange={(event) => onChange('conditionNotes', event.target.value)}
                    placeholder={
                        values.itemCondition === 'damaged'
                            ? 'Contoh: Kaleng cat bocor / keramik retak 2 dus'
                            : values.itemCondition === 'expired'
                            ? 'Contoh: Semen telah membatu / mengeras'
                            : 'Keterangan kondisi khusus jika ada...'
                    }
                    maxLength={255}
                    isLoading={isLoading}
                />
            </FormRow>

            {isSpecialCondition ? (
                <div className="rounded-[4px] border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                    <p className="font-medium">
                        {values.itemCondition === 'damaged' ? 'Perhatian: Barang Rusak / Cacat' : 'Perhatian: Barang Kedaluwarsa'}
                    </p>
                    <p className="mt-0.5 text-amber-700">
                        Data master barang tetap dipertahankan untuk menjamin integritas riwayat faktur penjualan dan pembelian terdahulu.
                    </p>
                </div>
            ) : null}
        </section>
    );
}

