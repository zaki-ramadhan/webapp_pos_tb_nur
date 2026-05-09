import { useRef } from 'react';

import SelectField from '@/components/ui/SelectField';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import { KebabIcon, PencilIcon, PlusIcon } from '@/features/workspace/shared/Icons';

export default function DashboardToolbar({ dashboard }) {
    const actionsButtonRef = useRef(null);

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

            <div className="flex min-w-0 items-center gap-3 sm:ml-auto sm:w-full sm:max-w-[430px] sm:justify-end md:gap-4">
                <SelectField
                    value={dashboard.toolbar.selectedDashboardId}
                    onChange={(event) => dashboard.toolbar.onSelectDashboard?.(event.target.value)}
                    className="h-[36px] min-w-0 flex-1 rounded-[4px]"
                    selectClassName="truncate pr-8 text-[13px] md:text-sm"
                >
                    {dashboard.toolbar.dashboards.map((dashboardOption) => (
                        <option key={dashboardOption.id} value={dashboardOption.id}>
                            {dashboardOption.label}
                        </option>
                    ))}
                </SelectField>

                <div className="relative shrink-0">
                    <button
                        ref={actionsButtonRef}
                        type="button"
                        onClick={dashboard.toolbar.onToggleDashboardActions}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-[#5e6681]"
                        aria-label={dashboard.toolbar.dashboardActions.label}
                    >
                        <KebabIcon />
                    </button>

                    <DropdownMenu
                        open={dashboard.toolbar.dashboardActions.open}
                        onClose={dashboard.toolbar.onCloseDashboardActions}
                        anchorRef={actionsButtonRef}
                        widthClassName="w-[184px]"
                        className="z-[60]"
                    >
                        <div className="flex flex-col">
                            {dashboard.toolbar.dashboardActions.items.map((item) => (
                                <DropdownMenuItem
                                    key={item.id}
                                    onClick={() => dashboard.toolbar.onSelectDashboardAction?.(item.id)}
                                    icon={item.id === 'add' ? <PlusIcon className="h-4 w-4" /> : <PencilIcon />}
                                    className="text-[12px] font-medium text-[#1f2536] md:text-[13px]"
                                >
                                    {item.label}
                                </DropdownMenuItem>
                            ))}
                        </div>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
