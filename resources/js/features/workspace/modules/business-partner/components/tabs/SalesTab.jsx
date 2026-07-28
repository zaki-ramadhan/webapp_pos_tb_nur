import CheckboxField from '@/components/ui/CheckboxField';
import {
    AddressStack,
    FormFieldRow,
    SectionHeading,
    SelectField,
    TextInput,
} from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';

export default function SalesTab({ config, values, onChange }) {
    return (
        <div className="max-w-[500px] space-y-3">
            <SectionHeading title={config.headingLabels.salesLeft} />

            <FormFieldRow label="Batas Saldo Piutang">
                <TextInput
                    id="creditLimit"
                    name="creditLimit"
                    value={values.creditLimit}
                    onChange={(event) => {
                        const sanitized = event.target.value.replace(/[^0-9]/g, '');
                        onChange('creditLimit', sanitized);
                    }}
                    prefix="Rp"
                    className="h-[40px] rounded-[4px] border-ui-border"
                    prefixClassName="min-w-[34px] bg-input-prefix-bg-compact px-3 text-text-inactive"
                    inputClassName="text-xs sm:text-sm text-brand-dark"
                />
            </FormFieldRow>
        </div>
    );
}
