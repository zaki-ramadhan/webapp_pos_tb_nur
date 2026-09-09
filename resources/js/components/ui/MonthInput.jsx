import { useRef, useState } from 'react';
import { Calendar } from 'lucide-react';
import TextInput from '@/components/ui/TextInput';
import PortalDropdown from '@/components/ui/PortalDropdown';

export const INDONESIAN_MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function MonthInput({
    id,
    value,
    onChange,
    disabled = false,
    allowAll = true,
    allLabel = 'Semua Bulan',
    months = INDONESIAN_MONTHS,
    className = '',
    inputClassName = 'text-xs sm:text-sm text-brand-dark font-normal',
    ariaLabel = 'Pilih bulan',
    ...props
}) {
    const wrapperRef = useRef(null);
    const [open, setOpen] = useState(false);

    const displayValue = value === 'all' ? allLabel : (value || allLabel);

    const handleSelect = (month) => {
        onChange?.(month);
        setOpen(false);
    };

    return (
        <>
            <div ref={wrapperRef} className={`relative inline-block ${className}`.trim()}>
                <TextInput
                    value={displayValue}
                    readOnly
                    interactiveReadOnly
                    disabled={disabled}
                    trailing={<Calendar className="h-3.5 w-3.5 text-slate-500" />}
                    className="h-[36px] rounded-[4px] border-ui-border bg-white"
                    inputClassName={`cursor-pointer ${inputClassName}`.trim()}
                    trailingClassName="pointer-events-none w-[28px] shrink-0 justify-center px-0"
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
                minHeightNeeded={260}
                maxHeightLimit={360}
                className="border border-slate-300 rounded-[8px] shadow-md bg-white overflow-hidden p-3 w-[290px]"
            >
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between px-1 pb-1.5 border-b border-slate-200">
                        <span className="text-xs sm:text-[13px] font-medium text-slate-700">Pilih Bulan</span>
                    </div>

                    {allowAll && (
                        <button
                            type="button"
                            onClick={() => handleSelect('all')}
                            disabled={disabled}
                            className={`w-full py-1.5 px-2 rounded-[6px] text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none text-center ${
                                value === 'all'
                                    ? 'bg-brand-blue text-white font-semibold shadow-2xs border border-brand-blue'
                                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            {allLabel}
                        </button>
                    )}

                    <div className="grid grid-cols-3 gap-1.5">
                        {months.map((m) => {
                            const isSelected = value === m;
                            return (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => handleSelect(m)}
                                    disabled={disabled}
                                    className={`inline-flex items-center justify-center rounded-[6px] py-2 px-1 text-xs font-medium transition-colors cursor-pointer select-none text-center focus:outline-hidden ${
                                        isSelected
                                            ? 'bg-brand-blue text-white font-semibold shadow-2xs border border-brand-blue'
                                            : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    {m}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </PortalDropdown>
        </>
    );
}
