import { useRef, useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import AttachmentDockButton from '@/features/workspace/shared/AttachmentDockButton';
import { CogIcon } from '@/features/workspace/shared/Icons';

export function buildEmployeeFormValues(form) {
    return {
        ...form.defaults,
    };
}

export function matchesEmployeeFilter(row, filter, selectedValue) {
    if (!filter.rowKey || selectedValue === 'all') {
        return true;
    }

    return row[filter.rowKey] === selectedValue;
}

export function EmployeeFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-2.5 lg:grid-cols-[208px_minmax(0,1fr)] lg:items-center">
            <label className="text-[16px] text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

export function AttachmentSelectButton({ label = 'Lampiran' }) {
    return (
        <AttachmentDockButton
            label={label}
            items={[
                { id: 'add-attachment', label: 'Tambah Lampiran' },
                { id: 'manage-attachment', label: 'Kelola Lampiran' },
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

export function PrefixedTextArea({ value, onChange, prefix }) {
    return (
        <TextareaField
            value={value}
            onChange={onChange}
            prefix={prefix}
            rows={4}
            className="rounded-[4px] border-[#cfd6e2]"
            prefixClassName="min-w-[58px] border-[#cfd6e2] bg-[#f3f3f4] px-3 py-3 text-[14px] text-[#8b94a7]"
            textareaClassName="min-h-[76px] px-3 py-3 text-[15px] text-[#1f2436]"
        />
    );
}

export function PrefixedInput({ value, onChange, prefix, className = '' }) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            prefix={prefix}
            className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${className}`.trim()}
            prefixClassName="min-w-[62px] border-[#cfd6e2] bg-[#f3f3f4] px-3 text-[14px] text-[#8b94a7]"
            inputClassName="text-[15px] text-[#1f2436]"
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
            className={`inline-flex h-[34px] w-[48px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0] ${className}`.trim()}
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
                className="inline-flex h-[34px] w-[48px] items-center justify-center gap-1 rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
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
