import { useState } from 'react';
import { Clock, ArrowRight, Check, X, Sliders } from 'lucide-react';
import TimeGrid from '@/components/ui/TimeGrid';

const PRESETS = [
    { label: 'Jam Kerja (08:00 - 17:00)', start: '08', end: '17' },
    { label: 'Shift Pagi (07:00 - 15:00)', start: '07', end: '15' },
    { label: 'Shift Siang (12:00 - 20:00)', start: '12', end: '20' },
    { label: 'Full 24 Jam (00:00 - 23:00)', start: '00', end: '23' },
];

export default function GroupAccessTimePicker({
    startHour = '08',
    endHour = '17',
    onChangeStartHour,
    onChangeEndHour,
    disabled = false,
}) {
    const [isOpen, setIsOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('start'); // 'start' | 'end'
    const [format, setFormat] = useState('24h'); // '24h' | '12h'
    const [allowDeselect, setAllowDeselect] = useState(false);
    const [manualDisabled, setManualDisabled] = useState(false);

    const isEffectiveDisabled = disabled || manualDisabled;

    const startNum = parseInt(startHour, 10) || 0;
    const endNum = parseInt(endHour, 10) || 0;
    const duration = endNum >= startNum ? (endNum - startNum) : (24 - startNum + endNum);

    const handleApplyPreset = (s, e) => {
        if (isEffectiveDisabled) return;
        onChangeStartHour(s);
        onChangeEndHour(e);
    };

    const handleTimeChange = (newVal) => {
        // If allowDeselect is false and user clicked selected item (resulting in empty string), ignore it
        if (!allowDeselect && (!newVal || newVal === '')) {
            return;
        }

        if (activeTab === 'start') {
            onChangeStartHour(newVal || '00');
        } else {
            onChangeEndHour(newVal || '23');
        }
    };

    return (
        <div className="w-full max-w-[620px] flex flex-col gap-2.5">
            {/* Header Trigger Box */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3 shadow-xs">
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2.5 text-left cursor-pointer group focus:outline-hidden"
                >
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-brand-blue group-hover:bg-blue-100 transition">
                        <Clock className="h-4.5 w-4.5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                            <span>{startHour}:00</span>
                            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                            <span>{endHour}:00</span>
                            <span className="text-xs font-normal text-slate-400">WIB</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                            Durasi Operasional: <strong className="text-brand-blue">{duration} Jam Aktif</strong>
                        </span>
                    </div>
                </button>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsOpen((prev) => !prev)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                            isOpen
                                ? 'bg-slate-100 text-slate-700 border-slate-300'
                                : 'bg-brand-blue text-white border-brand-blue shadow-2xs hover:bg-brand-blue/90'
                        }`}
                    >
                        {isOpen ? 'Sembunyikan Grid' : 'Buka TimeGrid'}
                    </button>
                </div>
            </div>

            {/* Mantine-style TimeGrid Container */}
            {isOpen && (
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm animate-in fade-in duration-150">
                    {/* Mode & Configuration Controls (Persis Mantine TimeGrid) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                        {/* Selector Tab: Mulai vs Selesai */}
                        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/70">
                            <button
                                type="button"
                                onClick={() => setActiveTab('start')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                                    activeTab === 'start'
                                        ? 'bg-white text-brand-blue font-semibold shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-800'
                                }`}
                            >
                                <span className={`h-2 w-2 rounded-full ${activeTab === 'start' ? 'bg-brand-blue' : 'bg-slate-400'}`} />
                                Jam Mulai: <strong className="font-mono font-bold">{startHour}:00</strong>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('end')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                                    activeTab === 'end'
                                        ? 'bg-white text-brand-blue font-semibold shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-800'
                                }`}
                            >
                                <span className={`h-2 w-2 rounded-full ${activeTab === 'end' ? 'bg-brand-blue' : 'bg-slate-400'}`} />
                                Jam Selesai: <strong className="font-mono font-bold">{endHour}:00</strong>
                            </button>
                        </div>

                        {/* Format & Toggle Options */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Format: 12h vs 24h */}
                            <div className="inline-flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200/70 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setFormat('24h')}
                                    className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                                        format === '24h'
                                            ? 'bg-white text-slate-800 font-semibold shadow-2xs'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    24h
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormat('12h')}
                                    className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                                        format === '12h'
                                            ? 'bg-white text-slate-800 font-semibold shadow-2xs'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    12h
                                </button>
                            </div>

                            {/* Allow Deselect Toggle */}
                            <button
                                type="button"
                                onClick={() => setAllowDeselect((prev) => !prev)}
                                className={`px-2 py-1 rounded-md text-[11px] font-medium border transition cursor-pointer ${
                                    allowDeselect
                                        ? 'bg-blue-50 text-brand-blue border-blue-200'
                                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                }`}
                            >
                                Deselect: {allowDeselect ? 'On' : 'Off'}
                            </button>

                            {/* Disable / Enable Toggle */}
                            <button
                                type="button"
                                onClick={() => setManualDisabled((prev) => !prev)}
                                className={`px-2 py-1 rounded-md text-[11px] font-medium border transition cursor-pointer ${
                                    manualDisabled
                                        ? 'bg-red-50 text-red-600 border-red-200'
                                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                }`}
                            >
                                {manualDisabled ? 'Status: Disabled' : 'Status: Enabled'}
                            </button>
                        </div>
                    </div>

                    {/* Quick Operational Presets */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-medium text-slate-400 mr-1">Preset Jam Toko:</span>
                        {PRESETS.map((preset) => {
                            const isSelected = startHour === preset.start && endHour === preset.end;
                            return (
                                <button
                                    key={preset.label}
                                    type="button"
                                    disabled={isEffectiveDisabled}
                                    onClick={() => handleApplyPreset(preset.start, preset.end)}
                                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition cursor-pointer ${
                                        isSelected
                                            ? 'bg-brand-blue text-white shadow-2xs font-semibold'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50'
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Hint Label */}
                    <div className="text-xs text-slate-500 flex items-center justify-between">
                        <span>
                            Klik jam pada grid untuk mengubah{' '}
                            <strong className="text-brand-blue underline">
                                {activeTab === 'start' ? 'Jam Mulai' : 'Jam Selesai'}
                            </strong>
                            :
                        </span>
                        <span className="text-[11px] text-slate-400">
                            {format === '24h' ? '24 Slot Jam Lengkap' : 'Format 12 Jam AM/PM'}
                        </span>
                    </div>

                    {/* 24-Hour Mantine TimeGrid Component */}
                    <TimeGrid
                        value={activeTab === 'start' ? startHour : endHour}
                        onChange={handleTimeChange}
                        rangeStart={startHour}
                        rangeEnd={endHour}
                        allowDeselect={allowDeselect}
                        disabled={isEffectiveDisabled}
                        format={format}
                        columns="grid-cols-4 sm:grid-cols-6"
                    />

                    {/* Bottom Status Info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                            Area biru muda menandakan rentang jam akses yang aktif ({duration} Jam).
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-xs font-semibold text-brand-blue hover:underline cursor-pointer"
                        >
                            Selesai & Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
