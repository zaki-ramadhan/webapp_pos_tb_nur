import { useToggleFieldError } from './FormErrorContext';

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
    onChange,
    ...props
}) {
    const {
        resolvedError,
        feedbackMessage: resolvedFeedback,
        sizeClassName,
        alignClassName,
        inputOffsetClassName,
        widthClass,
        contextKey,
        clearError,
    } = useToggleFieldError({ error, name: props.name, id, size, align, containerClassName });

    const feedbackMessage = resolvedFeedback || message || hint;

    function handleChange(event) {
        clearError(contextKey);
        onChange?.(event);
    }

    return (
        <div className={`${widthClass} ${containerClassName}`.trim()}>
            <div className={`flex ${alignClassName} gap-2.5 text-[15px] leading-6`.trim()}>
                <input
                    id={id}
                    type="checkbox"
                    disabled={disabled}
                    aria-invalid={Boolean(resolvedError)}
                    className={`${inputOffsetClassName} shrink-0 rounded-[4px] border border-slate-300 text-input-brand focus:ring-2 focus:ring-input-focus/30 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300 ${sizeClassName} ${resolvedError ? 'border-error-border' : ''} ${inputClassName}`.trim()}
                    onChange={handleChange}
                    {...props}
                />
                <label
                    htmlFor={id}
                    className={`min-w-0 ${disabled ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer text-slate-600'} ${labelClassName} ${className}`.trim()}
                >
                    <span className={`${disabled ? 'text-slate-400' : 'text-brand-dark'}`.trim()}>
                        {label}
                        {children}
                    </span>

                    {feedbackMessage ? (
                        <span className={`mt-1 block text-[13px] leading-5 ${resolvedError ? 'text-error-text' : 'text-slate-500'} ${messageClassName}`.trim()}>
                            {feedbackMessage}
                        </span>
                    ) : null}
                </label>
            </div>
        </div>
    );
}
