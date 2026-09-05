import { useMemo, useState } from 'react';
import {
    INDONESIAN_MONTHS,
    INDONESIAN_SHORT_MONTHS,
    INDONESIAN_WEEKDAYS,
    formatYmd,
    getCalendarGrid,
    getDefaultIndonesianPresets,
    isSameDay,
    parseDate,
} from './datePickerUtils';
import { ChevronLeftIcon, ChevronRightIcon } from '@/features/workspace/shared/Icons';

export default function DatePickerPopover({
    selectedDate,
    onSelect,
    onClose,
    minDate = null,
    maxDate = null,
    presets = true,
    clearable = false,
    onClear = null,
    className = '',
}) {
    const today = useMemo(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }, []);

    const initialDate = selectedDate ?? today;
    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
    const [viewMode, setViewMode] = useState('days'); // 'days' | 'months' | 'years'
    const [decadeStart, setDecadeStart] = useState(Math.floor(initialDate.getFullYear() / 10) * 10);

    const resolvedPresets = useMemo(() => {
        if (presets === false) return [];
        if (Array.isArray(presets)) {
            return presets.map((p) => ({
                label: p.label,
                getDate: typeof p.getValue === 'function' ? p.getValue : () => parseDate(p.value),
            }));
        }
        return getDefaultIndonesianPresets();
    }, [presets]);

    const calendarCells = useMemo(() => {
        return getCalendarGrid(viewYear, viewMonth, selectedDate, minDate, maxDate);
    }, [viewYear, viewMonth, selectedDate, minDate, maxDate]);

    function handlePrev() {
        if (viewMode === 'days') {
            if (viewMonth === 0) {
                setViewMonth(11);
                setViewYear((y) => y - 1);
            } else {
                setViewMonth((m) => m - 1);
            }
        } else if (viewMode === 'months') {
            setViewYear((y) => y - 1);
        } else if (viewMode === 'years') {
            setDecadeStart((d) => d - 10);
        }
    }

    function handleNext() {
        if (viewMode === 'days') {
            if (viewMonth === 11) {
                setViewMonth(0);
                setViewYear((y) => y + 1);
            } else {
                setViewMonth((m) => m + 1);
            }
        } else if (viewMode === 'months') {
            setViewYear((y) => y + 1);
        } else if (viewMode === 'years') {
            setDecadeStart((d) => d + 10);
        }
    }

    function handleDateClick(cell) {
        if (cell.isDisabled) return;
        if (!cell.isCurrentMonth) {
            setViewYear(cell.date.getFullYear());
            setViewMonth(cell.date.getMonth());
        }
        onSelect(cell.ymd);
    }

    function handlePresetClick(preset) {
        const date = preset.getDate();
        if (!date || isNaN(date.getTime())) return;
        setViewYear(date.getFullYear());
        setViewMonth(date.getMonth());
        const ymd = formatYmd(date);
        onSelect(ymd);
    }

    function handleSelectToday() {
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
        onSelect(formatYmd(today));
    }

    const headerTitle = useMemo(() => {
        if (viewMode === 'days') {
            return `${INDONESIAN_MONTHS[viewMonth]} ${viewYear}`;
        }
        if (viewMode === 'months') {
            return `${viewYear}`;
        }
        return `${decadeStart} - ${decadeStart + 11}`;
    }, [viewMode, viewMonth, viewYear, decadeStart]);

    function toggleViewMode() {
        if (viewMode === 'days') {
            setViewMode('months');
        } else if (viewMode === 'months') {
            setDecadeStart(Math.floor(viewYear / 10) * 10);
            setViewMode('years');
        } else {
            setViewMode('days');
        }
    }

    return (
        <div className={`flex flex-col bg-white text-slate-800 select-none ${className}`.trim()}>
            <div className="flex flex-col sm:flex-row">
                {/* Kolom Preset Pintasan di Kiri */}
                {resolvedPresets.length > 0 && (
                    <div className="w-full sm:w-40 shrink-0 bg-slate-50/90 border-b sm:border-b-0 sm:border-r border-slate-100 p-2.5 flex flex-row sm:flex-col gap-1 overflow-x-auto sm:overflow-x-visible">
                        {resolvedPresets.map((preset, idx) => {
                            const presetDate = preset.getDate();
                            const isSelected = selectedDate && presetDate && isSameDay(selectedDate, presetDate);

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handlePresetClick(preset)}
                                    className={`shrink-0 w-auto sm:w-full text-left px-3 py-2 text-[13px] text-slate-700 rounded-[6px] transition cursor-pointer ${
                                        isSelected
                                            ? 'bg-[#e8f2fc] font-medium border border-[#9dc2ec]'
                                            : 'hover:bg-slate-100/80 hover:text-slate-800 border border-transparent font-normal'
                                    }`.trim()}
                                >
                                    {preset.label}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Kolom Kalender di Kanan */}
                <div className="p-3.5 flex flex-col w-[300px] sm:w-[320px]">
                    {/* Header Kalender */}
                    <div className="flex items-center justify-between pb-2.5 mb-1">
                        <button
                            type="button"
                            onClick={handlePrev}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                            aria-label="Sebelumnya"
                        >
                            <ChevronLeftIcon className="h-4.5 w-4.5" />
                        </button>

                        <button
                            type="button"
                            onClick={toggleViewMode}
                            className="px-2.5 py-1 text-sm sm:text-[15px] font-bold text-slate-800 hover:bg-slate-100 rounded-[5px] transition cursor-pointer"
                        >
                            {headerTitle}
                        </button>

                        <button
                            type="button"
                            onClick={handleNext}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                            aria-label="Berikutnya"
                        >
                            <ChevronRightIcon className="h-4.5 w-4.5" />
                        </button>
                    </div>

                    {/* Mode Hari */}
                    {viewMode === 'days' && (
                        <>
                            {/* Hari dalam Seminggu */}
                            <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                                {INDONESIAN_WEEKDAYS.map((weekday, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs font-semibold text-slate-500 py-0.5 tracking-wide"
                                    >
                                        {weekday}
                                    </span>
                                ))}
                            </div>

                            {/* Kotak Tanggal */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarCells.map((cell, idx) => {
                                    const cellStyle = cell.isSelected
                                        ? 'bg-blue-570 text-white font-bold shadow-sm hover:bg-blue-600'
                                        : cell.isToday
                                          ? 'border border-blue-500 font-bold text-blue-600 hover:bg-blue-50'
                                          : cell.isCurrentMonth
                                            ? 'text-slate-800 font-medium hover:bg-slate-100 hover:text-blue-700'
                                            : 'text-slate-300 font-normal hover:bg-slate-50 hover:text-slate-500';

                                    const disabledStyle = cell.isDisabled
                                        ? 'opacity-25 cursor-not-allowed pointer-events-none'
                                        : 'cursor-pointer';

                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleDateClick(cell)}
                                            disabled={cell.isDisabled}
                                            className={`h-9 w-9 text-[13.5px] flex items-center justify-center rounded-[6px] transition ${cellStyle} ${disabledStyle}`.trim()}
                                            aria-label={cell.ymd}
                                        >
                                            {cell.dayNumber}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Mode Pemilih Bulan */}
                    {viewMode === 'months' && (
                        <div className="grid grid-cols-3 gap-2 py-2">
                            {INDONESIAN_SHORT_MONTHS.map((monthName, idx) => {
                                const isCurrent = viewMonth === idx && viewYear === initialDate.getFullYear();
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            setViewMonth(idx);
                                            setViewMode('days');
                                        }}
                                        className={`py-2.5 text-sm font-medium rounded-[6px] transition cursor-pointer ${
                                            isCurrent
                                                ? 'bg-blue-570 text-white font-semibold'
                                                : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700'
                                        }`.trim()}
                                    >
                                        {monthName}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Mode Pemilih Tahun */}
                    {viewMode === 'years' && (
                        <div className="grid grid-cols-3 gap-2 py-2">
                            {Array.from({ length: 12 }, (_, i) => decadeStart + i).map((year) => {
                                const isCurrent = viewYear === year;
                                return (
                                    <button
                                        key={year}
                                        type="button"
                                        onClick={() => {
                                            setViewYear(year);
                                            setViewMode('months');
                                        }}
                                        className={`py-2.5 text-sm font-medium rounded-[6px] transition cursor-pointer ${
                                            isCurrent
                                                ? 'bg-blue-570 text-white font-semibold'
                                                : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700'
                                        }`.trim()}
                                    >
                                        {year}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Aksi Bawah */}
            <div className="border-t border-slate-100 px-3.5 py-2.5 flex items-center justify-between bg-slate-50/50 text-[13px]">
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={handleSelectToday}
                        className="text-blue-600 hover:text-blue-800 font-semibold transition cursor-pointer"
                    >
                        Hari ini
                    </button>
                    {clearable && onClear && (
                        <>
                            <span className="text-slate-300">•</span>
                            <button
                                type="button"
                                onClick={onClear}
                                className="text-red-500 hover:text-red-700 font-semibold transition cursor-pointer"
                            >
                                Kosongkan
                            </button>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-700 font-medium transition cursor-pointer"
                >
                    Tutup
                </button>
            </div>
        </div>
    );
}
