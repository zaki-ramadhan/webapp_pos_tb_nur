import { useRef, useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { ChevronDownIcon } from '@/features/workspace/shared/Icons';
import CheckboxField from '@/components/ui/CheckboxField';

export function CopyPermissionsButton({ label, options, onSelect }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((currentValue) => !currentValue)}
                className="inline-flex h-[42px] min-w-[138px] items-center justify-center gap-2 rounded-[6px] border border-chart-accent bg-white px-3.5 text-base font-medium text-blue-2d61ab transition hover:bg-ui-bg-hover"
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
            <CheckboxField
                id="permission"
                checked={checked}
                onChange={onChange}
                inputClassName="h-[22px] w-[22px] rounded-[5px] border-tab-view-active-border-x"
                containerClassName="w-auto flex items-center justify-center"
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
            className={`min-h-0 rounded-[8px] border border-ui-border-medium bg-white p-2 shadow-widget-hover ${className}`.trim()}
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
                                        ? 'bg-tab-active-border-t text-white shadow-tab-active-pink'
                                        : 'text-tab-inactive-text hover:bg-brand-blue-lightest'
                                    }`.trim()}
                            >
                                <NavigationIcon
                                    type={category.icon}
                                    className={`h-5 w-5 ${isActive ? 'text-white' : 'text-blue-7c839b'}`.trim()}
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
