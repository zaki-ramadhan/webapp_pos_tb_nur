import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
    page = 1,
    perPage = 25,
    total = 0,
    lastPage: rawLastPage,
    from: rawFrom,
    to: rawTo,
    onPageChange,
    onPerPageChange,
    perPageOptions = [10, 25, 50, 100],
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const numericTotal = Number(total) || 0;
    if (numericTotal <= 0) {
        return null;
    }

    const currentPage = Math.max(1, Number(page) || 1);
    const currentPerPage = Math.max(1, Number(perPage) || 25);
    const lastPage = Math.max(1, rawLastPage ? Number(rawLastPage) : Math.ceil(numericTotal / currentPerPage));

    const from = rawFrom !== undefined && rawFrom !== null ? Number(rawFrom) : (currentPage - 1) * currentPerPage + 1;
    const to = rawTo !== undefined && rawTo !== null ? Number(rawTo) : Math.min(numericTotal, currentPage * currentPerPage);

    const handlePageClick = (targetPage) => {
        if (typeof onPageChange !== 'function') return;
        const validTarget = Math.max(1, Math.min(lastPage, Number(targetPage) || 1));
        if (validTarget !== currentPage) {
            onPageChange(validTarget);
        }
    };

    const cleanedClassName = className.replace(/\bmt-\S+/g, '').trim();

    return (
        <div className={`flex flex-col items-center justify-between gap-3 bg-transparent px-2 pt-1 pb-2 sm:flex-row mt-1.5 ${cleanedClassName}`.trim()}>
            <div className="text-sm text-text-medium">
                Menampilkan <span className="font-semibold text-text-dark">{from}</span> sampai{' '}
                <span className="font-semibold text-text-dark">{to}</span> dari{' '}
                <span className="font-semibold text-text-dark">{numericTotal}</span> data
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {onPerPageChange ? (
                    <div className="flex items-center gap-2 relative" ref={dropdownRef}>
                        <span className="text-sm text-text-muted">Tampilkan:</span>
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex h-[34px] items-center justify-between gap-1.5 rounded-[4px] border border-ui-border-dark bg-white px-2.5 text-sm font-medium text-text-dark hover:bg-slate-50 focus:border-brand-blue focus:outline-none min-w-[64px]"
                        >
                            <span>{currentPerPage}</span>
                            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isOpen && (
                            <div className="absolute bottom-full mb-1.5 right-0 z-50 min-w-[70px] rounded-[4px] border border-ui-border-dark bg-white py-1 shadow-md">
                                {perPageOptions.map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                            onPerPageChange(Number(opt));
                                            setIsOpen(false);
                                        }}
                                        className={`block w-full px-3 py-1.5 text-left text-sm transition hover:bg-ui-bg-hover ${
                                            opt === currentPerPage ? 'bg-brand-blue-lightest font-medium text-brand-blue-darker' : 'text-text-dark'
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : null}

                <div className="flex items-center -space-x-px rounded-[4px] border border-ui-border-light">
                    <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => handlePageClick(currentPage - 1)}
                        className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-l-[4px] bg-white text-text-muted hover:bg-ui-bg-hover disabled:opacity-50 disabled:hover:bg-white"
                        aria-label="Halaman sebelumnya"
                    >
                        <ChevronLeft className="h-4.5 w-4.5" />
                    </button>

                    {Array.from({ length: lastPage }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === lastPage || Math.abs(p - currentPage) <= 1)
                        .map((p, index, arr) => {
                            const prev = arr[index - 1];
                            const showEllipsis = prev && p - prev > 1;

                            return (
                                <div key={p} className="flex items-center">
                                    {showEllipsis ? (
                                        <span className="px-2.5 text-sm text-text-muted select-none">...</span>
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={() => handlePageClick(p)}
                                        className={`h-[34px] min-w-[34px] px-2 text-sm font-medium leading-5 transition-all ${
                                            p === currentPage
                                                ? 'bg-brand-blue text-white font-semibold'
                                                : 'bg-white text-text-medium hover:bg-ui-bg-hover'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                </div>
                            );
                        })}

                    <button
                        type="button"
                        disabled={currentPage >= lastPage}
                        onClick={() => handlePageClick(currentPage + 1)}
                        className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-r-[4px] bg-white text-text-muted hover:bg-ui-bg-hover disabled:opacity-50 disabled:hover:bg-white"
                        aria-label="Halaman berikutnya"
                    >
                        <ChevronRight className="h-4.5 w-4.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
