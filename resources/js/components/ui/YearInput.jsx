import { useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import PortalDropdown from '@/components/ui/PortalDropdown';

export default function YearInput({
    id,
    value,
    onChange,
    disabled = false,
    allowAll = true,
    allLabel = 'Semua Tahun',
    maxYear = new Date().getFullYear(),
    align = 'start',
    className = '',
    buttonClassName = '',
    ariaLabel = 'Pilih tahun',
    ...props
}) {
    const wrapperRef = useRef(null);
    const [open, setOpen] = useState(false);

    const currentYear = new Date().getFullYear();
    const effectiveMaxYear = maxYear !== null && maxYear !== undefined ? Number(maxYear) : null;
    const initialYear = value && value !== 'all' ? parseInt(value, 10) : currentYear;
    const [baseYear, setBaseYear] = useState(
        effectiveMaxYear !== null ? Math.min(initialYear, effectiveMaxYear) : initialYear
    );

    const handleOpen = () => {
        if (disabled) return;
        if (value && value !== 'all') {
            const parsed = parseInt(value, 10);
            setBaseYear(effectiveMaxYear !== null ? Math.min(parsed, effectiveMaxYear) : parsed);
        } else {
            setBaseYear(currentYear);
        }
        setOpen((prev) => !prev);
    };

    const displayValue = value === 'all' ? allLabel : (value ? String(value) : allLabel);

    const handleSelect = (year) => {
        if (effectiveMaxYear !== null && Number(year) > effectiveMaxYear) return;
        onChange?.(String(year));
        setOpen(false);
    };

    // Generate 9 years around baseYear
    const years = Array.from({ length: 9 }, (_, i) => baseYear - 7 + i);
    const canGoNext = effectiveMaxYear === null || (baseYear + 2) <= effectiveMaxYear;

    return (
        <>
            <div ref={wrapperRef} className={`relative inline-block w-fit ${className}`.trim()}>
                <button
                    id={id}
                    type="button"
                    onClick={handleOpen}
                    disabled={disabled}
                    aria-label={ariaLabel}
                    aria-expanded={open}
                    className={`inline-flex h-[36px] items-center justify-between gap-2 rounded-[4px] border border-ui-border bg-white px-2.5 sm:px-3 text-xs sm:text-sm text-brand-dark font-normal shadow-2xs hover:border-slate-400 focus:outline-hidden disabled:cursor-not-allowed disabled:bg-ui-bg-panel cursor-pointer ${buttonClassName}`.trim()}
                    {...props}
                >
                    <span className="whitespace-nowrap">{displayValue}</span>
                    <ChevronDown
                        aria-hidden="true"
                        className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
                    />
                </button>
            </div>

            <PortalDropdown
                open={open}
                onClose={() => setOpen(false)}
                anchorRef={wrapperRef}
                align={align}
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
                                if (!canGoNext) return;
                                setBaseYear((prev) => prev + 9);
                            }}
                            disabled={!canGoNext}
                            aria-label="Tahun berikutnya"
                            className={`p-1 rounded transition ${
                                canGoNext
                                    ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer'
                                    : 'text-slate-300 cursor-not-allowed'
                            }`}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    {allowAll && (
                        <button
                            type="button"
                            onClick={() => handleSelect('all')}
                            disabled={disabled}
                            className={`w-full py-1.5 px-2 rounded-[6px] text-xs sm:text-sm font-normal transition-colors cursor-pointer select-none text-center ${
                                String(value) === 'all'
                                    ? 'bg-brand-blue text-white font-normal shadow-2xs border border-brand-blue'
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
                            const isFuture = effectiveMaxYear !== null && yr > effectiveMaxYear;
                            const isYrDisabled = disabled || isFuture;

                            return (
                                <button
                                    key={strYear}
                                    type="button"
                                    onClick={() => handleSelect(strYear)}
                                    disabled={isYrDisabled}
                                    className={`inline-flex items-center justify-center rounded-[6px] py-2 px-1 text-xs sm:text-sm font-normal transition-colors select-none text-center focus:outline-hidden ${
                                        isYrDisabled
                                            ? 'opacity-35 cursor-not-allowed bg-slate-50 text-slate-400 border border-slate-200'
                                            : isSelected
                                                ? 'bg-brand-blue text-white font-normal shadow-2xs border border-brand-blue cursor-pointer'
                                                : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
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
