import CheckboxField from '@/components/ui/CheckboxField';
import TextareaField from '@/components/ui/TextareaField';

function FormFieldRow({ label, required = false, align = 'center', children }) {
    return (
        <div className={`grid gap-3 lg:grid-cols-[440px_minmax(0,1fr)] ${align === 'start' ? 'lg:items-start' : 'lg:items-center'}`.trim()}>
            <label className={`${align === 'start' ? 'pt-2' : ''} text-base leading-[1.35] text-brand-dark`.trim()}>
                {label}
                {required ? <span className="text-tab-active-border-t"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

export function SalesCommissionOtherTab({ config, values, setValues }) {
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
