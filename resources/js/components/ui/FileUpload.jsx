import { useRef, useState } from 'react';
import { CloudUpload, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

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
        <div className={`relative flex h-10 w-8 shrink-0 flex-col items-center justify-end rounded-xs border border-slate-200 bg-white p-0.5 shadow-2xs ${className}`}>
            {/* Dog-ear folded corner */}
            <div className="absolute top-0 right-0 h-2 w-2 rounded-bl-xs border-b border-l border-slate-200 bg-slate-100" />
            {/* Extension Badge */}
            <span className={`w-full truncate text-center text-[8px] font-bold rounded-[2px] py-0.5 leading-none tracking-tight ${badgeBg}`}>
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
            className={`flex flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition cursor-pointer select-none ${
                isDragging
                    ? 'border-brand-blue bg-blue-50/50'
                    : 'border-slate-200 bg-white hover:border-brand-blue hover:bg-slate-50/50'
            } ${isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''} ${className}`}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                disabled={isDisabled}
                className="hidden"
            />
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-2xs text-slate-500">
                <CloudUpload className="h-5 w-5 text-slate-600" />
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
                    <p className="text-sm font-medium text-slate-800 truncate" title={name}>
                        {name}
                    </p>

                    {failed ? (
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-slate-600">{formattedSize}</span>
                                <span className="text-slate-300">•</span>
                                <div className="flex items-center gap-1 text-red-600 font-medium">
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                    <span>Gagal</span>
                                </div>
                            </div>
                            {errorMessage ? (
                                <p className="text-xs text-red-600 mt-0.5 font-normal">{errorMessage}</p>
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
                                    Coba lagi
                                </button>
                            ) : null}
                        </div>
                    ) : progress < 100 ? (
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-slate-600">{formattedSize}</span>
                                <span className="text-slate-300">•</span>
                                <div className="flex items-center gap-1 text-slate-600 font-normal">
                                    <CloudUpload className="h-3.5 w-3.5 text-brand-blue animate-pulse shrink-0" />
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
                            <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-slate-600">{formattedSize}</span>
                                <span className="text-slate-300">•</span>
                                <div className="flex items-center gap-1 text-emerald-600 font-medium">
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
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
                        className="text-slate-400 hover:text-slate-600 p-1 rounded transition cursor-pointer self-start"
                        title="Hapus berkas"
                    >
                        <Trash2 className="h-4 w-4" />
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
