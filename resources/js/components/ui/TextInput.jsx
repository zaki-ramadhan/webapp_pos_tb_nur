import { useRef, useState, useEffect } from 'react';

import { useFormError } from './FormErrorContext';

function sanitizeInput(val, type, id = '', name = '', placeholder = '', prefix = '', lettersOnly = false) {
    const prefixStr = typeof prefix === 'string' ? prefix.toLowerCase() : '';
    const searchStr = `${id} ${name} ${placeholder} ${prefixStr}`.toLowerCase();
    
    // Lewati sanitasi untuk email/username
    if (
        searchStr.includes('email') || 
        searchStr.includes('username') || 
        searchStr.includes('identifier')
    ) {
        return val;
    }
    
    // Cek nomor telepon
    const isPhone = searchStr.includes('phone') || 
                    searchStr.includes('telp') || 
                    searchStr.includes('telepon') ||
                    searchStr.includes('whatsapp') || 
                    searchStr.includes('wa') || 
                    searchStr.includes('fax') || 
                    searchStr.includes('hp') || 
                    searchStr.includes('kontak') || 
                    searchStr.includes('contact');
                    
    // Cek jika kolom angka saja
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
                            searchStr.includes('k.pos') ||
                            searchStr.includes('kode pos') ||
                            /\bno\.?\b/.test(searchStr)
                        ) && !searchStr.includes('note') && !searchStr.includes('document');

    if (isPhone) {
        // Izinkan angka, spasi, plus, minus
        return val.replace(/[^0-9+\s-]/g, '');
    }

    if (isDigitOnly) {
        // Bersihkan selain angka
        let clean = val.replace(/[^0-9]/g, '');
        if (searchStr.includes('npwp')) {
            clean = clean.slice(0, 16);
            if (/^0+$/.test(clean) && clean.length === 16) {
                clean = '';
            }
        }
        if (
            searchStr.includes('postal') || 
            searchStr.includes('kodepos') || 
            searchStr.includes('zip') ||
            searchStr.includes('k.pos') ||
            searchStr.includes('kode pos')
        ) {
            clean = clean.slice(0, 5);
        }
        return clean;
    }

    // Cek jika kolom huruf saja
    const isLettersOnly = lettersOnly || 
                          (
                              (
                                  searchStr.includes('province') || 
                                  searchStr.includes('provinsi') || 
                                  searchStr.includes('country') || 
                                  searchStr.includes('negara') || 
                                  searchStr.includes('city') || 
                                  searchStr.includes('kota')
                              ) && !searchStr.includes('code') && !searchStr.includes('no')
                          );

    if (isLettersOnly) {
        // Izinkan huruf saja
        return val.replace(/[^a-zA-Z\s'.-]/g, '');
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
        // Izinkan angka desimal
        let clean = val.replace(/[^0-9.]/g, '');
        // Pastikan hanya satu desimal
        const parts = clean.split('.');
        if (parts.length > 2) {
            clean = parts[0] + '.' + parts.slice(1).join('');
        }
        // Hapus nol di depan
        if (clean.length > 1 && clean.startsWith('0') && clean[1] !== '.') {
            clean = clean.replace(/^0+/, '');
        }
        return clean;
    }

    return val;
}

function isClearOrCloseElement(element) {
    if (!element) return false;
    if (typeof element === 'object' && element.type) {
        const typeName = element.type.name || (element.type.render && element.type.render.name) || '';
        if (typeName === 'CloseIcon' || typeName === 'Close') {
            return true;
        }
        if (element.props) {
            if (element.props.className && element.props.className.includes('CloseIcon')) {
                return true;
            }
            if (element.props['aria-label'] && /close|clear|hapus/i.test(element.props['aria-label'])) {
                return true;
            }
            const children = element.props.children;
            if (typeof children === 'string' && (children === 'x' || children === '×')) {
                return true;
            }
        }
    }
    return false;
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
            ? 'border-slate-400'
            : 'border-slate-400 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';
    const disabledClassName = isNonInteractive ? 'bg-[#f5f5f5] text-gray-500' : 'bg-white';

    const resolvedType = type === 'number' ? 'text' : type;
    const resolvedInputMode = props.inputMode ?? (type === 'number' ? 'decimal' : undefined);

    function handleWrappedChange(event) {
        const originalValue = event.target.value;
        const name = props.name ?? '';
        const prefixVal = typeof prefix === 'string' ? prefix : '';
        const sanitizedValue = sanitizeInput(originalValue, type, id, name, placeholder, prefixVal, props.lettersOnly);
        
        if (originalValue !== sanitizedValue) {
            event.target.value = sanitizedValue;
        }
        setLocalValue(event.target.value);
        clearError(contextKey);
        if (onChange) {
            onChange(event);
        }
    }

    function handleWrappedKeyDown(event) {
        const name = props.name ?? '';
        const prefixVal = typeof prefix === 'string' ? prefix : '';
        const searchStr = `${id || ''} ${name} ${placeholder} ${prefixVal}`.toLowerCase();
        
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
                                searchStr.includes('k.pos') ||
                                searchStr.includes('kode pos') ||
                                /\bno\.?\b/.test(searchStr)
                            ) && !searchStr.includes('note') && !searchStr.includes('document');

        if (isNumeric || isDigitOnly) {
            const allowedKeys = [
                'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Escape', 'Enter', 'Home', 'End'
            ];

            if (event.ctrlKey || event.metaKey) {
                const key = event.key.toLowerCase();
                if (key === 'a' || key === 'c' || key === 'v' || key === 'x' || key === 'z') {
                    props.onKeyDown?.(event);
                    return;
                }
            }

            if (allowedKeys.includes(event.key)) {
                props.onKeyDown?.(event);
                return;
            }

            const isDigit = /^[0-9]$/.test(event.key);
            const isSeparator = event.key === '.' || event.key === ',';

            if (!isDigit && (!isNumeric || !isSeparator)) {
                event.preventDefault();
                return;
            }
        }

        props.onKeyDown?.(event);
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

    const hasPrefixMinW = prefixClassName.includes('min-w-');
    const prefixMinWClass = hasPrefixMinW ? '' : 'min-w-[86px]';
    const hasPrefixPx = prefixClassName.includes('px-') || prefixClassName.includes('pl-') || prefixClassName.includes('pr-');
    const prefixPxClass = hasPrefixPx ? '' : 'px-5';
    const hasPrefixColor = prefixClassName.includes('text-');
    const prefixColorClass = hasPrefixColor ? '' : 'text-slate-500';

    const name = props.name ?? '';
    const prefixStr = typeof prefix === 'string' ? prefix.toLowerCase() : '';
    const searchStr = `${id} ${name} ${placeholder} ${prefixStr}`.toLowerCase();
    const isPostal = searchStr.includes('postal') || 
                     searchStr.includes('kodepos') || 
                     searchStr.includes('zip') ||
                     searchStr.includes('k.pos') ||
                     searchStr.includes('kode pos');

    const resolvedMaxLength = props.maxLength ?? (isPostal ? 5 : undefined);
    const hasTrailingPx = trailingClassName.includes('px-') || trailingClassName.includes('pl-') || trailingClassName.includes('pr-');

    const isClearOrClose = isClearOrCloseElement(trailing);
    const showTrailing = trailing 
        ? !(isNonInteractive && isClearOrClose)
        : (onChange && !isNonInteractive && localValue !== undefined && localValue !== null && localValue !== '');

    return (
        <div className={`${widthClass} ${containerClassName}`.trim()}>
            <div
                onMouseDown={focusInputFromWrapper}
                className={`group flex h-11 w-full items-center overflow-hidden rounded-md border transition-[border-color,box-shadow] duration-150 ${toneClassName} ${disabledClassName} ${className}`.trim()}
            >
                {prefix ? (
                    <span
                        className={`flex h-full ${prefixMinWClass} items-center border-r border-slate-400 ${prefixPxClass} text-xs sm:text-sm ${prefixColorClass} transition-colors duration-150 group-focus-within:border-current ${disabled ? 'bg-[#f5f5f5] text-gray-500' : ''} ${prefixClassName}`.trim()}
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
                    className={`h-full flex-1 min-w-0 ${inputClassName.includes('px-') || inputClassName.includes('pl-') ? '' : showTrailing ? 'pl-4 pr-1' : 'px-4'} text-xs sm:text-sm outline-none placeholder:text-[#a1a8b7] ${isNonInteractive ? 'cursor-default bg-[#f5f5f5] text-gray-500 pointer-events-none' : 'text-slate-700'} ${inputClassName}`.trim()}
                    onChange={handleWrappedChange}
                    onBlur={handleWrappedBlur}
                    maxLength={resolvedMaxLength}
                    {...props}
                    onKeyDown={handleWrappedKeyDown}
                />

                {showTrailing ? (
                    <span
                        className={`flex h-full items-center ${hasTrailingPx ? '' : 'px-3'} transition-colors duration-150 ${isNonInteractive ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-[var(--color-input-focus)]'} ${trailingClassName}`.trim()}
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
                <p className={`mt-1.5 text-[11px] sm:text-xs leading-5 ${resolvedError ? 'text-[#d65959]' : 'text-slate-500'} ${messageClassName}`.trim()}>
                    {feedbackMessage}
                </p>
            ) : null}
        </div>
    );
}
