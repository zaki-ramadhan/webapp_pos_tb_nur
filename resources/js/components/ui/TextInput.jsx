import { useRef, useState, useEffect } from 'react';

import { useFormError } from './FormErrorContext';

function sanitizeInput(val, type, id = '', name = '', placeholder = '') {
    const searchStr = `${id} ${name} ${placeholder}`.toLowerCase();
    
    // Bypass sanitization for email, username, and general login identifier fields
    if (
        searchStr.includes('email') || 
        searchStr.includes('username') || 
        searchStr.includes('identifier')
    ) {
        return val;
    }
    
    // Check if it's a phone number or contact number
    const isPhone = searchStr.includes('phone') || 
                    searchStr.includes('telp') || 
                    searchStr.includes('telepon') ||
                    searchStr.includes('whatsapp') || 
                    searchStr.includes('wa') || 
                    searchStr.includes('fax') || 
                    searchStr.includes('hp') || 
                    searchStr.includes('kontak') || 
                    searchStr.includes('contact');
                    
    // Check if it is a digit-only field like account number, tax number, postal code
    const isDigitOnly = (
                            searchStr.includes('rekening') || 
                            searchStr.includes('account_number') || 
                            searchStr.includes('bank_number') || 
                            searchStr.includes('tax_number') || 
                            searchStr.includes('npwp') || 
                            searchStr.includes('nitku') || 
                            searchStr.includes('postal') || 
                            searchStr.includes('kodepos') || 
                            searchStr.includes('zip') ||
                            /\bno\.?\b/.test(searchStr)
                        ) && !searchStr.includes('note') && !searchStr.includes('document');

    if (isPhone) {
        // Allow digits, spaces, plus sign, and hyphens
        return val.replace(/[^0-9+\s-]/g, '');
    }

    if (isDigitOnly) {
        // Strip out everything except digits (0-9)
        let clean = val.replace(/[^0-9]/g, '');
        if (searchStr.includes('npwp')) {
            clean = clean.slice(0, 16);
            if (/^0+$/.test(clean) && clean.length === 16) {
                clean = '';
            }
        }
        return clean;
    }

    // Check if it's a numeric field
    const isNumeric = type === 'number' || 
                      searchStr.includes('price') || 
                      searchStr.includes('amount') || 
                      searchStr.includes('percentage') || 
                      searchStr.includes('rate') || 
                      searchStr.includes('limit') || 
                      searchStr.includes('age') || 
                      searchStr.includes('range') || 
                      searchStr.includes('days') || 
                      searchStr.includes('qty') || 
                      searchStr.includes('quantity') || 
                      searchStr.includes('value') ||
                      searchStr.includes('kurs') ||
                      searchStr.includes('jumlah') ||
                      searchStr.includes('persen') ||
                      searchStr.includes('nominal') ||
                      searchStr.includes('cost') ||
                      searchStr.includes('piutang') ||
                      searchStr.includes('utang');

    const isAgeOrRange = searchStr.includes('age') || searchStr.includes('range');
    if (isAgeOrRange) {
        let clean = val.replace(/[^0-9]/g, '');
        clean = clean.replace(/^0+/, '');
        return clean;
    }

    if (isNumeric) {
        // Allow only digits and a single decimal point (no negative values)
        let clean = val.replace(/[^0-9.]/g, '');
        // Ensure only one decimal point
        const parts = clean.split('.');
        if (parts.length > 2) {
            clean = parts[0] + '.' + parts.slice(1).join('');
        }
        // Remove leading zeros if not followed by a decimal point (e.g., "05" -> "5")
        if (clean.length > 1 && clean.startsWith('0') && clean[1] !== '.') {
            clean = clean.replace(/^0+/, '');
        }
        return clean;
    }

    return val;
}

export default function TextInput({
    id,
    type = 'text',
    placeholder = '',
    prefix = null,
    trailing = null,
    error = '',
    message = '',
    disabled = false,
    className = '',
    containerClassName = '',
    prefixClassName = '',
    inputClassName = '',
    trailingClassName = '',
    messageClassName = '',
    readOnly = false,
    interactiveReadOnly = false,
    tabIndex,
    onChange,
    value,
    defaultValue,
    ...props
}) {
    const inputRef = useRef(null);
    const [localValue, setLocalValue] = useState(value ?? defaultValue ?? '');
    const { errorMessage: contextErrorMessage, contextKey, clearError } = useFormError(error, props.name, id);

    useEffect(() => {
        if (value !== undefined) {
            setLocalValue(value ?? '');
        }
    }, [value]);

    const resolvedError = contextErrorMessage || (typeof error === 'boolean' ? error : '');
    const feedbackMessage = contextErrorMessage || (typeof error === 'string' ? (error || message) : message);
    const isNonInteractive = disabled || (readOnly && !interactiveReadOnly);
    const toneClassName = resolvedError
        ? isNonInteractive
            ? 'border-[#e39191]'
            : 'border-[#e39191] focus-within:border-[#d65959] focus-within:shadow-[0_0_0_3px_rgba(214,89,89,0.14)]'
        : isNonInteractive
            ? 'border-slate-300'
            : 'border-slate-300 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';
    const disabledClassName = isNonInteractive ? 'bg-slate-100 text-slate-400' : 'bg-white';

    const resolvedType = type === 'number' ? 'text' : type;
    const resolvedInputMode = props.inputMode ?? (type === 'number' ? 'decimal' : undefined);

    function handleWrappedChange(event) {
        const originalValue = event.target.value;
        const name = props.name ?? '';
        const sanitizedValue = sanitizeInput(originalValue, type, id, name, placeholder);
        
        if (originalValue !== sanitizedValue) {
            event.target.value = sanitizedValue;
        }
        setLocalValue(event.target.value);
        clearError(contextKey);
        if (onChange) {
            onChange(event);
        }
    }

    function handleWrappedBlur(event) {
        if (readOnly || disabled) {
            props.onBlur?.(event);
            return;
        }

        let val = event.target.value;
        const name = props.name ?? '';
        const searchStr = `${id} ${name} ${placeholder}`.toLowerCase();
        
        const isNumeric = type === 'number' || 
                          searchStr.includes('price') || 
                          searchStr.includes('amount') || 
                          searchStr.includes('percentage') || 
                          searchStr.includes('rate') || 
                          searchStr.includes('limit') || 
                          searchStr.includes('age') || 
                          searchStr.includes('days') || 
                          searchStr.includes('qty') || 
                          searchStr.includes('quantity') || 
                          searchStr.includes('value') ||
                          searchStr.includes('kurs') ||
                          searchStr.includes('jumlah') ||
                          searchStr.includes('persen') ||
                          searchStr.includes('nominal') ||
                          searchStr.includes('cost') ||
                          searchStr.includes('piutang') ||
                          searchStr.includes('utang');

        if (isNumeric) {
            const numVal = parseFloat(val);
            if (val === '0' || numVal === 0) {
                event.target.value = '';
                setLocalValue('');
                onChange?.(event);
            }
        }
        props.onBlur?.(event);
    }

    function focusInputFromWrapper(event) {
        if (isNonInteractive) {
            return;
        }

        const target = event.target;

        if (
            target instanceof HTMLElement &&
            (target.closest('input, button, a, select, textarea, [role="button"]') !== null)
        ) {
            return;
        }

        inputRef.current?.focus();
    }

    const hasWidth = containerClassName.includes('w-');
    const widthClass = hasWidth ? '' : 'w-full';

    return (
        <div className={`${widthClass} ${containerClassName}`.trim()}>
            <div
                onMouseDown={focusInputFromWrapper}
                className={`group flex h-11 w-full items-center overflow-hidden rounded-md border transition-[border-color,box-shadow] duration-150 ${toneClassName} ${disabledClassName} ${className}`.trim()}
            >
                {prefix ? (
                    <span
                        className={`flex h-full min-w-[86px] items-center border-r border-slate-300 px-5 text-[15px] text-[#5a84e5] transition-colors duration-150 group-focus-within:border-current ${disabled ? 'bg-slate-100 text-slate-400' : ''} ${prefixClassName}`.trim()}
                    >
                        {prefix}
                    </span>
                ) : null}

                <input
                    ref={inputRef}
                    id={id}
                    type={resolvedType}
                    inputMode={resolvedInputMode}
                    placeholder={placeholder}
                    value={localValue}
                    disabled={disabled}
                    readOnly={readOnly}
                    tabIndex={readOnly && !interactiveReadOnly ? -1 : tabIndex}
                    aria-invalid={Boolean(resolvedError)}
                    className={`h-full flex-1 ${inputClassName.includes('px-') || inputClassName.includes('pl-') ? '' : 'px-4'} text-sm outline-none placeholder:text-slate-300 ${isNonInteractive ? 'cursor-default bg-slate-100 text-slate-400 pointer-events-none' : 'text-slate-700'} ${inputClassName}`.trim()}
                    onChange={handleWrappedChange}
                    onBlur={handleWrappedBlur}
                    {...props}
                />

                {trailing || (onChange && !disabled && !readOnly && localValue !== undefined && localValue !== null && localValue !== '') ? (
                    <span
                        className={`flex h-full items-center px-3 transition-colors duration-150 ${isNonInteractive ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-[var(--color-input-focus)]'} ${trailingClassName}`.trim()}
                    >
                        {trailing ?? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (inputRef.current) {
                                        inputRef.current.value = '';
                                        inputRef.current.focus();
                                    }
                                    setLocalValue('');
                                    onChange?.({
                                        target: {
                                            id: id ?? '',
                                            name: props.name ?? '',
                                            value: '',
                                        },
                                    });
                                }}
                                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
                                aria-label="Hapus"
                            >
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </span>
                ) : null}
            </div>

            {feedbackMessage ? (
                <p className={`mt-1.5 text-[13px] leading-5 ${resolvedError ? 'text-[#d65959]' : 'text-slate-500'} ${messageClassName}`.trim()}>
                    {feedbackMessage}
                </p>
            ) : null}
        </div>
    );
}
