import { CloseIcon } from '@/features/workspace/shared/Icons';

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function FileBadgeIcon({ ext = 'CSV', className = 'h-11 w-9' }) {
    return (
        <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
            <svg className="h-full w-full" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M4 6C4 3.79 5.79 2 8 2H22L32 12V38C32 40.21 30.21 42 28 42H8C5.79 42 4 40.21 4 38V6Z"
                    fill="#EEF2FF"
                    stroke="#C7D2FE"
                    strokeWidth="1.5"
                />
                <path
                    d="M22 2V10C22 11.1 22.9 12 24 12H32"
                    fill="#E0E7FF"
                    stroke="#C7D2FE"
                    strokeWidth="1.5"
                />
            </svg>
            <span className="absolute bottom-2 inset-x-0.5 text-center font-bold text-[8.5px] uppercase tracking-wider text-white bg-indigo-600 rounded px-1 py-0.5 shadow-xs">
                {ext.slice(0, 4)}
            </span>
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
        <div className="flex flex-col gap-2.5 rounded-[18px] border border-[#E9E8F8] bg-white p-3.5 sm:p-4 shadow-2xs transition-all">
            {/* Top Row: Icon + File Info + Remove Button */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <FileBadgeIcon ext={ext} className="h-10 w-8.5 shrink-0" />
                    <div className="flex items-baseline gap-1.5 min-w-0">
                        <span className="truncate text-sm font-medium text-slate-800" title={file.name}>
                            {file.name}
                        </span>
                        <span className="shrink-0 text-xs text-slate-400 font-normal">
                            ({fileSizeFormatted})
                        </span>
                    </div>
                </div>

                {onRemove ? (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#9B99DA] hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                        title="Batalkan pilihan berkas"
                    >
                        <CloseIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
                    </button>
                ) : null}
            </div>

            {/* Progress Bar & Percentage */}
            <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#ECECF7]">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[#7B75F5] to-[#645CEB] transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                </div>
                <span className="shrink-0 text-xs font-medium text-slate-600 min-w-[34px] text-right">
                    {Math.round(progress)}%
                </span>
            </div>

            {/* Parsing Result Feedback */}
            {loading ? (
                <div className="text-[11px] text-indigo-600 flex items-center gap-1.5 pt-0.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                    <span>Memproses dan memvalidasi baris mutasi bank...</span>
                </div>
            ) : error ? (
                <div className="rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 font-medium">
                    {error}
                </div>
            ) : parsedData ? (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#F0EFFC] text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                        <svg className="h-4 w-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{parsedData.rows?.length || 0} baris mutasi siap direkonsiliasi</span>
                    </div>
                    {parsedData.summary ? (
                        <div className="text-[11px] text-slate-500">
                            Masuk: <span className="font-semibold text-emerald-600">{parsedData.summary.inCount || 0}</span> · Keluar: <span className="font-semibold text-rose-600">{parsedData.summary.outCount || 0}</span>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
