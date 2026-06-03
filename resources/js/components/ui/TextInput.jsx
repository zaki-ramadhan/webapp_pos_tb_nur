import { useRef } from 'react';

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
        return val.replace(/[^0-9]/g, '');
    }

    // Check if it's a numeric field
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
        // Allow only digits, a single decimal point, and optional single minus sign
        let clean = val.replace(/[^0-9.-]/g, '');
        // Ensure only one minus sign at the start
        if (clean.includes('-')) {
            const hasMinus = clean.startsWith('-');
            clean = clean.replace(/-/g, '');
            if (hasMinus) {
                clean = '-' + clean;
            }
        }
        // Ensure only one decimal point
        const parts = clean.split('.');
        if (parts.length > 2) {
            clean = parts[0] + '.' + parts.slice(1).join('');
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
    ...props
}) {
    const inputRef = useRef(null);
    const feedbackMessage = error || message;
    const isNonInteractive = disabled || (readOnly && !interactiveReadOnly);
    const toneClassName = error
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
        if (!onChange) {
            return;
        }
        const originalValue = event.target.value;
        const name = props.name ?? '';
        const sanitizedValue = sanitizeInput(originalValue, type, id, name, placeholder);
        
        if (originalValue !== sanitizedValue) {
            event.target.value = sanitizedValue;
        }
        onChange(event);
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

    return (
        <div className={`w-full ${containerClassName}`.trim()}>
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
                    disabled={disabled}
                    readOnly={readOnly}
                    tabIndex={readOnly && !interactiveReadOnly ? -1 : tabIndex}
                    aria-invalid={Boolean(error)}
                    className={`h-full flex-1 px-4 text-sm outline-none placeholder:text-slate-300 ${isNonInteractive ? 'cursor-default bg-slate-100 text-slate-400 pointer-events-none' : 'text-slate-700'} ${inputClassName}`.trim()}
                    onChange={handleWrappedChange}
                    {...props}
                />

                {trailing ? (
                    <span
                        className={`flex h-full items-center px-3 transition-colors duration-150 ${isNonInteractive ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-[var(--color-input-focus)]'} ${trailingClassName}`.trim()}
                    >
                        {trailing}
                    </span>
                ) : null}
            </div>

            {feedbackMessage ? (
                <p className={`mt-1.5 text-[13px] leading-5 ${error ? 'text-[#d65959]' : 'text-slate-500'} ${messageClassName}`.trim()}>
                    {feedbackMessage}
                </p>
            ) : null}
        </div>
    );
}
