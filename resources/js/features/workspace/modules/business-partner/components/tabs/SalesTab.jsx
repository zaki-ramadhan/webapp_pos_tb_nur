import CheckboxField from '@/components/ui/CheckboxField';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
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
                <FormattedAmountInput
                    id="creditLimit"
                    name="creditLimit"
                    value={values.creditLimit}
                    onChange={(event) => onChange('creditLimit', event.target.value)}
                    prefix="Rp"
                    maxLength={18}
                    className="h-[40px] rounded-[4px] border-ui-border"
                    prefixClassName="min-w-[34px] bg-input-prefix-bg-compact px-3 text-table-row-text"
                    inputClassName="text-right text-xs sm:text-sm text-brand-dark"
                />
            </FormFieldRow>
        </div>
    );
}
