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
            <div className={`flex ${alignClassName} gap-3.5 text-xs sm:text-sm leading-6`.trim()}>
                <input

                    id={id}
                    type="checkbox"
                    disabled={disabled}
                    aria-invalid={Boolean(resolvedError)}
                    className={`${inputOffsetClassName} shrink-0 rounded-[4px] border border-slate-400 text-input-brand focus:ring-2 focus:ring-input-focus/30 disabled:border-gray-200 disabled:bg-ui-bg-panel disabled:text-gray-400 ${sizeClassName} ${resolvedError ? 'border-error-border' : ''} ${inputClassName}`.trim()}
                    onChange={handleChange}
                    {...props}
                />
                <label
                    htmlFor={id}
                    className={`min-w-0 ${disabled ? 'cursor-default text-gray-500 pointer-events-none' : 'cursor-pointer text-slate-600'} ${labelClassName} ${className}`.trim()}
                >
                    <span className={`${disabled ? 'text-gray-500' : 'text-brand-dark'}`.trim()}>
                        {label}
                        {children}
                    </span>

                    {feedbackMessage ? (
                        <span className={`mt-1 block text-[11px] sm:text-xs leading-5 ${resolvedError ? 'text-error-text' : 'text-slate-500'} ${messageClassName}`.trim()}>
                            {feedbackMessage}
                        </span>
                    ) : null}
                </label>
            </div>
        </div>
    );
}
