import { useState, useTransition } from 'react';
import { router } from '@inertiajs/react';
import { Calendar, RotateCcw } from 'lucide-react';

export default function DashboardDateFilterBar({ currentAsOfDate }) {
    const todayStr = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(currentAsOfDate || todayStr);
    const [isPending, startTransition] = useTransition();

    const handleApplyDate = (dateVal) => {
        if (!dateVal) return;
        const validDate = dateVal > todayStr ? todayStr : dateVal;
        setSelectedDate(validDate);

        startTransition(() => {
            router.get(
                window.location.pathname,
                { as_of_date: validDate },
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: ['widgets', 'dashboard'],
                }
            );
        });
    };

    const handlePreset = (daysOffset) => {
        if (daysOffset === 0) {
            handleApplyDate(todayStr);
            return;
        }
        const d = new Date();
        d.setDate(d.getDate() - daysOffset);
        const presetStr = d.toISOString().split('T')[0];
        handleApplyDate(presetStr);
    };

    const isToday = selectedDate === todayStr;

    return (
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-[8px] border border-slate-200 bg-white p-2.5 shadow-widget-tiny mb-3">
            <div className="flex items-center gap-2 min-w-0">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-brand-blue shrink-0">
                    <Calendar className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-800 block">Acuan Tanggal Analisis Histori Toko:</span>
                    <span className="text-xs text-slate-500 truncate block">
                        {isToday ? 'Hari Ini (Data Real-time Terbaru)' : `Data Grafik Terkunci pada Tanggal ${selectedDate}`}
                    </span>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <button
                    type="button"
                    onClick={() => handlePreset(0)}
                    disabled={isPending || isToday}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                        isToday
                            ? 'bg-brand-blue text-white shadow-widget-tiny'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    } disabled:opacity-50`}
                >
                    Hari Ini
                </button>
                <button
                    type="button"
                    onClick={() => handlePreset(7)}
                    disabled={isPending}
                    className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                >
                    -7 Hari
                </button>
                <button
                    type="button"
                    onClick={() => handlePreset(30)}
                    disabled={isPending}
                    className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                >
                    -30 Hari
                </button>

                <div className="relative inline-flex items-center">
                    <input
                        type="date"
                        max={todayStr}
                        value={selectedDate}
                        onChange={(e) => handleApplyDate(e.target.value)}
                        disabled={isPending}
                        className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-700 font-medium focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue disabled:opacity-50 cursor-pointer"
                        title="Pilih tanggal histori di masa lalu (Maksimal Hari Ini)"
                    />
                </div>

                {!isToday && (
                    <button
                        type="button"
                        onClick={() => handlePreset(0)}
                        title="Kembali ke Hari Ini"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-brand-blue hover:border-brand-blue transition"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}
