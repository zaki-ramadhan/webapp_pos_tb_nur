import { useEffect, useMemo, useRef, useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import AttachmentDockButton from '@/features/workspace/shared/AttachmentDockButton';
import { showCrudSuccessToast } from '@/features/workspace/shared/crudFeedback';
import { CloseIcon, CogIcon, FileIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { LookupDropdownSurface, LookupEmptyState } from '@/features/workspace/shared/LookupPrimitives';

export function SuggestionTextInput({
    value = '',
    onChange,
    options = [],
    placeholder = 'Cari/Pilih...',
    searchLabel = 'Cari data',
    emptyLabel = 'Tidak ada data yang cocok.',
    className = 'h-[40px] rounded-[4px] border-[#cfd6e2]',
    inputClassName = 'text-xs sm:text-sm text-[#1f2436]',
    ...props
}) {
    const rootRef = useRef(null);
    const normalizedValue = String(value ?? '');
    const [open, setOpen] = useState(false);

    const filteredOptions = useMemo(() => {
        const keyword = normalizedValue.trim().toLowerCase();

        if (!keyword) {
            return [];
        }

        return options.filter((option) => String(option).toLowerCase().includes(keyword));
    }, [normalizedValue, options]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        function handlePointerDown(event) {
            const target = event.target;

            if (rootRef.current?.contains(target)) {
                return;
            }

            setOpen(false);
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    function handleInputFocus() {
        if (normalizedValue.trim()) {
            setOpen(true);
        }
    }

    function handleInputChange(nextValue) {
        onChange?.(nextValue);
        setOpen(Boolean(nextValue.trim()));
    }

    function handleSelect(option) {
        onChange?.(option);
        setOpen(false);
    }

    function handleClear() {
        onChange?.('');
        setOpen(false);
    }

    return (
        <div ref={rootRef} className="relative">
            <TextInput
                value={normalizedValue}
                onFocus={handleInputFocus}
                onChange={(event) => handleInputChange(event.target.value)}
                placeholder={placeholder}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                trailing={(
                    <div className="flex items-center gap-1">
                        {normalizedValue ? (
                            <button
                                type="button"
                                onClick={handleClear}
                                aria-label={`Hapus ${searchLabel.toLowerCase()}`}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-[4px] text-[#6b7280] transition hover:bg-[#eef3fb] hover:text-[#1f2436]"
                            >
                                <CloseIcon className="h-4 w-4" />
                            </button>
                        ) : null}
                        <SearchIcon className="h-5 w-5 text-[#1f2436]" />
                    </div>
                )}
                className={className}
                inputClassName={inputClassName}
                trailingClassName="gap-1 pr-2"
                {...props}
            />

            {open ? (
                <LookupDropdownSurface>
                    <div className="max-h-[240px] overflow-y-auto bg-white">
                        {filteredOptions.length ? (
                            filteredOptions.map((option) => {
                                const selected = option === normalizedValue;

                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`block w-full border-t border-[#e6ebf2] px-4 py-3 text-left text-sm text-[#1f2436] transition first:border-t-0 hover:bg-[#eef3fb] ${selected ? 'bg-[#f5f9ff] font-medium' : 'bg-white'}`.trim()}
                                    >
                                        {option}
                                    </button>
                                );
                            })
                        ) : (
                            <LookupEmptyState
                                title={emptyLabel}
                                description="Coba kata kunci lain yang lebih spesifik."
                            />
                        )}
                    </div>
                </LookupDropdownSurface>
            ) : null}
        </div>
    );
}

export function AttachmentSelectButton({ label = 'Lampiran', onOpen }) {
    return (
        <AttachmentDockButton
            label={label}
            items={[
                {
                    id: 'document',
                    label: 'Dokumen',
                    icon: <FileIcon className="h-4.5 w-4.5" />,
                    onClick: onOpen,
                },
            ]}
        />
    );
}

export function ToggleSwitch({ checked, onChange }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-[20px] w-[36px] shrink-0 items-center rounded-full transition-colors ${
                checked ? 'bg-[#3f68b2]' : 'bg-[#c7ceda]'
            }`}
        >
            <span
                className={`inline-block h-[16px] w-[16px] rounded-full bg-white shadow-sm transition-transform ${
                    checked ? 'translate-x-[18px]' : 'translate-x-[2px]'
                }`}
            />
        </button>
    );
}

export function PrefixedTextArea({ value, onChange, prefix, ...props }) {
    return (
        <TextareaField
            value={value}
            onChange={onChange}
            prefix={prefix}
            rows={4}
            className="rounded-[4px] border-[#cfd6e2]"
            prefixClassName="min-w-[58px] border-[#cfd6e2] bg-[#f3f3f4] px-3 py-3 text-xs sm:text-sm text-[#8b94a7]"
            textareaClassName="min-h-[76px] px-3 py-3 text-xs sm:text-sm text-[#1f2436]"
            {...props}
        />
    );
}

export function PrefixedInput({ value, onChange, prefix, className = '', ...props }) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            prefix={prefix}
            className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${className}`.trim()}
            prefixClassName="min-w-[62px] border-[#cfd6e2] bg-[#f3f3f4] px-3 text-xs sm:text-sm text-[#8b94a7]"
            inputClassName="text-xs sm:text-sm text-[#1f2436]"
            {...props}
        />
    );
}

export function ToolbarSquareButton({ label, onClick, className = '', children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className={`inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0] ${className}`.trim()}
        >
            {children}
        </button>
    );
}

export function TableActionMenu({ items = [], label = 'Aksi' }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                aria-label={label}
                onClick={() => setOpen((currentOpen) => !currentOpen)}
                className="inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center gap-1 rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
            >
                <CogIcon className="h-5 w-5" />
            </button>

            <DropdownMenu
                open={open}
                onClose={() => setOpen(false)}
                anchorRef={buttonRef}
                widthClassName="w-[190px]"
            >
                <div className="flex flex-col">
                    {items.map((item) => (
                        <DropdownMenuItem
                            key={item.id}
                            onClick={() => {
                                item.onClick?.();
                                setOpen(false);
                            }}
                        >
                            {item.label}
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenu>
        </div>
    );
}
