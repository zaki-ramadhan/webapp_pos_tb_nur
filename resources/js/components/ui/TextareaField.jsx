export default function TextareaField({
    id,
    rows = 3,
    placeholder = '',
    prefix = null,
    trailing = null,
    error = '',
    message = '',
    disabled = false,
    className = '',
    containerClassName = '',
    prefixClassName = '',
    textareaClassName = '',
    trailingClassName = '',
    messageClassName = '',
    readOnly = false,
    tabIndex,
    ...props
}) {
    const feedbackMessage = error || message;
    const isNonInteractive = disabled || readOnly;
    const toneClassName = error
        ? isNonInteractive
            ? 'border-[#e39191]'
            : 'border-[#e39191] focus-within:border-[#d65959] focus-within:shadow-[0_0_0_3px_rgba(214,89,89,0.14)]'
        : isNonInteractive
            ? 'border-slate-300'
            : 'border-slate-300 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';

    return (
        <div className={`w-full ${containerClassName}`.trim()}>
            <span
                className={`group flex w-full items-stretch overflow-hidden rounded-md border bg-white transition-[border-color,box-shadow] duration-150 ${toneClassName} ${disabled ? 'bg-slate-100' : ''} ${className}`.trim()}
            >
                {prefix ? (
                    <span
                        className={`flex min-w-[86px] shrink-0 items-start border-r border-slate-300 px-4 py-3 text-[15px] transition-colors duration-150 group-focus-within:border-current ${isNonInteractive ? 'bg-slate-100 text-slate-400' : 'text-[#5a84e5]'} ${prefixClassName}`.trim()}
                    >
                        {prefix}
                    </span>
                ) : null}

                <textarea
                    id={id}
                    rows={rows}
                    placeholder={placeholder}
                    disabled={disabled}
                    readOnly={readOnly}
                    tabIndex={readOnly ? -1 : tabIndex}
                    aria-invalid={Boolean(error)}
                    className={`min-h-[92px] flex-1 resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-slate-300 ${isNonInteractive ? 'cursor-default text-slate-400 pointer-events-none' : 'text-slate-700'} ${textareaClassName}`.trim()}
                    {...props}
                />

                {trailing ? (
                    <span
                        className={`flex items-start px-3 py-3 transition-colors duration-150 ${isNonInteractive ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-[var(--color-input-focus)]'} ${trailingClassName}`.trim()}
                    >
                        {trailing}
                    </span>
                ) : null}
            </span>

            {feedbackMessage ? (
                <p className={`mt-1.5 text-[13px] leading-5 ${error ? 'text-[#d65959]' : 'text-slate-500'} ${messageClassName}`.trim()}>
                    {feedbackMessage}
                </p>
            ) : null}
        </div>
    );
}
