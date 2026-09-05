import { useRef, useState } from 'react';
import { CloudUpload, CheckCircle2, AlertCircle, Trash2, File } from 'lucide-react';

export function getReadableFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function FileFormatBadgeIcon({ ext = 'csv', className = '' }) {
    const cleanExt = (ext || '').replace(/^\./, '').toUpperCase() || 'FILE';
    let badgeBg = 'bg-slate-600 text-white';
    if (['XLSX', 'XLS', 'CSV'].includes(cleanExt)) {
        badgeBg = 'bg-emerald-600 text-white';
    } else if (cleanExt === 'PDF') {
        badgeBg = 'bg-rose-600 text-white';
    } else if (['JPG', 'JPEG', 'PNG', 'WEBP', 'SVG'].includes(cleanExt)) {
        badgeBg = 'bg-blue-600 text-white';
    }

    return (
        <div className={`relative flex items-center justify-center shrink-0 w-10 h-11 ${className}`}>
            <File className="h-10 w-10 text-slate-500 stroke-[0.8]" />
            <span
                className={`absolute bottom-2.5 -left-1 px-1 py-0.5 text-[9px] font-bold tracking-tight rounded-[3px] shadow-xs leading-none select-none ${badgeBg}`}
            >
                {cleanExt.slice(0, 4)}
            </span>
        </div>
    );
}

export function FileUploadRoot({ children, className = '' }) {
    return <div className={`flex flex-col gap-3.5 ${className}`}>{children}</div>;
}

export function FileUploadDropZone({
    onDropFiles,
    isDisabled = false,
    accept = '.csv,.xlsx,.xls',
    maxSizeText = 'CSV, XLSX, atau XLS (maks. 10MB)',
    className = '',
}) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isDisabled) return;
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (isDisabled) return;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onDropFiles?.(e.dataTransfer.files);
        }
    };

    const handleClick = () => {
        if (isDisabled) return;
        fileInputRef.current?.click();
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onDropFiles?.(e.target.files);
            e.target.value = '';
        }
    };

    return (
        <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative flex flex-col items-center justify-center rounded-xl py-11 sm:py-14 px-6 text-center transition cursor-pointer select-none ${
                isDragging
                    ? 'bg-blue-50/50 text-brand-blue'
                    : 'bg-white text-slate-300 hover:text-brand-blue hover:bg-slate-50/50'
            } ${isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''} ${className}`}
        >
            {/* SVG border with custom elongated dashed lines */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none rounded-xl overflow-visible">
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    rx="12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="9 6"
                />
            </svg>

            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                disabled={isDisabled}
                className="hidden"
            />
            <div className="mb-4 flex h-13 w-13 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-2xs text-slate-600 group-hover:border-brand-blue/40 group-hover:text-brand-blue transition-colors">
                <CloudUpload className="h-7 w-7" strokeWidth={1.8} />
            </div>
            <p className="text-sm text-slate-700">
                <span className="font-semibold text-brand-blue hover:underline">Klik untuk unggah</span> atau seret dan lepas
            </p>
            <p className="mt-1 text-xs text-slate-500">
                {maxSizeText}
            </p>
        </div>
    );
}

export function FileUploadList({ children, className = '' }) {
    return <div className={`flex flex-col gap-2.5 ${className}`}>{children}</div>;
}

export function FileUploadListItemProgressBar({
    name,
    size,
    type,
    progress = 100,
    failed = false,
    errorMessage = '',
    onDelete,
    onRetry,
    className = '',
}) {
    const ext = type ? type : name ? name.split('.').pop() : '';
    const formattedSize = getReadableFileSize(size);

    return (
        <div
            className={`relative flex flex-col rounded-xl border p-4 bg-white transition shadow-2xs ${
                failed
                    ? 'border-red-400 ring-1 ring-red-400/20'
                    : 'border-slate-200'
            } ${className}`}
        >
            <div className="flex items-start gap-3.5">
                {/* File format icon */}
                <FileFormatBadgeIcon ext={ext} />

                {/* Info & progress section */}
                <div className="min-w-0 flex-1 flex flex-col gap-1">
                    <p className="text-sm font-medium text-slate-700 truncate">
                        {name}
                    </p>

                    {failed ? (
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-500 font-normal">{formattedSize}</span>
                                <span className="h-3.5 w-px bg-slate-200 self-center" />
                                <div className="flex items-center gap-1 text-red-600 font-medium">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>Upload failed, please try again</span>
                                </div>
                            </div>
                            {errorMessage ? (
                                <p className="text-xs text-red-600 mt-1 font-normal">{errorMessage}</p>
                            ) : null}
                            {onRetry ? (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRetry?.();
                                    }}
                                    className="mt-1.5 text-sm font-semibold text-red-600 hover:text-red-700 cursor-pointer self-start transition"
                                >
                                    Try again
                                </button>
                            ) : null}
                        </div>
                    ) : progress < 100 ? (
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-500 font-normal">{formattedSize}</span>
                                <span className="h-3.5 w-px bg-slate-200 self-center" />
                                <div className="flex items-center gap-1 text-slate-600 font-medium">
                                    <CloudUpload className="h-4 w-4 text-brand-blue animate-pulse shrink-0" />
                                    <span>Mengunggah...</span>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-3">
                                <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-brand-blue transition-all duration-200 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className="min-w-[36px] text-right text-sm font-medium text-slate-700">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-500 font-normal">{formattedSize}</span>
                                <span className="h-3.5 w-px bg-slate-200 self-center" />
                                <div className="flex items-center gap-1 text-slate-600 font-medium">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                    <span>Selesai</span>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-3">
                                <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-brand-blue transition-all duration-200 ease-out"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <span className="min-w-[36px] text-right text-sm font-medium text-slate-700">
                                    100%
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Delete button */}
                {onDelete ? (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.();
                        }}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-500/10 p-1.5 rounded-lg transition cursor-pointer self-start"
                        aria-label="Hapus berkas"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                ) : null}
            </div>
        </div>
    );
}

export const FileUpload = {
    Root: FileUploadRoot,
    DropZone: FileUploadDropZone,
    List: FileUploadList,
    ListItemProgressBar: FileUploadListItemProgressBar,
};

export default FileUpload;
