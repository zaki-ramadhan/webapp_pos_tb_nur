import { PlusIcon } from '@/features/workspace/shared/Icons';

export default function DashboardToolbar({ dashboard }) {
    return (
        <div className="flex flex-col gap-3 border-b border-tab-overflow-panel-border bg-white px-3 py-2 sm:flex-row sm:items-center sm:px-4">
            <div className="flex min-w-0 shrink-0 items-center">
                <button
                    type="button"
                    onClick={dashboard.toolbar.onOpenWidgetLibrary}
                    className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-[4px] border border-brand-blue-border bg-info-border px-4 text-sm font-medium text-brand-blue-dark sm:w-auto sm:min-w-[180px] sm:text-sm md:min-w-[205px] md:gap-3 md:px-5 md:text-base"
                >
                    <PlusIcon />
                    {dashboard.toolbar.widgetLabel}
                </button>
            </div>
        </div>
    );
}
