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
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] bg-blue-100 text-brand-blue border border-blue-200 font-semibold text-[10px]">
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
        <div className="flex flex-col gap-2 rounded-[4px] border border-slate-200 bg-slate-50/80 p-3 shadow-xs">
            {/* Top Row: Icon + File Info + Remove Button */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    <FileBadgeIcon ext={ext} />
                    <div className="flex items-baseline gap-1.5 min-w-0">
                        <span className="truncate text-xs sm:text-sm font-medium text-slate-900" title={file.name}>
                            {file.name}
                        </span>
                        <span className="shrink-0 text-xs text-slate-500 font-normal">
                            ({fileSizeFormatted})
                        </span>
                    </div>
                </div>

                {onRemove ? (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] text-slate-400 hover:bg-slate-200 hover:text-red-700 transition cursor-pointer"
                        title="Batalkan pilihan berkas"
                    >
                        <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                ) : null}
            </div>

            {/* Progress Bar & Percentage */}
            <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-[2px] bg-slate-200">
                    <div
                        className="h-full rounded-[2px] bg-brand-blue transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                </div>
                <span className="shrink-0 text-xs font-semibold text-slate-700 min-w-[34px] text-right">
                    {Math.round(progress)}%
                </span>
            </div>

            {/* Parsing Result Feedback */}
            {loading ? (
                <div className="text-xs text-brand-blue flex items-center gap-1.5 pt-0.5 font-medium">
                    <span className="inline-block h-2 w-2 rounded-full bg-brand-blue animate-ping" />
                    <span>Sedang memproses dan memvalidasi baris mutasi...</span>
                </div>
            ) : error ? (
                <div className="rounded-[4px] bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 font-medium">
                    {error}
                </div>
            ) : parsedData ? (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                        <svg className="h-4 w-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{parsedData.rows?.length || 0} baris mutasi siap direkonsiliasi</span>
                    </div>
                    {parsedData.summary ? (
                        <div className="text-xs text-slate-500">
                            Masuk: <span className="font-semibold text-emerald-700">{parsedData.summary.inCount || 0}</span> · Keluar: <span className="font-semibold text-rose-700">{parsedData.summary.outCount || 0}</span>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
