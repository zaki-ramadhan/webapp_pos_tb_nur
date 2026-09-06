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
                minHeightNeeded={220}
                maxHeightLimit={300}
                className="border border-slate-200 rounded-[8px] shadow-xl bg-white overflow-hidden p-2.5 w-[260px]"
            >
                <div className="flex flex-col gap-2">
                    <div className="text-[11px] font-semibold text-slate-500 px-1 pb-1 border-b border-slate-100 flex items-center justify-between">
                        <span>Pilih Jam (24 Jam)</span>
                        <span className="font-mono text-brand-blue font-bold">{displayValue}</span>
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
