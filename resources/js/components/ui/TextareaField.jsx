import { useFormError } from './FormErrorContext';

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
    onChange,
    ...props
}) {
    const { errorMessage: contextErrorMessage, contextKey, clearError } = useFormError(error, props.name, id);
    const resolvedError = contextErrorMessage || (typeof error === 'boolean' ? error : '');
    const feedbackMessage = contextErrorMessage || (typeof error === 'string' ? (error || message) : message);
    const isNonInteractive = disabled || readOnly;

    function handleChange(event) {
        if (!onChange) return;
        // Bersihkan tag HTML
        const sanitized = event.target.value.replace(/<[^>]*>/g, '');
        if (sanitized !== event.target.value) {
            event.target.value = sanitized;
        }
        clearError(contextKey);
        onChange(event);
    }

    const toneClassName = resolvedError
        ? isNonInteractive
            ? 'border-[#e39191]'
            : 'border-[#e39191] focus-within:border-[#d65959] focus-within:shadow-[0_0_0_3px_rgba(214,89,89,0.14)]'
        : isNonInteractive
            ? 'border-slate-400'
            : 'border-slate-400 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';

    return (
        <div className={`w-full ${containerClassName}`.trim()}>
            <span
                className={`group flex w-full items-stretch overflow-hidden rounded-md border bg-white transition-[border-color,box-shadow] duration-150 ${toneClassName} ${disabled ? 'bg-[#f5f5f5]' : ''} ${className}`.trim()}
            >
                {prefix ? (
                    <span
                        className={`flex min-w-[86px] shrink-0 items-start border-r border-slate-400 px-4 py-3 text-xs sm:text-sm transition-colors duration-150 group-focus-within:border-current ${isNonInteractive ? 'bg-[#f5f5f5] text-gray-500' : 'text-[#5a84e5]'} ${prefixClassName}`.trim()}
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
                    aria-invalid={Boolean(resolvedError)}
                    className={`min-h-[92px] flex-1 resize-none bg-transparent px-4 py-3 text-xs sm:text-sm outline-none placeholder:text-[#a1a8b7] ${isNonInteractive ? 'cursor-default text-gray-500 pointer-events-none' : 'text-slate-700'} ${textareaClassName}`.trim()}
                    onChange={handleChange}
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
                <p className={`mt-1.5 text-[11px] sm:text-xs leading-5 ${resolvedError ? 'text-[#d65959]' : 'text-slate-500'} ${messageClassName}`.trim()}>
                    {feedbackMessage}
                </p>
            ) : null}
        </div>
    );
}
