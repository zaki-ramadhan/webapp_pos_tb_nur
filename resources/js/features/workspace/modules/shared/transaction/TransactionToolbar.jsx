import { useRef, useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import { ChevronDownIcon } from '@/features/workspace/shared/Icons';

export function TransactionToolbarIconButton({ label, children, className = '' }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className={`inline-flex h-[34px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0] ${className}`.trim()}
        >
            {children}
        </button>
    );
}

export function TransactionToolbarSplitButton({ label, icon, items = [] }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="inline-flex h-[34px] overflow-hidden rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
                aria-label={label}
                title={label}
            >
                <span className="inline-flex w-[36px] items-center justify-center">{icon}</span>
                <span className="inline-flex w-[28px] items-center justify-center border-l border-l-[#7aa2d5]">
                    <ChevronDownIcon className="h-4 w-4" />
                </span>
            </button>

            <DropdownMenu
                open={open}
                onClose={() => setOpen(false)}
                anchorRef={buttonRef}
                widthClassName="w-[180px]"
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
