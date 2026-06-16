import { useRef, useState } from 'react';
import Spinner from '@/components/ui/Spinner';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import {
    ChevronDownIcon,
    KebabIcon,
    SaveIcon,
    TrashIcon,
} from '@/features/workspace/shared/Icons';

export function resolveActionToneClass(action, disabled) {
    if (disabled) {
        return 'border-[#c8ccd4] bg-[#ececec] text-[#9aa0aa] shadow-none opacity-55 pointer-events-none cursor-default';
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

export function GroupAccessActionButton({ action, disabled = false, onClick }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);
    const isLoading = Boolean(action.loading);
    const hasMenu = Boolean(action.items?.length);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                aria-label={action.label}
                title={action.label}
                disabled={disabled || isLoading}
                onClick={() => {
                    if (disabled || isLoading) {
                        return;
                    }

                    if (hasMenu) {
                        setOpen((current) => !current);
                        return;
                    }

                    onClick?.();
                }}
                className={`inline-flex h-[56px] w-[104px] items-center justify-center rounded-[8px] border transition ${resolveActionToneClass(
                    action,
                    disabled || isLoading,
                )}`.trim()}
            >
                {isLoading ? (
                    <Spinner className="h-8 w-8 text-current" />
                ) : action.icon === 'trash' ? (
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

            {hasMenu ? (
                <DropdownMenu
                    open={open}
                    onClose={() => setOpen(false)}
                    anchorRef={buttonRef}
                    widthClassName="w-[180px]"
                >
                    <div className="flex flex-col">
                        {action.items.map((item) => (
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
            ) : null}
        </div>
    );
}

export function GroupAccessActionDock({ actions = [], isDirty, onSave, onDelete }) {
    if (!actions.length) {
        return null;
    }

    return (
        <div className="flex justify-start lg:justify-center">
            <div className="flex flex-row gap-3 lg:flex-col">
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
                                  : action.onClick
                        }
                    />
                ))}
            </div>
        </div>
    );
}

