import { useRef, useState } from 'react';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import { ChevronDownIcon } from '@/features/workspace/shared/Icons';

export default function CopyPermissionsButton({ label, options, onSelect }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((currentValue) => !currentValue)}
                className="inline-flex h-[42px] min-w-[138px] items-center justify-center gap-2 rounded-[6px] border border-chart-accent bg-white px-3.5 text-base font-medium text-blue-570 transition hover:bg-ui-bg-hover"
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
