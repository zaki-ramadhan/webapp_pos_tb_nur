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
    renderedPages = [],
    activePageId,
    detailTabOpeners,
    createDetailTabOpener,
    handleOpenDefaultContentTab,
    handleCloseDetailTab,
}) {
    return (
        <div className="min-h-0 min-w-0 flex-1 flex flex-col overflow-y-auto">
            {/* Dashboard Widget View */}
            <div className={activePageId === 'dashboard' ? 'flex flex-1 flex-col min-h-0 min-w-0' : 'hidden'}>
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
            </div>

            {/* Halaman-halaman lainnya (Dirender paralel agar state tersimpan saat pindah tab level 1) */}
            {renderedPages.map(({ page, mode, activeLevel2Tab, level2Tabs }) => {
                if (page.id === 'dashboard') return null;

                const isCurrent = activePageId === page.id;
                const hasLevel2Tabs = level2Tabs?.length > 0;
                const ptClassName = hasLevel2Tabs ? 'pt-0' : 'pt-2 sm:pt-2.5';

                return (
                    <div
                        key={page.id}
                        className={isCurrent ? `min-h-0 min-w-0 flex-1 flex flex-col bg-tab-active-bg px-1 pb-2 sm:px-2 sm:pb-2.5 lg:pb-3 overflow-y-auto ${ptClassName}` : 'hidden'}
                    >
                        <FormErrorProvider>
                            {renderWorkspaceActivePage({
                                activePage: page,
                                activePageMode: mode,
                                activeLevel2Tab,
                                level2Tabs,
                                detailTabOpeners,
                                createDetailTabOpener,
                                handleOpenDefaultContentTab,
                                handleCloseDetailTab,
                            })}
                        </FormErrorProvider>
                    </div>
                );
            })}
        </div>
    );
}
