import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import {
    ClearableTextInput,
    FormRow,
    SectionHeading,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';

const DAMAGE_TYPES = [
    'Pecah / Retak / Cuil',
    'Bocor / Rembes / Basah',
    'Cacat Pabrik / Salah Cetak',
    'Patah / Bengkok / Dol',
    'Kerusakan Lainnya',
];

const EXPIRY_TYPES = [
    'Semen Mengeras / Membatu',
    'Cat Mengering / Menggumpal',
    'Kompon / Lem Melewati Masa Simpan',
    'Kedaluwarsa Lainnya',
];

export function ItemMoreInfoSection({ config, values, onChange, isLoading }) {
    const isDamaged = values.itemCondition === 'damaged';
    const isExpired = values.itemCondition === 'expired';
    const isInactive = values.itemCondition === 'inactive' || values.isActive === false || values.is_active === false;

    function handleToggleDamaged(e) {
        const checked = e.target.checked;
        if (checked) {
            onChange('itemCondition', 'damaged');
            if (!values.conditionNotes || EXPIRY_TYPES.includes(values.conditionNotes)) {
                onChange('conditionNotes', DAMAGE_TYPES[0]);
            }
        } else {
            onChange('itemCondition', 'normal');
            onChange('conditionNotes', '');
        }
    }

    function handleToggleExpired(e) {
        const checked = e.target.checked;
        if (checked) {
            onChange('itemCondition', 'expired');
            if (!values.conditionNotes || DAMAGE_TYPES.includes(values.conditionNotes)) {
                onChange('conditionNotes', EXPIRY_TYPES[0]);
            }
        } else {
            onChange('itemCondition', 'normal');
            onChange('conditionNotes', '');
            onChange('expiryDate', '');
        }
    }

    function handleToggleInactive(e) {
        const checked = e.target.checked;
        if (checked) {
            onChange('itemCondition', 'inactive');
            onChange('isActive', false);
        } else {
            onChange('itemCondition', 'normal');
            onChange('isActive', true);
        }
    }

    return (
        <section className="space-y-3">
            <SectionHeading title="Kondisi & Kelayakan Barang" />

            <div className="space-y-3 rounded-[6px] border border-abc-card-border bg-white p-3.5 shadow-sm">
                <div className="space-y-2.5">
                    <CheckboxField
                        label="Barang Rusak / Afkir / Cacat"
                        checked={isDamaged}
                        onChange={handleToggleDamaged}
                        hint="Centang jika barang mengalami kerusakan fisik / cacat agar tidak dijual ke kasir."
                    />

                    {isDamaged && (
                        <div className="ml-6 space-y-2 rounded-[4px] border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-900">
                            <FormRow label="Keterangan Rusak" className="!grid-cols-[120px_1fr]">
                                <SelectField
                                    value={DAMAGE_TYPES.includes(values.conditionNotes) ? values.conditionNotes : DAMAGE_TYPES[0]}
                                    onChange={(event) => onChange('conditionNotes', event.target.value)}
                                    className="h-[36px] rounded-[4px] border-ui-border bg-white"
                                    selectClassName="text-xs text-brand-dark"
                                >
                                    {DAMAGE_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </SelectField>
                            </FormRow>
                        </div>
                    )}
                </div>

                <hr className="border-slate-100" />

                <div className="space-y-2.5">
                    <CheckboxField
                        label="Barang Kedaluwarsa (Expired)"
                        checked={isExpired}
                        onChange={handleToggleExpired}
                        hint="Centang jika barang telah melewati batas masa simpan pemakaian."
                    />

                    {isExpired && (
                        <div className="ml-6 space-y-2 rounded-[4px] border border-rose-200 bg-rose-50/70 p-2.5 text-xs text-rose-900">
                            <FormRow label="Tgl Kedaluwarsa" className="!grid-cols-[120px_1fr]">
                                <TextInput
                                    type="date"
                                    value={values.expiryDate || ''}
                                    onChange={(event) => onChange('expiryDate', event.target.value)}
                                    className="h-[36px] rounded-[4px] border-ui-border bg-white"
                                    inputClassName="text-xs text-brand-dark"
                                    loading={isLoading}
                                />
                            </FormRow>
                            <FormRow label="Keterangan Kedaluwarsa" className="!grid-cols-[120px_1fr]">
                                <SelectField
                                    value={EXPIRY_TYPES.includes(values.conditionNotes) ? values.conditionNotes : EXPIRY_TYPES[0]}
                                    onChange={(event) => onChange('conditionNotes', event.target.value)}
                                    className="h-[36px] rounded-[4px] border-ui-border bg-white"
                                    selectClassName="text-xs text-brand-dark"
                                >
                                    {EXPIRY_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </SelectField>
                            </FormRow>
                        </div>
                    )}
                </div>

                <hr className="border-slate-100" />

                <div className="space-y-2.5">
                    <CheckboxField
                        label="Nonaktifkan Barang (Tidak Dijual)"
                        checked={isInactive && !isDamaged && !isExpired}
                        onChange={handleToggleInactive}
                        hint="Centang untuk menonaktifkan barang dari daftar pencarian kasir."
                    />
                </div>
            </div>

            {!isDamaged && !isExpired && !isInactive && (
                <div className="flex items-center gap-2 rounded-[4px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Kondisi Barang: Normal (Layak Jual)
                </div>
            )}
        </section>
    );
}


