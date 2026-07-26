import DashboardWidgetEmptyState from '../DashboardWidgetEmptyState';

function getBadgeStyle(tone) {
    switch (tone) {
        case 'danger':
            return 'bg-red-50 text-red-700 border-red-200';
        case 'warning':
            return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'info':
            return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'success':
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        default:
            return 'bg-slate-100 text-slate-700 border-slate-200';
    }
}

export function ActivityListWidget({ widget }) {
    const items = widget.items ?? [];
    const emptyTitle = widget.title ?? 'Tidak Ada Kegiatan';
    const emptyDescription = widget.emptyDescription ?? (
        widget.id === 'overdue-activity'
            ? 'Belum ada kegiatan pembayaran atau pengiriman yang terlewat.'
            : 'Belum ada jadwal kegiatan mendatang.'
    );

    if (!items.length) {
        return (
            <DashboardWidgetEmptyState
                title={emptyTitle}
                description={emptyDescription}
            />
        );
    }

    return (
        <div className="flex flex-col min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
            {items.map((item, index) => (
                <div
                    key={item.id ?? index}
                    className="flex items-start justify-between gap-3 px-1.5 py-2.5 transition hover:bg-slate-50/60"
                >
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                                {item.title}
                            </span>
                        </div>
                        {item.subtitle ? (
                            <p className="mt-0.5 text-[11px] sm:text-xs text-slate-500 truncate">
                                {item.subtitle}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1">
                        {item.badge ? (
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold leading-tight ${getBadgeStyle(item.tone)}`}>
                                {item.badge}
                            </span>
                        ) : null}
                        {item.date ? (
                            <span className="text-[10px] sm:text-[11px] text-slate-400">
                                {item.date}
                            </span>
                        ) : null}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ActivityListWidget;
