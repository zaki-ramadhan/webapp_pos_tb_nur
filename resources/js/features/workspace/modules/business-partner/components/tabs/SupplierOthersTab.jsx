import CheckboxField from '@/components/ui/CheckboxField';
import TextareaField from '@/components/ui/TextareaField';
import {
    FormFieldRow,
    SectionHeading,
} from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';

export default function SupplierOthersTab({ config, values, onChange }) {
    const othersConfig = config.othersConfig ?? {};

    return (
        <section className="max-w-[900px]">
            <SectionHeading title={othersConfig.title} />

            <div className="mt-4 space-y-3">
                <FormFieldRow label={othersConfig.invoiceNumberLabel}>
                    <CheckboxField
                        id="supplier-invoice-number"
                        label={othersConfig.invoiceNumberCheckboxLabel}
                        checked={Boolean(values.invoiceNumberOnBill)}
                        onChange={(event) => onChange('invoiceNumberOnBill', event.target.checked)}
                        align="center"
                        labelClassName="text-xs sm:text-sm"
                        inputClassName="mt-0 h-4 w-4 sm:h-[18px] sm:w-[18px]"
                        containerClassName="w-auto"
                    />
                </FormFieldRow>

                <FormFieldRow label={othersConfig.notesLabel}>
                    <TextareaField
                        value={values.notes}
                        onChange={(event) => onChange('notes', event.target.value)}
                        rows={4}
                        className="max-w-full sm:max-w-[50%] rounded-[4px] border-ui-border"
                        textareaClassName="min-h-[98px] text-xs sm:text-sm text-brand-dark"
                    />
                </FormFieldRow>
            </div>
        </section>
    );
}
