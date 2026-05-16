import TextInput from '@/components/ui/TextInput';

export function ShippingFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,420px)] lg:items-start">
            <label className="pt-2 text-[17px] leading-6 text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

export function PrefixedTextArea({ value, onChange, prefix }) {
    return (
        <div className="flex overflow-hidden rounded-[4px] border border-[#cfd6e2] bg-white">
            <div className="flex min-w-[92px] items-start justify-start border-r border-[#cfd6e2] bg-[#f3f3f4] px-3 py-3 text-[15px] text-[#8b94a7]">
                {prefix}
            </div>
            <textarea
                value={value}
                onChange={onChange}
                rows={4}
                className="min-h-[112px] w-full resize-none px-4 py-3 text-[15px] text-[#1f2436] outline-none"
            />
        </div>
    );
}

export function PrefixedInput({ value, onChange, prefix, className = '' }) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            prefix={prefix}
            className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${className}`.trim()}
            prefixClassName="min-w-[92px] border-[#cfd6e2] bg-[#f3f3f4] px-3 text-[15px] text-[#8b94a7]"
            inputClassName="text-[15px] text-[#1f2436]"
        />
    );
}
