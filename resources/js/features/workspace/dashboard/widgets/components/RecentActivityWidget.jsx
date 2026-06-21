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
                    <div key={item.id ?? index} className="flex gap-6 py-4 border-b border-[#edf1f6] last:border-b-0 first:pt-0">
                        <div className="flex flex-col items-center justify-center text-center min-w-[56px] shrink-0">
                            <span className="text-xs font-normal text-[#7c839b]">{item.dayName}</span>
                            <span className="text-4xl font-bold text-[#434a65] leading-none my-1">{item.dayNum}</span>
                            <span className="text-xs font-normal text-[#7c839b]">{item.monthName}</span>
                        </div>

                        <div className="flex-1 flex flex-col justify-center gap-1.5">
                            <div className="flex items-center gap-2">
                                <span className="h-[10px] w-[10px] rounded-full border-2 border-[#2563eb] bg-white shrink-0" />
                                <span className="text-base font-bold text-[#1f2536] leading-none">{item.time}</span>
                            </div>
                            <div className="pl-[18px] text-sm text-[#4b5563]">
                                {item.title}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
