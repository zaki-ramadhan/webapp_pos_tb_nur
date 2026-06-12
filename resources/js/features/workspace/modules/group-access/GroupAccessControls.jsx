import { useRef, useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { ChevronDownIcon } from '@/features/workspace/shared/Icons';

export function CopyPermissionsButton({ label, options, onSelect }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((currentValue) => !currentValue)}
                className="inline-flex h-[42px] min-w-[138px] items-center justify-center gap-2 rounded-[6px] border border-[#6da0e2] bg-white px-3.5 text-base font-medium text-[#2a66b4] transition hover:bg-[#f7fbff]"
            >
                <span>{label}</span>
                <ChevronDownIcon className="h-4 w-4" />
            </button>

            <DropdownMenu
                open={open}
                onClose={() => setOpen(false)}
                anchorRef={buttonRef}
                widthClassName="w-[220px]"
                panelClassName="p-1"
            >
                <div className="flex flex-col gap-1">
                    {options.map((option) => (
                        <DropdownMenuItem
                            key={option.id}
                            onClick={() => {
                                onSelect(option.id);
                                setOpen(false);
                            }}
                        >
                            {option.label}
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenu>
        </div>
    );
}

export function PermissionCell({ checked, onChange }) {
    return (
        <div className="flex items-center justify-center">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="h-[22px] w-[22px] rounded-[5px] border border-[#c9d0da] text-[#0f65c9] focus:ring-2 focus:ring-[#5a84e5]/25"
            />
        </div>
    );
}

export function GroupAccessCategoryList({
    categories,
    activeCategoryId,
    onSelectCategory,
    className = '',
    scrollClassName = '',
}) {
    return (
        <div
            className={`min-h-0 rounded-[8px] border border-[#d8dde7] bg-white p-2 shadow-[0_2px_12px_rgba(15,23,42,0.1)] ${className}`.trim()}
        >
            <div className={`h-full overflow-y-auto pr-1 ${scrollClassName}`.trim()}>
                <div className="space-y-1">
                    {categories.map((category) => {
                        const isActive = category.id === activeCategoryId;

                        return (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => onSelectCategory(category.id)}
                                className={`flex w-full items-center gap-2.5 rounded-[6px] px-3.5 py-2.5 text-left text-sm transition ${
                                    isActive
                                        ? 'bg-[#ED3969] text-white shadow-[0_2px_8px_rgba(237,57,105,0.18)]'
                                        : 'text-[#5e667d] hover:bg-[#f6f7fb]'
                                    }`.trim()}
                            >
                                <NavigationIcon
                                    type={category.icon}
                                    className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[#7f889f]'}`.trim()}
                                />
                                <span className={`${isActive ? 'font-medium' : 'font-normal'}`.trim()}>
                                    {category.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export function resolveSelectedUserKey(user, index) {
    if (user && typeof user === 'object') {
        return user.id ?? user.label ?? index;
    }

    return user ?? index;
}

export function resolveSelectedUserLabel(user) {
    if (user && typeof user === 'object') {
        return user.label ?? user.name ?? '';
    }

    return String(user ?? '');
}

export function GroupAccessUserLookupField({ field, selectedUsers, onAddUser, onRemoveUser }) {
    return (
        <div className="w-full max-w-[880px]">
            <BackendLookupField
                resource="users"
                values={selectedUsers}
                placeholder={field.placeholder}
                searchLabel={`Cari ${field.label}`}
                getOptionLabel={(option) => option.label ?? option.name ?? ''}
                onSelect={(user) => {
                    onAddUser({
                        id: user.id,
                        label: user.name ?? user.email ?? `Pengguna #${user.id}`,
                    });
                }}
                onRemove={onRemoveUser}
            />
        </div>
    );
}
