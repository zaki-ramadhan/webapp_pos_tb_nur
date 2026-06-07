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
        <div className={`flex flex-col items-center justify-between gap-4 border-t border-[#e2e8f0] bg-white px-4 py-3 sm:flex-row ${className}`.trim()}>
            {/* Info text */}
            <div className="text-[14px] text-[#4f5d75]">
                Menampilkan <span className="font-semibold text-[#1e293b]">{from}</span> sampai{' '}
                <span className="font-semibold text-[#1e293b]">{to}</span> dari{' '}
                <span className="font-semibold text-[#1e293b]">{total}</span> data
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Per Page Selector */}
                {onPerPageChange ? (
                    <div className="flex items-center gap-2">
                        <span className="text-[13px] text-[#64748b]">Tampilkan:</span>
                        <select
                            value={perPage}
                            onChange={(e) => onPerPageChange(Number(e.target.value))}
                            className="h-[34px] rounded-[4px] border border-[#cfd6e2] bg-white px-2.5 text-[14px] text-[#1e293b] focus:border-[#2353a0] focus:outline-none"
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
                <div className="flex items-center -space-x-px rounded-[4px] border border-[#e2e8f0]">
                    {/* Prev Button */}
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                        className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-l-[4px] bg-white text-[#64748b] hover:bg-[#f8fafc] disabled:opacity-50 disabled:hover:bg-white"
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
                                        <span className="px-2.5 text-[14px] text-[#64748b]">...</span>
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={() => onPageChange(p)}
                                        className={`h-[34px] min-w-[34px] px-2 text-[14px] font-medium leading-5 transition-all ${
                                            p === page
                                                ? 'bg-[#2353a0] text-white'
                                                : 'bg-white text-[#4f5d75] hover:bg-[#f8fafc]'
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
                        className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-r-[4px] bg-white text-[#64748b] hover:bg-[#f8fafc] disabled:opacity-50 disabled:hover:bg-white"
                        aria-label="Halaman berikutnya"
                    >
                        <ChevronRight className="h-4.5 w-4.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
