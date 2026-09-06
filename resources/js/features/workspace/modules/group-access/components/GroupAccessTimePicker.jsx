import { useMemo, useState } from 'react';
import { Clock, ArrowRight, ChevronUp, ChevronDown, SlidersHorizontal, Layers, Timer, Check } from 'lucide-react';

const PRESETS = [
    { label: 'Jam Kerja (08:00 - 17:00)', start: '08', end: '17' },
    { label: 'Shift Pagi (07:00 - 15:00)', start: '07', end: '15' },
    { label: 'Shift Siang (12:00 - 20:00)', start: '12', end: '20' },
    { label: 'Full 24 Jam (00:00 - 23:00)', start: '00', end: '23' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

export default function GroupAccessTimePicker({
    startHour = '08',
    endHour = '17',
    onChangeStartHour,
    onChangeEndHour,
}) {
    const [selectedConcept, setSelectedConcept] = useState('concept1');
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const startNum = parseInt(startHour, 10) || 0;
    const endNum = parseInt(endHour, 10) || 0;
    const duration = endNum >= startNum ? (endNum - startNum) : (24 - startNum + endNum);

    const handleApplyPreset = (s, e) => {
        onChangeStartHour(s);
        onChangeEndHour(e);
    };

    const stepHour = (currentHour, delta, onChange) => {
        const num = parseInt(currentHour, 10) || 0;
        const next = (num + delta + 24) % 24;
        onChange(String(next).padStart(2, '0'));
    };

    return (
        <div className="w-full max-w-[620px] flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
            {/* Concept Switcher Header */}
            <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-brand-blue" />
                        Pilih Tampilan Jam (Live Preview)
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                        Durasi: <strong className="text-brand-blue">{duration} Jam</strong>
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                        { id: 'concept1', label: '1. Range Pill' },
                        { id: 'concept2', label: '2. Timeline Slider' },
                        { id: 'concept3', label: '3. Kartu Digital' },
                        { id: 'concept4', label: '4. Popover Grid' },
                    ].map((concept) => (
                        <button
                            key={concept.id}
                            type="button"
                            onClick={() => setSelectedConcept(concept.id)}
                            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition text-center cursor-pointer ${
                                selectedConcept === concept.id
                                    ? 'bg-brand-blue text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {concept.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* CONCEPT 1: Range Pill + Shift Cepat */}
            {selectedConcept === 'concept1' && (
                <div className="flex flex-col gap-3 p-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-1.5 shadow-2xs">
                            <Clock className="h-4 w-4 text-brand-blue shrink-0" />
                            <span className="text-xs text-slate-500 font-medium">Mulai:</span>
                            <select
                                value={startHour}
                                onChange={(e) => onChangeStartHour(e.target.value)}
                                className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                            >
                                {HOURS.map((h) => (
                                    <option key={h} value={h}>{h}:00</option>
                                ))}
                            </select>
                        </div>

                        <span className="text-xs font-semibold text-slate-400">s/d</span>

                        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-1.5 shadow-2xs">
                            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="text-xs text-slate-500 font-medium">Selesai:</span>
                            <select
                                value={endHour}
                                onChange={(e) => onChangeEndHour(e.target.value)}
                                className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                            >
                                {HOURS.map((h) => (
                                    <option key={h} value={h}>{h}:00</option>
                                ))}
                            </select>
                        </div>

                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-brand-blue border border-blue-100">
                            {duration} Jam Aktif
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-dashed border-slate-200">
                        <span className="text-[11px] text-slate-400 mr-1">Preset Cepat:</span>
                        {PRESETS.map((p) => {
                            const isMatch = startHour === p.start && endHour === p.end;
                            return (
                                <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => handleApplyPreset(p.start, p.end)}
                                    className={`px-2.5 py-1 text-xs rounded-md transition font-medium cursor-pointer ${
                                        isMatch
                                            ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/30 font-semibold'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* CONCEPT 2: Interactive Visual Timeline Slider */}
            {selectedConcept === 'concept2' && (
                <div className="flex flex-col gap-3 p-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="h-4 w-4 text-brand-blue" />
                            <span className="text-xs font-semibold text-slate-800">
                                Rentang Jam: <strong className="text-brand-blue">{startHour}:00 — {endHour}:00</strong>
                            </span>
                        </div>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {duration} Jam Total
                        </span>
                    </div>

                    {/* Timeline Bar visualization */}
                    <div className="relative pt-2 pb-1">
                        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative">
                            {/* Highlighted active range */}
                            <div
                                className="absolute top-0 bottom-0 bg-brand-blue transition-all"
                                style={{
                                    left: `${(startNum / 24) * 100}%`,
                                    width: `${Math.max(4, (duration / 24) * 100)}%`,
                                }}
                            />
                        </div>

                        {/* Ticks */}
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5 px-0.5">
                            <span>00:00</span>
                            <span>06:00</span>
                            <span>12:00</span>
                            <span>18:00</span>
                            <span>23:00</span>
                        </div>
                    </div>

                    {/* Sliders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="flex flex-col gap-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Mulai Akses</span>
                                <strong className="font-semibold text-slate-800">{startHour}:00</strong>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="23"
                                value={startNum}
                                onChange={(e) => onChangeStartHour(String(e.target.value).padStart(2, '0'))}
                                className="w-full accent-brand-blue cursor-pointer"
                            />
                        </div>

                        <div className="flex flex-col gap-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Selesai Akses</span>
                                <strong className="font-semibold text-slate-800">{endHour}:00</strong>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="23"
                                value={endNum}
                                onChange={(e) => onChangeEndHour(String(e.target.value).padStart(2, '0'))}
                                className="w-full accent-brand-blue cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* CONCEPT 3: Twin Digital Cards */}
            {selectedConcept === 'concept3' && (
                <div className="flex flex-col gap-3 p-1">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        {/* Mulai Card */}
                        <div className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Jam Mulai</span>
                                <span className="text-2xl font-bold font-mono text-slate-800 tracking-wider">
                                    {startHour}<span className="text-slate-400">:00</span>
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <button
                                    type="button"
                                    onClick={() => stepHour(startHour, 1, onChangeStartHour)}
                                    aria-label="Tambah jam mulai"
                                    className="p-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => stepHour(startHour, -1, onChangeStartHour)}
                                    aria-label="Kurang jam mulai"
                                    className="p-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center shrink-0">
                            <ArrowRight className="h-5 w-5 text-slate-300 hidden sm:block" />
                            <span className="text-xs text-slate-400 font-medium">s/d</span>
                        </div>

                        {/* Selesai Card */}
                        <div className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Jam Selesai</span>
                                <span className="text-2xl font-bold font-mono text-slate-800 tracking-wider">
                                    {endHour}<span className="text-slate-400">:00</span>
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <button
                                    type="button"
                                    onClick={() => stepHour(endHour, 1, onChangeEndHour)}
                                    aria-label="Tambah jam selesai"
                                    className="p-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => stepHour(endHour, -1, onChangeEndHour)}
                                    aria-label="Kurang jam selesai"
                                    className="p-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 bg-blue-50/60 border border-blue-100 px-3 py-2 rounded-lg">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Timer className="h-4 w-4 text-brand-blue" />
                            Status Batasan Operasional
                        </span>
                        <strong className="text-brand-blue">{duration} Jam Aktif</strong>
                    </div>
                </div>
            )}

            {/* CONCEPT 4: Popover Grid Jam Kerja */}
            {selectedConcept === 'concept4' && (
                <div className="flex flex-col gap-2.5 p-1">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsPopoverOpen((prev) => !prev)}
                            className="inline-flex items-center justify-between gap-3 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 shadow-2xs text-sm font-semibold text-slate-800 transition cursor-pointer"
                        >
                            <span className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-brand-blue" />
                                {startHour}:00 — {endHour}:00 WIB
                            </span>
                            <span className="text-xs font-normal text-slate-400">
                                {isPopoverOpen ? '▲ Tutup' : '▼ Ubah'}
                            </span>
                        </button>

                        <span className="text-xs text-slate-500 font-medium">
                            ({duration} Jam)
                        </span>
                    </div>

                    {isPopoverOpen && (
                        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-xs">
                            <div>
                                <span className="text-xs font-semibold text-slate-600 block mb-2">Pilihan Cepat Jam Toko:</span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                    {PRESETS.map((p) => {
                                        const isMatch = startHour === p.start && endHour === p.end;
                                        return (
                                            <button
                                                key={p.label}
                                                type="button"
                                                onClick={() => {
                                                    handleApplyPreset(p.start, p.end);
                                                    setIsPopoverOpen(false);
                                                }}
                                                className={`px-2.5 py-2 text-xs rounded-md font-medium text-left transition flex items-center justify-between cursor-pointer ${
                                                    isMatch
                                                        ? 'bg-brand-blue text-white shadow-2xs'
                                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                                }`}
                                            >
                                                <span>{p.label}</span>
                                                {isMatch && <Check className="h-3.5 w-3.5 shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                                <span className="text-slate-500">Kustom Manual:</span>
                                <select
                                    value={startHour}
                                    onChange={(e) => onChangeStartHour(e.target.value)}
                                    className="bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-800"
                                >
                                    {HOURS.map((h) => (
                                        <option key={h} value={h}>{h}:00</option>
                                    ))}
                                </select>
                                <span className="text-slate-400">s/d</span>
                                <select
                                    value={endHour}
                                    onChange={(e) => onChangeEndHour(e.target.value)}
                                    className="bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-800"
                                >
                                    {HOURS.map((h) => (
                                        <option key={h} value={h}>{h}:00</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
