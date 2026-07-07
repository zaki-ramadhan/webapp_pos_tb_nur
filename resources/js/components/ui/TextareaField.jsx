import { useEffect, useState, useRef } from 'react';
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
    value,
    defaultValue,
    ...props
}) {
    const isFocusedRef = useRef(false);
    const [localValue, setLocalValue] = useState(() => value ?? defaultValue ?? '');

    useEffect(() => {
        if (value !== undefined) {
            if (!isFocusedRef.current || value === '') {
                setLocalValue(value ?? '');
            }
        }
    }, [value]);

    const { errorMessage: contextErrorMessage, contextKey, clearError } = useFormError(error, props.name, id);
    const resolvedError = contextErrorMessage || (typeof error === 'boolean' ? error : '');
    const feedbackMessage = contextErrorMessage || (typeof error === 'string' ? (error || message) : message);
    const isNonInteractive = disabled || readOnly;

    function handleChange(event) {
        let sanitized = event.target.value;
        const maxLen = props.maxLength ?? 1000;
        if (sanitized.length > maxLen) {
            sanitized = sanitized.slice(0, maxLen);
        }
        setLocalValue(sanitized);
        clearError(contextKey);
        if (onChange) {
            onChange({
                target: {
                    id: id || '',
                    name: props.name || '',
                    value: sanitized,
                },
                currentTarget: {
                    id: id || '',
                    name: props.name || '',
                    value: sanitized,
                },
                preventDefault: () => {
                    event.preventDefault?.();
                },
                stopPropagation: () => {
                    event.stopPropagation?.();
                },
                isDefaultPrevented: () => event.isDefaultPrevented?.() ?? false,
                isPropagationStopped: () => event.isPropagationStopped?.() ?? false,
                persist: () => {},
            });
        }
    }

    const toneClassName = resolvedError
        ? isNonInteractive
            ? 'border-danger'
            : 'border-danger focus-within:border-danger focus-within:shadow-input-error-focus'
        : isNonInteractive
            ? 'border-slate-400'
            : 'border-slate-400 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';

    return (
        <div className={`w-full ${containerClassName}`.trim()}>
            <span
                aria-invalid={Boolean(resolvedError)}
                className={`group flex w-full items-stretch overflow-hidden rounded-md border bg-white transition-[border-color,box-shadow] duration-150 ${toneClassName} ${disabled ? 'bg-ui-bg-panel' : ''} ${isNonInteractive ? 'cursor-default' : 'cursor-text'} ${className}`.trim()}
            >
                {prefix ? (
                    <span
                        className={`flex min-w-[86px] shrink-0 items-start border-r border-slate-400 px-4 py-3 text-xs sm:text-sm transition-colors duration-150 group-focus-within:border-current ${isNonInteractive ? 'bg-ui-bg-panel text-gray-500' : 'text-input-focus'} ${prefixClassName}`.trim()}
                    >
                        {prefix}
                    </span>
                ) : null}

                <textarea
                    ref={props.ref}
                    {...props}
                    id={id}
                    rows={rows}
                    placeholder={placeholder}
                    disabled={disabled}
                    readOnly={readOnly}
                    tabIndex={readOnly ? -1 : tabIndex}
                    aria-invalid={Boolean(resolvedError)}
                    className={`min-h-[92px] flex-1 resize-y bg-transparent px-4 py-3 text-xs sm:text-sm outline-none placeholder:text-disabled-border-t ${isNonInteractive ? 'cursor-default text-gray-500 pointer-events-none' : 'text-slate-700'} ${textareaClassName}`.trim()}
                    value={localValue}
                    onChange={handleChange}
                    onFocus={(e) => {
                        isFocusedRef.current = true;
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        isFocusedRef.current = false;
                        props.onBlur?.(e);
                    }}
                    maxLength={props.maxLength ?? 1000}
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
                <p className={`mt-1.5 text-[11px] sm:text-xs leading-5 ${resolvedError ? 'text-error-border' : 'text-slate-500'} ${messageClassName}`.trim()}>
                    {feedbackMessage}
                </p>
            ) : null}
        </div>
    );
}
