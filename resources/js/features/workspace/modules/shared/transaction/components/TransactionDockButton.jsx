import React, { useState, useRef } from 'react';
import { Printer, FileText, Star } from 'lucide-react';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import { ChevronDownIcon } from '@/features/workspace/shared/Icons';
import { TransactionDockIcon } from './TransactionDockIcon';

function resolveDockToneClassName(tone, isDisabled = false) {
    if (isDisabled) {
        return 'border-disabled-border bg-tab-view-active-border-t text-disabled-border-t shadow-none';
    }
    switch (tone) {
        case 'muted':
            return 'border-border-input-compact bg-disabled-bg text-gray-a7abb4 shadow-dock-button-subtle';
        case 'blue':
        case 'secondary':
            return 'border-border-dock-blue-alt bg-bg-dock-blue-alt text-text-dock-blue-alt shadow-dock-blue';
        case 'success':
            return 'border-green-69cf7e bg-green-99e19e text-green-0b7a34 shadow-dock-green';
        case 'danger':
            return 'border-red-f08f92 bg-red-f5b0b4 text-red-e54854 shadow-dock-red';
        case 'primary':
        default:
            return 'border-brand-blue-darker bg-blue-0f62b8 text-white shadow-dock-default';
    }
}

function resolveDockDividerClassName(tone, isDisabled = false) {
    if (isDisabled) {
        return 'border-l-disabled-border';
    }
    switch (tone) {
        case 'blue':
        case 'secondary':
            return 'border-l-blue-5a9bdd';
        case 'success':
            return 'border-l-green-6bc57c';
        case 'muted':
            return 'border-l-tab-view-active-border-x';
        case 'danger':
            return 'border-l-red-f39ca0';
        case 'primary':
        default:
            return 'border-l-brand-blue-hover';
    }
}

export function TransactionDockButton({ action, templateLabel, favoritesStorageKey, onFallbackAction }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);
    const hasMenu = Boolean(action.items?.length);
    const isDisabled = Boolean(action.disabled);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                disabled={isDisabled}
                aria-disabled={isDisabled}
                aria-label={action.label}
                title={action.label}
                onClick={() => {
                    if (isDisabled) {
                        return;
                    }

                    if (hasMenu) {
                        setOpen((current) => !current);
                        return;
                    }

                    action.onClick?.();
                }}
                className={`inline-flex h-[44px] w-[72px] shrink-0 overflow-hidden rounded-[8px] border sm:h-[48px] sm:w-[80px] lg:h-[52px] lg:w-[88px] ${resolveDockToneClassName(action.tone, isDisabled)} ${isDisabled ? 'cursor-default opacity-55 pointer-events-none' : 'hover:brightness-105 active:brightness-95 cursor-pointer transition'}`.trim()}
            >
                <span className="inline-flex flex-1 items-center justify-center">
                    <TransactionDockIcon icon={action.icon} />
                </span>
                {hasMenu ? (
                    <span
                        className={`inline-flex w-[22px] items-center justify-center border-l sm:w-[26px] lg:w-[28px] ${resolveDockDividerClassName(action.tone, isDisabled)}`.trim()}
                    >
                        <ChevronDownIcon className="h-4 w-4" />
                    </span>
                ) : null}
            </button>

            {hasMenu ? (
                <DropdownMenu
                    open={open}
                    onClose={() => setOpen(false)}
                    anchorRef={buttonRef}
                    widthClassName="w-[200px]"
                >
                    <div className="flex flex-col">
                        {action.items.map((item) => {
                            const ItemIcon = item.icon === 'print'
                                ? Printer
                                : item.icon === 'document'
                                ? FileText
                                : item.icon === 'star'
                                ? Star
                                : null;
                            return (
                                <DropdownMenuItem
                                    key={item.id}
                                    onClick={() => {
                                        if (item.onClick) {
                                            item.onClick();
                                        } else {
                                            onFallbackAction(item, action);
                                        }
                                        setOpen(false);
                                    }}
                                >
                                    <span className="flex items-center gap-2">
                                        {ItemIcon ? <ItemIcon className="h-4 w-4 text-blue-475569" /> : null}
                                        <span>{item.label}</span>
                                    </span>
                                </DropdownMenuItem>
                            );
                        })}
                    </div>
                </DropdownMenu>
            ) : null}
        </div>
    );
}
