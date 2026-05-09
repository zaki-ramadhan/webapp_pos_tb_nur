import DashboardToolbar from '@/features/workspace/dashboard/DashboardToolbar';
import DashboardWidgetGrid from '@/features/workspace/dashboard/DashboardWidgetGrid';
import renderWorkspaceActivePage from '@/features/workspace/dashboard/renderWorkspaceActivePage';

export default function DashboardActivePageContent({
    dashboard,
    dashboardItems,
    selectedDashboardId,
    isDashboardActionsOpen,
    handleOpenWidgetLibrary,
    handleSelectDashboard,
    handleSelectDashboardAction,
    setIsDashboardActionsOpen,
    activeDashboardWidgets,
    handleRefreshWidget,
    handleRenameWidget,
    activePage,
    activePageMode,
    activeLevel2Tab,
    detailTabOpeners,
    createDetailTabOpener,
    handleOpenDefaultContentTab,
    isDashboardPageActive,
}) {
    if (isDashboardPageActive) {
        return (
            <>
                <DashboardToolbar
                    dashboard={{
                        ...dashboard,
                        toolbar: {
                            ...dashboard.toolbar,
                            dashboards: dashboardItems,
                            selectedDashboardId,
                            dashboardActions: {
                                ...dashboard.toolbar.dashboardActions,
                                open: isDashboardActionsOpen,
                            },
                            onOpenWidgetLibrary: handleOpenWidgetLibrary,
                            onSelectDashboard: handleSelectDashboard,
                            onToggleDashboardActions: () =>
                                setIsDashboardActionsOpen((currentValue) => !currentValue),
                            onCloseDashboardActions: () => setIsDashboardActionsOpen(false),
                            onSelectDashboardAction: handleSelectDashboardAction,
                        },
                    }}
                />

                <div className="min-h-0 min-w-0 flex-1 bg-[rgba(243,246,251,0.82)] px-2 py-2 sm:px-3 sm:py-3">
                    <DashboardWidgetGrid
                        widgets={activeDashboardWidgets}
                        onRefreshWidget={handleRefreshWidget}
                        onRenameWidget={handleRenameWidget}
                    />
                </div>
            </>
        );
    }

    return (
        <div className="min-h-0 flex-1 overflow-visible bg-[rgba(243,246,251,0.82)] px-2 pb-2 pt-0 sm:px-2.5 sm:pb-2.5 lg:px-3 lg:pb-3">
            {renderWorkspaceActivePage({
                activePage,
                activePageMode,
                activeLevel2Tab,
                detailTabOpeners,
                createDetailTabOpener,
                handleOpenDefaultContentTab,
            })}
        </div>
    );
}
