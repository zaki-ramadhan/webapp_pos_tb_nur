import DashboardWidgetEmptyState from '@/features/workspace/dashboard/widgets/DashboardWidgetEmptyState';

export function RecentActivityWidget({ widget }) {
    const items = widget.items ?? [];

    if (!items.length) {
        return <DashboardWidgetEmptyState description="Belum ada riwayat aktivitas." />;
    }

    return (
        <div className="flex h-full flex-col gap-4 min-h-0">
            <div className="flex-1 overflow-y-auto space-y-0 pr-1.5 [scrollbar-width:thin]">
                {items.map((item, index) => (
                    <div key={item.id ?? index} className="flex gap-6 py-4 border-b border-table-row-border last:border-b-0 first:pt-0">
                        <div className="flex flex-col items-center justify-center text-center min-w-[56px] shrink-0">
                            <span className="text-xs font-normal text-text-light">{item.dayName}</span>
                            <span className="text-4xl font-bold text-tab-active-text leading-none my-1">{item.dayNum}</span>
                            <span className="text-xs font-normal text-text-light">{item.monthName}</span>
                        </div>

                        <div className="flex-1 flex flex-col justify-center gap-1.5">
                            <div className="flex items-center gap-2">
                                <span className="h-[10px] w-[10px] rounded-full border-2 border-blue-440 bg-white shrink-0" />
                                <span className="text-base font-bold text-brand-darker leading-none">{item.time}</span>
                            </div>
                            <div className="pl-[18px] text-sm text-text-sidebar-muted">
                                {item.title}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
