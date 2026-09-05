import { CloseIcon } from '@/features/workspace/shared/Icons';

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function StatementFileProgressCard({
    file,
    parsedData = null,
    loading = false,
    error = '',
    onRemove = null,
}) {
    if (!file) return null;

    const fileSizeFormatted = formatBytes(file.size);

    return (
        <div className="flex flex-col gap-2 rounded-[4px] border border-slate-200 bg-slate-50/80 p-3.5">
            {/* Top row: File icon + Name & size below + Remove button */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] bg-white border border-slate-200 text-slate-500">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-sm font-normal text-slate-800" title={file.name}>
                            {file.name}
                        </div>
                        <div className="text-xs font-normal text-slate-500">
                            {fileSizeFormatted}
                        </div>
                    </div>
                </div>

                {onRemove ? (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="inline-flex items-center gap-1 text-xs font-normal text-slate-600 hover:text-red-700 transition cursor-pointer px-2 py-1 rounded hover:bg-slate-200/60"
                        title="Batalkan berkas ini"
                    >
                        <CloseIcon className="h-3.5 w-3.5" />
                        <span>Hapus</span>
                    </button>
                ) : null}
            </div>

            {/* Status or error */}
            {loading ? (
                <div className="text-xs text-brand-blue flex items-center gap-2 pt-1 font-normal">
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sedang memproses berkas...</span>
                </div>
            ) : error ? (
                <div className="rounded-[4px] bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 font-normal">
                    {error}
                </div>
            ) : parsedData ? (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs text-slate-700">
                    <span className="text-emerald-800 font-medium">
                        ✓ {parsedData.rows?.length || 0} baris mutasi berhasil dibaca
                    </span>
                    {parsedData.summary ? (
                        <span className="text-slate-600">
                            Masuk: <span className="font-semibold text-emerald-700">{parsedData.summary.inCount || 0}</span> · Keluar: <span className="font-semibold text-rose-700">{parsedData.summary.outCount || 0}</span>
                        </span>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
