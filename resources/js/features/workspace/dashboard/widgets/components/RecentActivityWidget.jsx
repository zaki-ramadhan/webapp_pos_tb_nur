import DashboardWidgetEmptyState from '@/features/workspace/dashboard/widgets/DashboardWidgetEmptyState';

export function RecentActivityWidget({ widget }) {
    const items = widget.items ?? [];

    if (!items.length) {
        return <DashboardWidgetEmptyState title="Belum ada data" description="Belum ada riwayat aktivitas." />;
    }

    const dateGroups = [];
    items.forEach((item) => {
        const dateKey = `${item.dayName}-${item.dayNum}-${item.monthName}`;
        let group = dateGroups.find((g) => g.key === dateKey);
        if (!group) {
            group = {
                key: dateKey,
                dayName: item.dayName,
                dayNum: item.dayNum,
                monthName: item.monthName,
                activities: []
            };
            dateGroups.push(group);
        }
        group.activities.push(item);
    });

    return (
        <div className="flex h-full flex-col gap-4 min-h-0">
            <div className="flex-1 overflow-y-auto pr-1.5 [scrollbar-width:thin]">
                {dateGroups.map((group) => (
                    <div key={group.key} className="flex gap-6 py-4 border-b border-table-row-border last:border-b-0 first:pt-0 items-start">
                        {/* Left Column: Date Block */}
                        <div className="flex flex-col items-center text-center min-w-[56px] shrink-0 pt-0.5 select-none">
                            <span className="text-xs font-normal text-black">{group.dayName}</span>
                            <span className="text-4xl font-normal text-slate-800 leading-none my-1">{group.dayNum}</span>
                            <span className="text-xs font-normal text-black">{group.monthName}</span>
                        </div>

                        {/* Right Column: Activities with Timeline Graph */}
                        <div className="flex-1 flex flex-col min-w-0 relative pl-5">
                            {/* Vertical Line */}
                            {group.activities.length > 1 && (
                                <div className="absolute left-[4.5px] top-1.5 bottom-1.5 w-[1px] bg-slate-200" />
                            )}

                            {group.activities.map((activity, index) => (
                                <div key={activity.id ?? index} className="relative flex flex-col gap-1 pb-4 last:pb-0">
                                    {/* Hollow Blue Circle */}
                                    <span className="absolute -left-[20px] top-[3px] h-2.5 w-2.5 rounded-full border-2 border-blue-500 bg-white z-10 shrink-0" />
                                    
                                    {/* Time */}
                                    <div className="text-sm font-semibold text-slate-900 leading-none">
                                        {activity.time}
                                    </div>

                                    {/* Description */}
                                    <div className="text-[13px] text-slate-500 font-normal leading-relaxed break-words mt-0.5">
                                        {activity.title}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
