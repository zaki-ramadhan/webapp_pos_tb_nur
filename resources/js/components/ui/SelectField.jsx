import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import PortalDropdown from './PortalDropdown';
import { useFormError } from './FormErrorContext';

export default function SelectField({
    id,
    value,
    defaultValue,
    error = '',
    message = '',
    disabled = false,
    className = '',
    containerClassName = '',
    selectClassName = '',
    iconClassName = '',
    messageClassName = '',
    children,
    onChange,
    placeholder = 'Pilih...',
    ...props
}) {
    const { errorMessage: contextErrorMessage, contextKey, clearError } = useFormError(error, props.name, id);
    const resolvedError = contextErrorMessage || (typeof error === 'boolean' ? error : '');
    const feedbackMessage = contextErrorMessage || (typeof error === 'string' ? (error || message) : message);
    const resolvedContainerClassName = containerClassName || 'w-full';
    
    const toneClassName = resolvedError
        ? 'border-[#e39191] focus-within:border-[#d65959] focus-within:shadow-[0_0_0_3px_rgba(214,89,89,0.14)]'
        : 'border-slate-400 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';

    const triggerRef = useRef(null);
    const listRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const isControlled = value !== undefined;
    const [localValue, setLocalValue] = useState(defaultValue ?? '');
    const currentValue = isControlled ? value : localValue;

    // Parse options from standard React children
    const options = useMemo(() => {
        const list = [];
        const traverse = (nodes) => {
            React.Children.forEach(nodes, (node) => {
                if (!node) return;
                
                if (React.isValidElement(node)) {
                    if (node.type === 'option') {
                        list.push({
                            value: node.props.value !== undefined ? String(node.props.value) : '',
                            label: node.props.children !== undefined 
                                ? (Array.isArray(node.props.children) ? node.props.children.join('') : String(node.props.children))
                                : (node.props.label || String(node.props.value || '')),
                            disabled: Boolean(node.props.disabled),
                        });
                    } else if (node.props && node.props.children) {
                        traverse(node.props.children);
                    }
                }
            });
        };
        traverse(children);
        return list;
    }, [children]);

    const selectedOption = useMemo(() => {
        return options.find((opt) => String(opt.value) === String(currentValue)) ?? null;
    }, [options, currentValue]);

    const displayLabel = selectedOption ? selectedOption.label : (currentValue || placeholder);

    // Keyboard selection highlight scroll tracking
    useEffect(() => {
        if (open && highlightedIndex >= 0 && listRef.current) {
            const activeEl = listRef.current.children[highlightedIndex];
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex, open]);

    // Reset keyboard selection highlighted index on open/close
    useEffect(() => {
        if (open) {
            const index = options.findIndex((opt) => String(opt.value) === String(currentValue));
            setHighlightedIndex(index >= 0 ? index : 0);
        } else {
            setHighlightedIndex(-1);
        }
    }, [open, currentValue, options]);

    function handleSelect(val) {
        if (!isControlled) {
            setLocalValue(val);
        }
        setOpen(false);
        triggerRef.current?.focus();

        const simulatedEvent = {
            target: {
                id,
                name: props.name,
                value: val,
            },
        };
        onChange?.(simulatedEvent);
        clearError(contextKey);
    }

    function handleKeyDown(event) {
        if (disabled) return;

        if (event.key === 'Escape') {
            setOpen(false);
            triggerRef.current?.focus();
            event.preventDefault();
        } else if (event.key === 'ArrowDown') {
            if (!open) {
                setOpen(true);
            } else {
                setHighlightedIndex((prev) => (prev + 1) % options.length);
            }
            event.preventDefault();
        } else if (event.key === 'ArrowUp') {
            if (!open) {
                setOpen(true);
            } else {
                setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
            }
            event.preventDefault();
        } else if (event.key === 'Enter' || event.key === ' ') {
            if (open) {
                if (highlightedIndex >= 0 && highlightedIndex < options.length) {
                    const option = options[highlightedIndex];
                    if (!option.disabled) {
                        handleSelect(option.value);
                    }
                }
                event.preventDefault();
            } else {
                setOpen(true);
                event.preventDefault();
            }
        }
    }

    return (
        <div className={`relative ${resolvedContainerClassName}`.trim()}>
            {/* Real select element hidden for testing frameworks / accessibility */}
            <select
                id={id ? `${id}-select` : undefined}
                name={props.name}
                value={currentValue}
                disabled={disabled}
                onChange={(e) => handleSelect(e.target.value)}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
            >
                {children}
            </select>

            <div
                className={`group flex h-11 w-full items-center overflow-hidden rounded-md border bg-white transition-[border-color,box-shadow] duration-150 ${toneClassName} ${disabled ? 'bg-slate-100' : ''} ${className}`.trim()}
            >
                <button
                    ref={triggerRef}
                    id={id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setOpen((o) => !o)}
                    onKeyDown={handleKeyDown}
                    className={`h-full w-full bg-transparent px-4 text-left text-xs sm:text-sm outline-none disabled:cursor-default disabled:pointer-events-none flex items-center justify-between ${disabled ? 'text-slate-400' : 'text-slate-700'} ${selectClassName}`.trim()}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    {...props}
                >
                    <span className="truncate mr-2">
                        {displayLabel}
                    </span>
                    <ChevronDown
                        aria-hidden="true"
                        className={`h-4 w-4 shrink-0 transition-colors duration-150 ${disabled ? 'text-slate-300' : 'text-slate-300 group-focus-within:text-[var(--color-input-focus)]'} ${iconClassName}`.trim()}
                        strokeWidth={2.2}
                        absoluteStrokeWidth
                    />
                </button>
            </div>

            <PortalDropdown
                open={open && !disabled && options.length > 0}
                onClose={() => setOpen(false)}
                anchorRef={triggerRef}
                align="stretch"
                side="bottom"
                maxHeightLimit={260}
                className="py-1"
            >
                <div
                    ref={listRef}
                    role="listbox"
                    className="overflow-y-auto w-full flex-1 min-h-0"
                >
                    {options.map((option, index) => {
                        const isSelected = String(option.value) === String(currentValue);
                        const isHighlighted = index === highlightedIndex;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                disabled={option.disabled}
                                onClick={() => handleSelect(option.value)}
                                className={`block w-full px-4 py-2.5 text-left text-xs sm:text-sm transition-colors duration-100 ${
                                    isSelected 
                                        ? 'bg-[#eef3fb] font-semibold text-[#2353a0]' 
                                        : isHighlighted 
                                            ? 'bg-slate-50 text-slate-900 font-medium' 
                                            : 'text-slate-700 hover:bg-slate-50'
                                } ${option.disabled ? 'opacity-50 cursor-default pointer-events-none' : 'cursor-pointer'}`.trim()}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </PortalDropdown>

            {feedbackMessage ? (
                <p className={`mt-1.5 text-[11px] sm:text-xs leading-5 ${resolvedError ? 'text-[#d65959]' : 'text-slate-500'} ${messageClassName}`.trim()}>
                    {feedbackMessage}
                </p>
            ) : null}
        </div>
    );
}
