import { PlusIcon } from '@/features/workspace/shared/Icons';

export default function DashboardToolbar({ dashboard }) {
    return (
        <div className="flex flex-col gap-3 border-b border-tab-overflow-panel-border bg-white px-3 py-2 sm:flex-row sm:items-center sm:px-4">
            <div className="flex min-w-0 shrink-0 items-center">
                <button
                    type="button"
                    onClick={dashboard.toolbar.onOpenWidgetLibrary}
                    className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] border border-brand-blue bg-brand-blue-light px-3 text-xs font-semibold text-brand-blue hover:bg-brand-blue-border-light/20 sm:w-auto sm:px-4 sm:text-sm"
                >
                    <PlusIcon className="h-4 w-4 shrink-0" />
                    {dashboard.toolbar.widgetLabel}
                </button>
            </div>
        </div>
    );
}
