import CheckboxField from '@/components/ui/CheckboxField';
import TextInput from '@/components/ui/TextInput';
import {
    FormRow,
    SectionHeading,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';

export function ItemMoreInfoSection({ values, onChange, isLoading }) {
    const isDamaged = values.itemCondition === 'damaged';
    const isExpired = values.itemCondition === 'expired';
    const isInactive = values.itemCondition === 'inactive' || values.isActive === false || values.is_active === false;

    function handleToggleDamaged(e) {
        const checked = e.target.checked;
        if (checked) {
            onChange('itemCondition', 'damaged');
            onChange('conditionNotes', 'Barang Rusak / Cacat');
        } else {
            onChange('itemCondition', 'normal');
            onChange('conditionNotes', '');
        }
    }

    function handleToggleExpired(e) {
        const checked = e.target.checked;
        if (checked) {
            onChange('itemCondition', 'expired');
            onChange('conditionNotes', 'Barang Kedaluwarsa');
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

                <CheckboxField
                    label="Barang Kedaluwarsa (Expired)"
                    checked={isExpired}
                    onChange={handleToggleExpired}
                />

                {isExpired && (
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
