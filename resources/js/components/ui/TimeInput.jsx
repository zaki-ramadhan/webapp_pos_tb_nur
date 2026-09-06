import { useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import TextInput from '@/components/ui/TextInput';
import PortalDropdown from '@/components/ui/PortalDropdown';
import TimeGrid from '@/components/ui/TimeGrid';

export default function TimeInput({
    id,
    value = '00',
    onChange,
    disabled = false,
    className = '',
    inputClassName = 'text-xs sm:text-sm text-brand-dark font-medium',
    ariaLabel = 'Pilih jam',
    ...props
}) {
    const wrapperRef = useRef(null);
    const [open, setOpen] = useState(false);

    const normalizedValue = value ? String(value).split(':')[0].padStart(2, '0') : '00';
    const displayValue = `${normalizedValue}:00`;

    const handleSelect = (nextHour) => {
        onChange?.(nextHour);
        setOpen(false);
    };

    return (
        <>
            <div ref={wrapperRef} className={`relative inline-block w-[96px] ${className}`.trim()}>
                <TextInput
                    value={displayValue}
                    readOnly
                    interactiveReadOnly
                    disabled={disabled}
                    trailing={<Clock className="h-3.5 w-3.5 text-slate-500" />}
                    className="h-[38px] rounded-[4px] border-ui-border bg-white shadow-2xs"
                    inputClassName={`cursor-pointer ${inputClassName}`.trim()}
                    trailingClassName="pointer-events-none w-[30px] shrink-0 justify-center px-0"
                    {...props}
                />
                <button
                    id={id}
                    type="button"
                    onClick={() => !disabled && setOpen((prev) => !prev)}
                    disabled={disabled}
                    aria-label={ariaLabel}
                    aria-expanded={open}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer rounded-[4px] disabled:cursor-not-allowed"
                >
                    <span className="sr-only">{ariaLabel}</span>
                </button>
            </div>

            <PortalDropdown
                open={open}
                onClose={() => setOpen(false)}
                anchorRef={wrapperRef}
                align="start"
                side="auto"
                minHeightNeeded={250}
                maxHeightLimit={340}
                className="border border-slate-300 rounded-[8px] shadow-md bg-white overflow-hidden p-3 w-[285px]"
            >
                <div className="flex flex-col gap-2.5">
                    <div className="px-1 pb-1.5 border-b border-slate-200">
                        <span className="text-xs sm:text-[13px] font-medium text-slate-700">Pilih Jam (24 Jam)</span>
                    </div>
                    <TimeGrid
                        value={normalizedValue}
                        onChange={handleSelect}
                        allowDeselect={false}
                        disabled={disabled}
                        columns="grid-cols-4"
                    />
                </div>
            </PortalDropdown>
        </>
    );
}
