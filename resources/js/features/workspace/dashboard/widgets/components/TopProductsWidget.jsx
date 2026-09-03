import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import DashboardWidgetEmptyState from '@/features/workspace/dashboard/widgets/DashboardWidgetEmptyState';

function WidgetPeriod({ value, align = 'right' }) {
    if (!value) {
        return null;
    }

    return (
        <div className={`text-sm text-layout-text ${align === 'right' ? 'text-right' : 'text-left'}`.trim()}>
            {value}
        </div>
    );
}

function TopProductRow({ item, index }) {
    const [imgError, setImgError] = useState(false);
    const imageUrl = item.imageUrl || item.image || null;

    const handleOpenProduct = () => {
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
    };

    return (
        <button
            type="button"
            onClick={handleOpenProduct}
            className="group w-full grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-[6px] border border-chart-grid-light bg-ui-bg-hover px-2.5 py-1.5 transition-all duration-150 cursor-pointer hover:bg-blue-50/80 hover:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-400 text-left"
        >
            <div className="relative h-9 w-9 shrink-0">
                <div className="h-full w-full flex items-center justify-center rounded-[4px] border border-ui-border-light bg-slate-100 text-slate-400 overflow-hidden">
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
                <span className="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-blue-hover text-[9px] font-semibold text-white shadow-sm z-10">
                    {index + 1}
                </span>
            </div>
            <div className="min-w-0">
                <p className="truncate text-xs sm:text-sm font-medium text-brand-darker group-hover:text-blue-900 transition-colors">{item.name}</p>
                <p className="mt-0.5 text-[11px] sm:text-xs text-black">
                    {item.units}
                </p>
            </div>
            <p className="text-right text-xs sm:text-sm font-semibold text-brand-darker">
                {item.revenue}
            </p>
        </button>
    );
}

export function TopProductsWidget({ widget }) {
    if (!(widget.items ?? []).length) {
        return (
            <DashboardWidgetEmptyState
                title='Tidak ada data'
                description="Belum ada peringkat barang terlaris."
            />
        );
    }

    return (
        <div className="flex h-full flex-col gap-4 min-h-0">
            <WidgetPeriod value={widget.period} />

            <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 [scrollbar-width:thin]">
                {(widget.items ?? []).map((item, index) => (
                    <TopProductRow key={item.name} item={item} index={index} />
                ))}
            </div>
        </div>
    );
}
