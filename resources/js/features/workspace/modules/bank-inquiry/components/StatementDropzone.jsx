import { useRef } from 'react';

export default function StatementDropzone({ onFileSelect, disabled = false }) {
    const fileInputRef = useRef(null);

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => {
                if (!disabled) {
                    fileInputRef.current?.click();
                }
            }}
            className={`group flex flex-col items-center justify-center p-6 sm:p-7 border-2 border-dashed rounded-[6px] transition-all cursor-pointer select-none bg-slate-50/60 hover:bg-blue-50/30 ${
                disabled
                    ? 'border-slate-200 opacity-60 cursor-not-allowed'
                    : 'border-slate-300 hover:border-brand-blue'
            }`}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                disabled={disabled}
                className="hidden"
                onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                        onFileSelect(e.target.files[0]);
                    }
                }}
            />

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-brand-blue mb-2.5 transition-transform group-hover:scale-105">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
            </div>

            <p className="text-xs sm:text-sm font-normal text-slate-700 text-center leading-relaxed">
                Seret dan lepas berkas atau{' '}
                <span className="font-semibold text-brand-blue underline underline-offset-2 group-hover:text-brand-blue-hover transition">
                    pilih file
                </span>{' '}
                untuk mengunggah.
            </p>

            <p className="mt-1 text-xs text-slate-500 text-center">
                Mendukung format .CSV, .XLSX, .XLS (Maks. 10MB)
            </p>
        </div>
    );
}
