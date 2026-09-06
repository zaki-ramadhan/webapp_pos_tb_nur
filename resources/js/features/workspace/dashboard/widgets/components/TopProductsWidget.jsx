import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import DashboardWidgetEmptyState from '@/features/workspace/dashboard/widgets/DashboardWidgetEmptyState';

function parseShareNumber(shareStr) {
    if (typeof shareStr === 'number') return shareStr;
    if (!shareStr) return 0;
    const clean = String(shareStr).replace('%', '').replace(',', '.').trim();
    return Math.min(100, Math.max(0, parseFloat(clean) || 0));
}

function handleOpenProduct(item) {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(
            new CustomEvent('workspace:open-page', {
                detail: {
                    pageId: 'items-services',
                    recordId: item.id ?? item.productId ?? undefined,
                    label: item.name,
                    tabLabel: item.name,
                    openForm: Boolean(item.id ?? item.productId),
                },
            })
        );
    }
}

function ProductItem({ item }) {
    const [imgError, setImgError] = useState(false);
    const shareNum = parseShareNumber(item.share);
    const imageUrl = item.imageUrl || item.image || null;

    return (
        <div
            onClick={() => handleOpenProduct(item)}
            className="group relative overflow-hidden rounded-[4px] border border-slate-200 bg-white transition-all hover:border-blue-300 hover:shadow-xs cursor-pointer px-2 py-1"
        >
            <div
                className="absolute inset-y-0 left-0 bg-blue-50/55 pointer-events-none transition-all duration-300"
                style={{ width: `${Math.max(shareNum, 3)}%` }}
            />

            <div className="relative z-10 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="relative h-9.5 w-9.5 sm:h-10 sm:w-10 shrink-0 rounded-[4px] border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                        {imageUrl && !imgError ? (
                            <img
                                src={imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <ImageIcon className="h-4.5 w-4.5 text-slate-400" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <p className="truncate text-xs sm:text-sm font-medium text-slate-800 group-hover:text-[#16499A] transition-colors leading-snug">
                            {item.name}
                        </p>
                        <p className="text-[11px] sm:text-[12.5px] text-black font-normal truncate leading-tight mt-0.5">
                            {item.units}
                        </p>
                    </div>
                </div>

                <div className="shrink-0 text-right flex flex-col items-end justify-center">
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#16499A] leading-snug">
                        {item.revenue}
                    </span>
                    <span className="text-[11px] sm:text-[12.5px] text-black font-normal leading-tight mt-0.5">
                        {item.share}
                    </span>
                </div>
            </div>
        </div>
    );
}

export function TopProductsWidget({ widget }) {
    const items = widget.items ?? [];
    if (!items.length) {
        return (
            <DashboardWidgetEmptyState
                title="Tidak ada data"
                description="Belum ada peringkat barang terlaris."
            />
        );
    }

    return (
        <div className="flex h-full flex-col min-h-0">
            <div className="flex-1 overflow-y-auto pr-0.5 space-y-1.5 [scrollbar-width:thin]">
                {items.map((item) => (
                    <ProductItem key={item.id ?? item.name} item={item} />
                ))}
            </div>
        </div>
    );
}
