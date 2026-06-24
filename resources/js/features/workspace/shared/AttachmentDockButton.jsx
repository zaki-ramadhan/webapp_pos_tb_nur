import { useRef, useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import { ChevronDownIcon, PaperclipIcon } from '@/features/workspace/shared/Icons';

export default function AttachmentDockButton({
    label = 'Lampiran',
    items = [],
}) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                aria-label={label}
                title={label}
                onClick={() => setOpen((currentOpen) => !currentOpen)}
                className="inline-flex h-12 w-[80px] shrink-0 items-center justify-center gap-2 rounded-[8px] border border-border-dock-blue-alt bg-bg-dock-blue-alt text-text-dock-blue-alt shadow-attachment-dock sm:h-[52px] sm:w-[88px] md:h-[54px] md:w-[96px]"
            >
                <PaperclipIcon className="h-7 w-7" />
                <ChevronDownIcon className="h-5 w-5" />
            </button>

            {items.length ? (
                <DropdownMenu
                    open={open}
                    onClose={() => setOpen(false)}
                    anchorRef={buttonRef}
                    widthClassName="w-[min(180px,calc(100vw-1rem))]"
                >
                    <div className="flex flex-col">
                        {items.map((item) => (
                            <DropdownMenuItem
                                key={item.id}
                                icon={item.icon}
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
