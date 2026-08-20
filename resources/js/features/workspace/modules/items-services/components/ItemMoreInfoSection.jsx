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
        <section className="space-y-2">
            <SectionHeading title="Kondisi & Kelayakan Barang" />

            <div className="space-y-3 pt-2">
                <CheckboxField
                    label="Barang Rusak / Cacat"
                    checked={isDamaged}
                    onChange={handleToggleDamaged}
                />

                {isDamaged && (
                    <FormRow label="Keterangan Rusak">
                        <SelectField
                            value={DAMAGE_TYPES.includes(values.conditionNotes) ? values.conditionNotes : DAMAGE_TYPES[0]}
                            onChange={(event) => onChange('conditionNotes', event.target.value)}
                            className="h-[40px] rounded-[4px] border-ui-border bg-white"
                            selectClassName="text-xs sm:text-sm text-brand-dark"
                        >
                            {DAMAGE_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </SelectField>
                    </FormRow>
                )}

                <CheckboxField
                    label="Barang Kedaluwarsa (Expired)"
                    checked={isExpired}
                    onChange={handleToggleExpired}
                />

                {isExpired && (
                    <>
                        <FormRow label="Tgl Kedaluwarsa">
                            <TextInput
                                type="date"
                                value={values.expiryDate || ''}
                                onChange={(event) => onChange('expiryDate', event.target.value)}
                                className="h-[40px] rounded-[4px] border-ui-border bg-white"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                                loading={isLoading}
                            />
                        </FormRow>
                        <FormRow label="Keterangan Kedaluwarsa">
                            <SelectField
                                value={EXPIRY_TYPES.includes(values.conditionNotes) ? values.conditionNotes : EXPIRY_TYPES[0]}
                                onChange={(event) => onChange('conditionNotes', event.target.value)}
                                className="h-[40px] rounded-[4px] border-ui-border bg-white"
                                selectClassName="text-xs sm:text-sm text-brand-dark"
                            >
                                {EXPIRY_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </SelectField>
                        </FormRow>
                    </>
                )}

                <CheckboxField
                    label="Nonaktifkan Barang (Tidak Dijual)"
                    checked={isInactive && !isDamaged && !isExpired}
                    onChange={handleToggleInactive}
                />
            </div>
        </section>
    );
}



