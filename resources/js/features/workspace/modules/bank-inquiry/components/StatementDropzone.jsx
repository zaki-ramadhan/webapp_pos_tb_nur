import { useRef } from 'react';

export function ModernFolderIcon({ className = 'h-16 w-16' }) {
    return (
        <svg className={className} viewBox="0 0 72 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="folderBackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5D52EB" />
                    <stop offset="100%" stopColor="#4A3ECB" />
                </linearGradient>
                <linearGradient id="folderFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8F8BF8" />
                    <stop offset="100%" stopColor="#716AEF" />
                </linearGradient>
                <filter id="folderGlow" x="-20%" y="-20%" width="140%" height="150%">
                    <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#716AEF" floodOpacity="0.28" />
                </filter>
            </defs>
            {/* Back folder tab */}
            <path
                d="M7 14C7 9.58 10.58 6 15 6H28.58C30.7 6 32.74 6.84 34.24 8.34L37.65 11.75C39.15 13.25 41.19 14.1 43.31 14.1H57C61.41 14.1 65 17.68 65 22.1V48C65 52.41 61.41 56 57 56H15C10.58 56 7 52.41 7 48V14Z"
                fill="url(#folderBackGrad)"
            />
            {/* White paper slip */}
            <rect x="15" y="12" width="42" height="28" rx="5" fill="white" fillOpacity="0.96" />
            {/* Front folder pocket */}
            <rect
                x="5"
                y="19"
                width="62"
                height="39"
                rx="12"
                fill="url(#folderFrontGrad)"
                filter="url(#folderGlow)"
            />
            {/* Soft inner highlight reflection */}
            <rect x="10" y="23" width="52" height="3" rx="1.5" fill="white" fillOpacity="0.35" />
        </svg>
    );
}

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
            className={`group relative flex flex-col items-center justify-center p-8 sm:p-11 border-2 border-dashed rounded-[22px] transition-all cursor-pointer select-none bg-white hover:bg-indigo-50/20 ${
                disabled
                    ? 'border-slate-200 opacity-60 cursor-not-allowed'
                    : 'border-[#D9D6FC] hover:border-[#837AF5] hover:shadow-xs'
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

            <div className="mb-4 transform transition-transform group-hover:scale-105 duration-200">
                <ModernFolderIcon className="h-16 w-18 sm:h-20 sm:w-22" />
            </div>

            <p className="text-sm sm:text-base font-normal text-slate-700 text-center leading-relaxed">
                Seret dan lepas berkas atau{' '}
                <span className="font-semibold text-slate-900 underline underline-offset-4 decoration-1 decoration-slate-900 group-hover:text-indigo-600 group-hover:decoration-indigo-600 transition">
                    pilih file
                </span>{' '}
                untuk mengunggah.
            </p>

            <p className="mt-1 text-xs sm:text-sm text-slate-400 text-center">
                Format berkas : CSV, XLSX &amp; XLS. Maksimal 10MB
            </p>
        </div>
    );
}
