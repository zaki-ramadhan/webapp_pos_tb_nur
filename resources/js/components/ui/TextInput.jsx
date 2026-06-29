import { useRef, useState, useEffect } from 'react';

import { useFormError } from './FormErrorContext';
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';

function sanitizeInput(val, type, id = '', name = '', placeholder = '', prefix = '', lettersOnly = false) {
    if (typeof val === 'string' && val.startsWith(' ')) {
        val = val.trimStart();
    }
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

    // Cek jika kolom kode akun (account code)
    const isAccountCode = (searchStr.includes('account') || searchStr.includes('akun')) &&
                          (searchStr.includes('code') || searchStr.includes('kode'));
    if (isAccountCode) {
        return val.replace(/[^0-9.]/g, '');
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
                      searchStr.includes('utang') ||
                      searchStr.includes('years') ||
                      searchStr.includes('months') ||
                      searchStr.includes('tahun') ||
                      searchStr.includes('bulan') ||
                      searchStr.includes('hari') ||
                      searchStr.includes('umur');

    const isCurrency = searchStr.includes('price') ||
                       searchStr.includes('amount') ||
                       searchStr.includes('limit') ||
                       searchStr.includes('kurs') ||
                       searchStr.includes('jumlah') ||
                       searchStr.includes('nominal') ||
                       searchStr.includes('cost') ||
                       searchStr.includes('piutang') ||
                       searchStr.includes('utang') ||
                       searchStr.includes('nilai') ||
                       prefixStr === 'rp';

    if (isCurrency) {
        return formatAmountInput(val, { allowDecimal: true });
    }

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
    clearable = true,
    ...props
}) {
    const name = props.name ?? '';
    const prefixStr = typeof prefix === 'string' ? prefix.toLowerCase() : '';
    const searchStr = `${id || ''} ${name} ${placeholder} ${prefixStr}`.toLowerCase();

    const isPostal = searchStr.includes('postal') ||
                     searchStr.includes('kodepos') ||
                     searchStr.includes('zip') ||
                     searchStr.includes('k.pos') ||
                     searchStr.includes('kode pos');

    const isPhone = searchStr.includes('phone') ||
                    searchStr.includes('telp') ||
                    searchStr.includes('telepon') ||
                    searchStr.includes('whatsapp') ||
                    searchStr.includes('wa') ||
                    searchStr.includes('fax') ||
                    searchStr.includes('hp') ||
                    searchStr.includes('kontak') ||
                    searchStr.includes('contact');

    const isCurrency = searchStr.includes('price') ||
                       searchStr.includes('amount') ||
                       searchStr.includes('limit') ||
                       searchStr.includes('kurs') ||
                       searchStr.includes('jumlah') ||
                       searchStr.includes('nominal') ||
                       searchStr.includes('cost') ||
                       searchStr.includes('piutang') ||
                       searchStr.includes('utang') ||
                       searchStr.includes('nilai') ||
                       prefixStr === 'rp';

    const isCodeOrNumber = searchStr.includes('code') ||
                           searchStr.includes('kode') ||
                           searchStr.includes('number') ||
                           searchStr.includes('nomor') ||
                           searchStr.includes('no') ||
                           searchStr.includes('reference') ||
                           searchStr.includes('external') ||
                           searchStr.includes('sku') ||
                           searchStr.includes('npwp') ||
                           type === 'number';

    const defaultMaxLength = isPostal ? 10 : (isPhone ? 30 : (isCurrency ? 18 : (isCodeOrNumber ? 120 : 255)));
    const resolvedMaxLength = props.maxLength ?? defaultMaxLength;

    const inputRef = useRef(null);
    const [localValue, setLocalValue] = useState(() => {
        if (type === 'number') {
            return value ?? defaultValue ?? '0';
        }
        return value ?? defaultValue ?? '';
    });
    const { errorMessage: contextErrorMessage, contextKey, clearError } = useFormError(error, props.name, id);

    useEffect(() => {
        if (value !== undefined) {
            setLocalValue(value ?? '');
        }
    }, [value]);

    const resolvedError = contextErrorMessage || (typeof error === 'boolean' ? error : '');
    const feedbackMessage = contextErrorMessage || (typeof error === 'string' ? (error || message) : message);
    const hasHeightClass = className.split(' ').some(c => c.startsWith('h-') || c.startsWith('min-h-') || c.startsWith('max-h-'));
    const heightClass = hasHeightClass ? '' : 'h-11';
    const isNonInteractive = disabled || (readOnly && !interactiveReadOnly);
    const toneClassName = resolvedError
        ? isNonInteractive
            ? 'border-red-150'
            : 'border-red-150 focus-within:border-error-border focus-within:shadow-input-error-focus'
        : isNonInteractive
            ? 'border-slate-400'
            : 'border-slate-400 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';
    const disabledClassName = isNonInteractive ? 'bg-ui-bg-panel text-gray-500' : 'bg-white';

    const resolvedType = type === 'number' ? 'text' : type;
    const resolvedInputMode = props.inputMode ?? (type === 'number' ? 'decimal' : undefined);
    const resolvedMin = type === 'number' ? 0 : undefined;

    function handleWrappedChange(event) {
        let originalValue = event.target.value;
        if (resolvedMaxLength && originalValue.length > resolvedMaxLength) {
            originalValue = originalValue.slice(0, resolvedMaxLength);
        }
        const name = props.name ?? '';
        const prefixVal = typeof prefix === 'string' ? prefix : '';
        const sanitizedValue = sanitizeInput(originalValue, type, id, name, placeholder, prefixVal, props.lettersOnly);

        if (event.target.value !== sanitizedValue) {
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
                          searchStr.includes('utang') ||
                          searchStr.includes('years') ||
                          searchStr.includes('months') ||
                          searchStr.includes('tahun') ||
                          searchStr.includes('bulan') ||
                          searchStr.includes('hari') ||
                          searchStr.includes('umur');

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

        const isAccountCode = (searchStr.includes('account') || searchStr.includes('akun')) &&
                              (searchStr.includes('code') || searchStr.includes('kode'));

        if (isNumeric || isDigitOnly || isAccountCode) {
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
            const isAllowedSeparator = isAccountCode ? event.key === '.' : isSeparator;

            if (!isDigit && (!isNumeric || !isSeparator) && (!isAccountCode || !isAllowedSeparator)) {
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
                          searchStr.includes('utang') ||
                          searchStr.includes('years') ||
                          searchStr.includes('months') ||
                          searchStr.includes('tahun') ||
                          searchStr.includes('bulan') ||
                          searchStr.includes('hari') ||
                          searchStr.includes('umur');

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

    const hasWidth = containerClassName.includes('w-') || className.includes('w-') || props.style?.width;
    const widthClass = hasWidth ? '' : 'w-full';

    const isCurrencyPrefix = prefixStr === 'rp';
    const hasPrefixMinW = prefixClassName.includes('min-w-');
    const prefixMinWClass = hasPrefixMinW ? '' : (isCurrencyPrefix ? 'min-w-0 justify-center' : 'min-w-[86px]');
    const hasPrefixPx = prefixClassName.includes('px-') || prefixClassName.includes('pl-') || prefixClassName.includes('pr-');
    const prefixPxClass = hasPrefixPx ? '' : (isCurrencyPrefix ? 'px-3' : 'px-5');
    const hasPrefixColor = prefixClassName.includes('text-');
    const prefixColorClass = hasPrefixColor ? '' : 'text-slate-500';

    const hasTrailingPx = trailingClassName.includes('px-') || trailingClassName.includes('pl-') || trailingClassName.includes('pr-');

    const isClearOrClose = isClearOrCloseElement(trailing);
    const showTrailing = trailing
        ? !(isNonInteractive && isClearOrClose)
        : (clearable && onChange && !isNonInteractive && localValue !== undefined && localValue !== null && localValue !== '');

    const computedStyle = { ...props.style };
    if (!hasWidth && resolvedMaxLength) {
        const prefixWidth = prefix ? (typeof prefix === 'string' ? prefix.length + 2 : 5) : 0;
        const trailingWidth = showTrailing ? 3 : 2;
        const totalCh = resolvedMaxLength + prefixWidth + trailingWidth + 2;
        computedStyle.maxWidth = `${totalCh}ch`;
    }

    return (
        <div className={`${widthClass} ${containerClassName}`.trim()} style={computedStyle}>
            <div
                onMouseDown={focusInputFromWrapper}
                className={`group flex ${heightClass} w-full items-center overflow-hidden rounded-md border transition-[border-color,box-shadow] duration-150 ${toneClassName} ${disabledClassName} ${className}`.trim()}
            >
                {prefix ? (
                    <span
                        className={`flex h-full ${prefixMinWClass} items-center border-r border-slate-400 ${prefixPxClass} text-xs sm:text-sm ${prefixColorClass} transition-colors duration-150 group-focus-within:border-current ${disabled ? 'bg-ui-bg-panel text-gray-500' : ''} ${prefixClassName}`.trim()}
                    >
                        {prefix}
                    </span>
                ) : null}

                <input
                    ref={inputRef}
                    {...props}
                    id={id}
                    type={resolvedType}
                    inputMode={resolvedInputMode}
                    placeholder={placeholder}
                    value={localValue}
                    disabled={disabled}
                    readOnly={readOnly}
                    tabIndex={readOnly && !interactiveReadOnly ? -1 : tabIndex}
                    aria-invalid={Boolean(resolvedError)}
                    className={`h-full flex-1 min-w-0 ${inputClassName.includes('px-') || inputClassName.includes('pl-') ? '' : showTrailing ? 'pl-4 pr-1' : 'px-4'} text-xs sm:text-sm outline-none placeholder:text-disabled-border-t ${isNonInteractive ? 'cursor-default bg-ui-bg-panel text-gray-500 pointer-events-none' : 'text-slate-700'} ${inputClassName}`.trim()}
                    onChange={handleWrappedChange}
                    onBlur={handleWrappedBlur}
                    maxLength={resolvedMaxLength}
                    min={resolvedMin}
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
                <p className={`mt-1.5 text-[11px] sm:text-xs leading-5 ${resolvedError ? 'text-error-border' : 'text-slate-500'} ${messageClassName}`.trim()}>
                    {feedbackMessage}
                </p>
            ) : null}
        </div>
    );
}
