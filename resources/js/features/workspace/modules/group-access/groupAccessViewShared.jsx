import { useRef, useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import {
    ChevronDownIcon,
    CloseIcon,
    InfoIcon,
    KebabIcon,
    SaveIcon,
    SearchIcon,
    TrashIcon,
} from '@/features/workspace/shared/Icons';

export function CopyPermissionsButton({ label, options, onSelect }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((currentValue) => !currentValue)}
                className="inline-flex h-[42px] min-w-[138px] items-center justify-center gap-2 rounded-[6px] border border-[#6da0e2] bg-white px-3.5 text-[15px] font-medium text-[#2a66b4] transition hover:bg-[#f7fbff]"
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
            className={`min-h-0 rounded-[8px] border border-[#d8dde7] bg-white p-3 shadow-[0_2px_12px_rgba(15,23,42,0.1)] ${className}`.trim()}
        >
            <div className={`h-full overflow-y-auto pr-1 ${scrollClassName}`.trim()}>
                <div className="space-y-2">
                    {categories.map((category) => {
                        const isActive = category.id === activeCategoryId;

                        return (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => onSelectCategory(category.id)}
                                className={`flex w-full items-center gap-3.5 rounded-[8px] px-4 py-3 text-left text-[17px] transition ${
                                    isActive
                                        ? 'bg-[#ED3969] text-white shadow-[0_2px_10px_rgba(237,57,105,0.18)]'
                                        : 'text-[#5e667d] hover:bg-[#f6f7fb]'
                                }`.trim()}
                            >
                                <NavigationIcon
                                    type={category.icon}
                                    className={`h-7 w-7 ${isActive ? 'text-white' : 'text-[#7f889f]'}`.trim()}
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

function resolveActionToneClass(action, disabled) {
    if (disabled) {
        return 'border-[#bcc2cc] bg-[#e7e7e8] text-[#9fa6b2] shadow-[0_5px_10px_rgba(15,23,42,0.14)]';
    }

    switch (action.tone) {
        case 'danger':
            return 'border-[#db808b] bg-[#f5b0b4] text-[#ee3f67] shadow-[0_5px_10px_rgba(120,46,58,0.18)]';
        case 'success':
            return 'border-[#43af5b] bg-[#99e19e] text-[#0b7a34] shadow-[0_5px_10px_rgba(24,102,49,0.18)]';
        case 'primary':
            return 'border-[#214d8d] bg-[#2d61ab] text-white shadow-[0_5px_10px_rgba(24,53,97,0.18)]';
        case 'muted':
        default:
            return 'border-[#214d8d] bg-[#2d61ab] text-white shadow-[0_5px_10px_rgba(24,53,97,0.18)]';
    }
}

function GroupAccessActionButton({ action, disabled = false, onClick }) {
    return (
        <button
            type="button"
            aria-label={action.label}
            title={action.label}
            disabled={disabled}
            onClick={onClick}
            className={`inline-flex h-[56px] w-[104px] items-center justify-center rounded-[8px] border transition ${resolveActionToneClass(
                action,
                disabled,
            )}`.trim()}
        >
            {action.icon === 'trash' ? (
                <TrashIcon className="h-9 w-9" />
            ) : action.icon === 'kebab' ? (
                <div className="inline-flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-current">
                        <KebabIcon className="h-3.5 w-3.5 text-current" />
                    </span>
                    {action.hasCaret ? <ChevronDownIcon className="h-4 w-4 text-current" /> : null}
                </div>
            ) : (
                <SaveIcon className="h-9 w-9" />
            )}
        </button>
    );
}

export function GroupAccessActionDock({ actions = [], isDirty, onSave, onDelete }) {
    if (!actions.length) {
        return null;
    }

    return (
        <div className="flex justify-start xl:justify-center">
            <div className="flex flex-col gap-3">
                {actions.map((action) => (
                    <GroupAccessActionButton
                        key={action.id}
                        action={action}
                        disabled={action.id === 'save' ? (!isDirty || Boolean(action.disabled)) : Boolean(action.disabled)}
                        onClick={
                            action.id === 'save'
                                ? onSave
                                : action.id === 'delete'
                                  ? onDelete
                                  : undefined
                        }
                    />
                ))}
            </div>
        </div>
    );
}

function GroupAccessAccessOption({ option, checked, onChange }) {
    return (
        <label className="inline-flex items-center gap-3 text-[17px] text-[#20273b]">
            <input
                type="radio"
                name="group-access-limitation"
                checked={checked}
                onChange={() => onChange(option.id)}
                className="h-5 w-5 border-[#c7d0df] text-[#0f65c9] focus:ring-[#5a84e5]/30"
            />
            <span className="inline-flex items-center gap-2">
                <span>{option.label}</span>
                {option.info ? <InfoIcon className="h-[18px] w-[18px] text-[#2f374d]" /> : null}
            </span>
        </label>
    );
}

function resolveSelectedUserKey(user, index) {
    if (user && typeof user === 'object') {
        return user.id ?? user.label ?? index;
    }

    return user ?? index;
}

function resolveSelectedUserLabel(user) {
    if (user && typeof user === 'object') {
        return user.label ?? user.name ?? '';
    }

    return String(user ?? '');
}

function GroupAccessUserLookupField({ field, selectedUsers, onRemoveUser, onSearchUser = null }) {
    return (
        <div className="flex min-h-[66px] w-full max-w-[880px] overflow-hidden rounded-[4px] border border-[#cfd6e2] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
            <div className="flex min-w-0 flex-1 flex-col gap-2 px-3 py-2.5">
                {selectedUsers.length ? (
                    <div className="flex flex-wrap items-center gap-2">
                        {selectedUsers.map((user, index) => (
                            <button
                                key={resolveSelectedUserKey(user, index)}
                                type="button"
                                onClick={() => onRemoveUser(user)}
                                className="inline-flex max-w-full items-center gap-2 rounded-[4px] border border-[#7ea8e6] bg-[#eaf3ff] px-2 py-1 text-[14px] text-[#24324a]"
                            >
                                <span className="truncate">{resolveSelectedUserLabel(user)}</span>
                                <CloseIcon className="h-3.5 w-3.5 shrink-0" />
                            </button>
                        ))}
                    </div>
                ) : null}

                <span className="text-[15px] text-[#a0a7b8]">{field.placeholder}</span>
            </div>

            <button
                type="button"
                onClick={onSearchUser}
                className="inline-flex w-12 items-center justify-center border-l border-[#d8dee8] text-[#1f2436]"
                aria-label={`Cari ${field.label}`}
                title={`Cari ${field.label}`}
            >
                <SearchIcon className="h-6 w-6 text-[#1f2436]" />
            </button>
        </div>
    );
}

export function GroupAccessGeneralSection({
    general,
    values,
    onChangeName,
    onChangeAccessLimitation,
    onRemoveUser,
    onSearchUser,
    textInput: TextInputComponent,
}) {
    return (
        <div>
            <div className="grid gap-y-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
                <label htmlFor={general.nameField?.id} className="pt-2 text-[17px] text-[#20273b]">
                    {general.nameField?.label} <span className="text-[#ED3969]">*</span>
                </label>
                <div className="max-w-[580px]">
                    <TextInputComponent
                        id={general.nameField?.id}
                        value={values.groupName}
                        onChange={(event) => onChangeName(event.target.value)}
                        trailing={
                            general.nameField?.clearable ? <CloseIcon className="h-[18px] w-[18px] text-[#2f374d]" /> : null
                        }
                        className="h-[40px] rounded-[4px] border-[#7fb0ee] shadow-[0_0_0_3px_rgba(127,176,238,0.12)]"
                        inputClassName="text-[17px] text-[#1f2436]"
                    />
                </div>

                <div className="pt-2 text-[17px] text-[#20273b]">{general.accessLimitations?.label}</div>
                <div className="flex flex-col gap-4 pt-1">
                    {(general.accessLimitations?.options ?? []).map((option) => (
                        <GroupAccessAccessOption
                            key={option.id}
                            option={option}
                            checked={values.accessLimitationId === option.id}
                            onChange={onChangeAccessLimitation}
                        />
                    ))}
                </div>

                <div className="pt-2 text-[17px] text-[#20273b]">{general.userSelection?.label}</div>
                <GroupAccessUserLookupField
                    field={general.userSelection}
                    selectedUsers={values.selectedUsers}
                    onRemoveUser={onRemoveUser}
                    onSearchUser={onSearchUser}
                />
            </div>
        </div>
    );
}
