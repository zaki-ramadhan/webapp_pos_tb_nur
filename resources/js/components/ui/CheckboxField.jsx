export default function CheckboxField({
    id,
    label,
    error = '',
    message = '',
    hint = '',
    disabled = false,
    size = 'sm',
    align = 'start',
    className = '',
    containerClassName = '',
    inputClassName = '',
    labelClassName = '',
    messageClassName = '',
    children,
    ...props
}) {
    const feedbackMessage = error || message || hint;
    const sizeClassName = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
    const alignClassName = align === 'center' ? 'items-center' : 'items-start';
    const inputOffsetClassName = align === 'center' ? 'mt-0' : 'mt-1';

    const hasWidth = containerClassName.includes('w-');
    const widthClass = hasWidth ? '' : 'w-full';

    return (
        <div className={`${widthClass} ${containerClassName}`.trim()}>
            <label
                htmlFor={id}
                className={`flex ${alignClassName} gap-2.5 text-[15px] leading-6 ${disabled ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer text-slate-600'} ${className}`.trim()}
            >
                <input
                    id={id}
                    type="checkbox"
                    disabled={disabled}
                    aria-invalid={Boolean(error)}
                    className={`${inputOffsetClassName} shrink-0 rounded-[4px] border border-slate-300 text-[#0f65c9] focus:ring-2 focus:ring-[#5a84e5]/30 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300 ${sizeClassName} ${error ? 'border-[#d65959]' : ''} ${inputClassName}`.trim()}
                    {...props}
                />
                <span className={`min-w-0 ${labelClassName}`.trim()}>
                    <span className={`${disabled ? 'text-slate-400' : 'text-[#131a28]'}`.trim()}>
                        {label}
                        {children}
                    </span>

                    {feedbackMessage ? (
                        <span className={`mt-1 block text-[13px] leading-5 ${error ? 'text-[#d65959]' : 'text-slate-500'} ${messageClassName}`.trim()}>
                            {feedbackMessage}
                        </span>
                    ) : null}
                </span>
            </label>
        </div>
    );
}
