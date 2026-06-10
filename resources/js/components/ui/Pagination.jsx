import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
    page,
    perPage,
    total,
    lastPage,
    from,
    to,
    onPageChange,
    onPerPageChange,
    perPageOptions = [10, 25, 50, 100],
    className = '',
}) {
    if (total <= 0) {
        return null;
    }

    return (
        <div className={`flex flex-col items-center justify-between gap-4 border-t border-ui-border-light bg-white px-4 py-3 sm:flex-row ${className}`.trim()}>
            {/* Info text */}
            <div className="text-[14px] text-text-medium">
                Menampilkan <span className="font-semibold text-text-dark">{from}</span> sampai{' '}
                <span className="font-semibold text-text-dark">{to}</span> dari{' '}
                <span className="font-semibold text-text-dark">{total}</span> data
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Per Page Selector */}
                {onPerPageChange ? (
                    <div className="flex items-center gap-2">
                        <span className="text-[13px] text-text-muted">Tampilkan:</span>
                        <select
                            value={perPage}
                            onChange={(e) => onPerPageChange(Number(e.target.value))}
                            className="h-[34px] rounded-[4px] border border-ui-border-dark bg-white px-2.5 text-[14px] text-text-dark focus:border-brand-blue focus:outline-none"
                        >
                            {perPageOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : null}

                {/* Page Navigation */}
                <div className="flex items-center -space-x-px rounded-[4px] border border-ui-border-light">
                    {/* Prev Button */}
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                        className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-l-[4px] bg-white text-text-muted hover:bg-ui-bg-hover disabled:opacity-50 disabled:hover:bg-white"
                        aria-label="Halaman sebelumnya"
                    >
                        <ChevronLeft className="h-4.5 w-4.5" />
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: lastPage }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
                        .map((p, index, arr) => {
                            const prev = arr[index - 1];
                            const showEllipsis = prev && p - prev > 1;

                            return (
                                <div key={p} className="flex items-center">
                                    {showEllipsis ? (
                                        <span className="px-2.5 text-[14px] text-text-muted">...</span>
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={() => onPageChange(p)}
                                        className={`h-[34px] min-w-[34px] px-2 text-[14px] font-medium leading-5 transition-all ${
                                            p === page
                                                ? 'bg-brand-blue text-white'
                                                : 'bg-white text-text-medium hover:bg-ui-bg-hover'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                </div>
                            );
                        })}

                    {/* Next Button */}
                    <button
                        type="button"
                        disabled={page >= lastPage}
                        onClick={() => onPageChange(page + 1)}
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
