import React, { useState, useRef } from 'react';
import { Printer, FileText, Star } from 'lucide-react';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import { ChevronDownIcon } from '@/features/workspace/shared/Icons';
import { TransactionDockIcon } from './TransactionDockIcon';

function resolveDockToneClassName(tone, isDisabled = false) {
    if (isDisabled) {
        return 'border-[#c8ccd4] bg-[#ececec] text-[#9aa0aa] shadow-none';
    }
    switch (tone) {
        case 'muted':
            return 'border-[#d3d7df] bg-[#e8e8e9] text-[#a7abb4] shadow-[0_2px_5px_rgba(15,23,42,0.08)]';
        case 'blue':
        case 'secondary':
            return 'border-[#4d94dd] bg-[#8fc0ef] text-[#0d4e96] shadow-[0_4px_8px_rgba(20,75,138,0.18)]';
        case 'success':
            return 'border-[#69cf7e] bg-[#9de29b] text-[#0b7b34] shadow-[0_4px_8px_rgba(27,104,53,0.16)]';
        case 'danger':
            return 'border-[#f08f92] bg-[#ffb2b5] text-[#e54854] shadow-[0_4px_8px_rgba(135,43,52,0.15)]';
        case 'primary':
        default:
            return 'border-[#214d8d] bg-[#0f62b8] text-white shadow-[0_4px_8px_rgba(24,53,97,0.22)]';
    }
}

function resolveDockDividerClassName(tone, isDisabled = false) {
    if (isDisabled) {
        return 'border-l-[#c8ccd4]';
    }
    switch (tone) {
        case 'blue':
        case 'secondary':
            return 'border-l-[#5a9bdd]';
        case 'success':
            return 'border-l-[#6bc57c]';
        case 'muted':
            return 'border-l-[#d0d4db]';
        case 'danger':
            return 'border-l-[#f39ca0]';
        case 'primary':
        default:
            return 'border-l-[#1a4f95]';
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
                                        {ItemIcon ? <ItemIcon className="h-4 w-4 text-[#475569]" /> : null}
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
