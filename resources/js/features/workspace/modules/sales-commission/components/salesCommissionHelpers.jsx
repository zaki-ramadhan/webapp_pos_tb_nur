import RadioField from '@/components/ui/RadioField';

export function FormFieldRow({ label, required = false, align = 'center', children }) {
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

export function RadioOption({ checked, label, onChange }) {
    return (
        <RadioField
            id={label}
            checked={checked}
            onChange={onChange}
            label={label}
            inputClassName="h-[22px] w-[22px] border-ui-border"
            containerClassName="w-auto inline-flex items-center"
        />
    );
}
