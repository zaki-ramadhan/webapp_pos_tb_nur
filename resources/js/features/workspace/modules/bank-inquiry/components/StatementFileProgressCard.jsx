import { CloseIcon } from '@/features/workspace/shared/Icons';

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function FileBadgeIcon({ ext = 'CSV' }) {
    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-brand-blue text-white font-bold text-xs shadow-2xs">
            {ext.slice(0, 4)}
        </div>
    );
}

export default function StatementFileProgressCard({
    file,
    progress = 100,
    parsedData = null,
    loading = false,
    error = '',
    onRemove = null,
}) {
    if (!file) return null;

    const ext = file.name ? file.name.split('.').pop().toUpperCase() : 'CSV';
    const fileSizeFormatted = formatBytes(file.size);

    return (
        <div className="flex flex-col gap-3 rounded-[6px] border border-blue-200/90 bg-blue-50/40 p-4 shadow-xs">
            {/* Top Row: Icon + File Info + Remove Button */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <FileBadgeIcon ext={ext} />
                    <div className="flex items-baseline gap-2 min-w-0">
                        <span className="truncate text-sm sm:text-base font-semibold text-slate-900" title={file.name}>
                            {file.name}
                        </span>
                        <span className="shrink-0 text-xs sm:text-sm text-slate-500 font-medium">
                            ({fileSizeFormatted})
                        </span>
                    </div>
                </div>

                {onRemove ? (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] text-slate-400 hover:bg-red-100/70 hover:text-red-700 transition cursor-pointer"
                        title="Batalkan dan ganti berkas"
                    >
                        <CloseIcon className="h-4 w-4" />
                    </button>
                ) : null}
            </div>

            {/* Progress Bar & Percentage */}
            <div className="flex items-center gap-3">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200/90">
                    <div
                        className="h-full rounded-full bg-brand-blue transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                </div>
                <span className="shrink-0 text-xs sm:text-sm font-bold text-slate-800 min-w-[38px] text-right">
                    {Math.round(progress)}%
                </span>
            </div>

            {/* Parsing Result Feedback */}
            {loading ? (
                <div className="text-sm text-brand-blue flex items-center gap-2 pt-0.5 font-medium">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-blue animate-ping" />
                    <span>Sedang memproses dan memvalidasi baris mutasi bank...</span>
                </div>
            ) : error ? (
                <div className="rounded-[4px] bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700 font-medium">
                    {error}
                </div>
            ) : parsedData ? (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-200/70 text-sm text-slate-800">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                        <svg className="h-4.5 w-4.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{parsedData.rows?.length || 0} baris mutasi siap direkonsiliasi</span>
                    </div>
                    {parsedData.summary ? (
                        <div className="text-xs sm:text-sm text-slate-600 font-medium">
                            Masuk: <span className="font-bold text-emerald-700">{parsedData.summary.inCount || 0}</span> · Keluar: <span className="font-bold text-rose-700">{parsedData.summary.outCount || 0}</span>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
