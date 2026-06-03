import { PlusIcon } from '@/features/workspace/shared/Icons';

export default function DashboardToolbar({ dashboard }) {
    return (
        <div className="flex flex-col gap-3 border-b border-[#d3d9e7] bg-white px-3 py-2 sm:flex-row sm:items-center sm:px-4">
            <div className="flex min-w-0 shrink-0 items-center">
                <button
                    type="button"
                    onClick={dashboard.toolbar.onOpenWidgetLibrary}
                    className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-[4px] border border-[#7aa2d5] bg-[#cfe3fd] px-4 text-[13px] font-medium text-[#215ea5] sm:w-auto sm:min-w-[180px] sm:text-[14px] md:min-w-[205px] md:gap-3 md:px-5 md:text-[15px]"
                >
                    <PlusIcon />
                    {dashboard.toolbar.widgetLabel}
                </button>
            </div>
        </div>
    );
}
