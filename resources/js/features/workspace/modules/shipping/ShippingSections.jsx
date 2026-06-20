import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';

export function ShippingFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,500px)] lg:items-start">
            <label className="pt-2 text-xs sm:text-sm leading-6 text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div className="min-w-0 w-full">{children}</div>
        </div>
    );
}

export function PrefixedTextArea({ value, onChange, prefix }) {
    return (
        <div className="flex overflow-hidden rounded-[4px] border border-slate-400 bg-white">
            <div className="flex min-w-[92px] items-start justify-start border-r border-slate-400 bg-[#f3f3f4] px-3 py-3 text-xs sm:text-sm text-[#8b94a7]">
                {prefix}
            </div>
            <TextareaField
                value={value}
                onChange={onChange}
                rows={4}
                className="border-none"
                textareaClassName="min-h-[112px] text-[#1f2436]"
            />
        </div>
    );
}

export function PrefixedInput({ value, onChange, prefix, className = '', prefixClassName = '', ...props }) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            prefix={prefix}
            className={`h-[40px] rounded-[4px] border-slate-400 ${className}`.trim()}
            prefixClassName={prefixClassName || "min-w-[92px] border-slate-400 bg-[#f3f3f4] px-3 text-xs sm:text-sm text-[#8b94a7]"}
            inputClassName="text-xs sm:text-sm text-[#1f2436]"
            {...props}
        />
    );
}
