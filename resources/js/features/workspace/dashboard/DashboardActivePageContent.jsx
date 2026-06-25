import DashboardToolbar from '@/features/workspace/dashboard/DashboardToolbar';
import DashboardWidgetGrid from '@/features/workspace/dashboard/DashboardWidgetGrid';
import renderWorkspaceActivePage from '@/features/workspace/dashboard/renderWorkspaceActivePage';
import { FormErrorProvider } from '@/components/ui/FormErrorContext';

export default function DashboardActivePageContent({
    dashboard,
    widgets,
    isLoading = false,
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
    handleRemoveWidget,
    activePage,
    activePageMode,
    activeLevel2Tab,
    detailTabOpeners,
    createDetailTabOpener,
    handleOpenDefaultContentTab,
    handleCloseDetailTab,
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

                <div className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-tab-active-bg px-1.5 py-1.5 sm:px-2 sm:py-2">
                    <DashboardWidgetGrid
                        widgets={activeDashboardWidgets}
                        onRefreshWidget={handleRefreshWidget}
                        onRenameWidget={handleRenameWidget}
                        onRemoveWidget={handleRemoveWidget}
                        isLoading={isLoading}
                    />
                </div>
            </>
        );
    }

    return (
        <div className="min-h-0 min-w-0 flex-1 flex flex-col bg-tab-active-bg px-1 pb-2 pt-0 sm:px-2 sm:pb-2.5 lg:pb-3 overflow-y-auto">
            <FormErrorProvider>
                {renderWorkspaceActivePage({
                    activePage,
                    activePageMode,
                    activeLevel2Tab,
                    detailTabOpeners,
                    createDetailTabOpener,
                    handleOpenDefaultContentTab,
                    handleCloseDetailTab,
                })}
            </FormErrorProvider>
        </div>
    );
}
