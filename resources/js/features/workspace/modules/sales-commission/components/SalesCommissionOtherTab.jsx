import CheckboxField from '@/components/ui/CheckboxField';
import TextareaField from '@/components/ui/TextareaField';
import { FormFieldRow } from './salesCommissionHelpers';

export default function SalesCommissionOtherTab({ config, values, setValues }) {
    return (
        <div className="space-y-3">
            <FormFieldRow label={config.labels.notes} align="start">
                <TextareaField
                    value={values.notes}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            notes: event.target.value,
                        }))
                    }
                    rows={4}
                    className="rounded-[4px] border-ui-border"
                    textareaClassName="min-h-[80px] text-xs sm:text-sm text-brand-dark"
                />
            </FormFieldRow>

            <FormFieldRow label={config.labels.inactive}>
                <CheckboxField
                    id="sales-commission-inactive"
                    label={config.inactiveLabel}
                    checked={values.inactive}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            inactive: event.target.checked,
                        }))
                    }
                    align="center"
                    labelClassName="text-base"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />
            </FormFieldRow>
        </div>
    );
}
