import { useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import TextInput from '@/components/ui/TextInput';
import PortalDropdown from '@/components/ui/PortalDropdown';

export default function YearInput({
    id,
    value,
    onChange,
    disabled = false,
    allowAll = true,
    allLabel = 'Semua Tahun',
    className = '',
    inputClassName = 'text-xs sm:text-sm text-brand-dark font-normal',
    ariaLabel = 'Pilih tahun',
    ...props
}) {
    const wrapperRef = useRef(null);
    const [open, setOpen] = useState(false);

    const currentYear = new Date().getFullYear();
    const initialYear = value && value !== 'all' ? parseInt(value, 10) : currentYear;
    const [baseYear, setBaseYear] = useState(initialYear);

    const handleOpen = () => {
        if (disabled) return;
        if (value && value !== 'all') {
            setBaseYear(parseInt(value, 10));
        } else {
            setBaseYear(currentYear);
        }
        setOpen((prev) => !prev);
    };

    const displayValue = value === 'all' ? allLabel : (value ? String(value) : allLabel);

    const handleSelect = (year) => {
        onChange?.(String(year));
        setOpen(false);
    };

    // Generate 9 years around baseYear
    const years = Array.from({ length: 9 }, (_, i) => baseYear - 7 + i);

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
                    onClick={handleOpen}
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
                minHeightNeeded={240}
                maxHeightLimit={340}
                className="border border-slate-300 rounded-[8px] shadow-md bg-white overflow-hidden p-3 w-[260px]"
            >
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between px-1 pb-1.5 border-b border-slate-200">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setBaseYear((prev) => prev - 9);
                            }}
                            aria-label="Tahun sebelumnya"
                            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-xs sm:text-[13px] font-medium text-slate-700">Pilih Tahun</span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setBaseYear((prev) => prev + 9);
                            }}
                            aria-label="Tahun berikutnya"
                            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    {allowAll && (
                        <button
                            type="button"
                            onClick={() => handleSelect('all')}
                            disabled={disabled}
                            className={`w-full py-1.5 px-2 rounded-[6px] text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none text-center ${
                                String(value) === 'all'
                                    ? 'bg-brand-blue text-white font-semibold shadow-2xs border border-brand-blue'
                                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            {allLabel}
                        </button>
                    )}

                    <div className="grid grid-cols-3 gap-1.5">
                        {years.map((yr) => {
                            const strYear = String(yr);
                            const isSelected = String(value) === strYear;
                            return (
                                <button
                                    key={strYear}
                                    type="button"
                                    onClick={() => handleSelect(strYear)}
                                    disabled={disabled}
                                    className={`inline-flex items-center justify-center rounded-[6px] py-2 px-1 text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none text-center focus:outline-hidden ${
                                        isSelected
                                            ? 'bg-brand-blue text-white font-semibold shadow-2xs border border-brand-blue'
                                            : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    {strYear}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </PortalDropdown>
        </>
    );
}
