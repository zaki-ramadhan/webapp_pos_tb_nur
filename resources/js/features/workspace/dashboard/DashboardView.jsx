import { forwardRef, useCallback, useImperativeHandle, useMemo } from 'react';
import { router } from '@inertiajs/react';

import DashboardActivePageContent from '@/features/workspace/dashboard/DashboardActivePageContent';
import DashboardSidebar from '@/features/workspace/dashboard/DashboardSidebar';
import { WorkspaceDraftStateProvider } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { buildWidgetTemplateMap } from '@/features/workspace/dashboard/dashboardPersistence';
import DashboardPageTabs from '@/features/workspace/dashboard/DashboardPageTabs';
import DashboardViewModals from '@/features/workspace/dashboard/DashboardViewModals';
import useDashboardPreferencesState from '@/features/workspace/dashboard/useDashboardPreferencesState';

import useWorkspacePageState from './hooks/useWorkspacePageState';

const DashboardView = forwardRef(function DashboardView(
    {
        dashboard,
        widgets,
        topbarHeight = 0,
        mobileWorkspaceMenuOpen = false,
        onCloseMobileWorkspaceMenu,
    },
    ref,
) {
    const {
        activePanelId,
        setActivePanelId,
        openPages,
        activePageId,
        setActivePageId,
        pageOpeningLoading,
        pendingCloseRequest,
        setPendingCloseRequest,
        handleTogglePanel,
        openPageById,
        handleSelectPanelItem,
        activePage,
        activePageContentTabs,
        isDashboardPageActive,
        activeLevel2TabId,
        activeLevel2Tab,
        activePageMode,
        draftStateValue,
        tabItems,
        decoratedLevel2Tabs,
        requestClosePage,
        handleOpenDefaultContentTab,
        detailTabOpeners,
        createDetailTabOpener,
        handleSelectLevel2Tab,
        requestCloseLevel2Tab,
        handleCloseDetailTab,
        handleConfirmPendingClose,
    } = useWorkspacePageState({
        dashboard,
        onCloseMobileWorkspaceMenu,
    });

    useImperativeHandle(ref, () => ({
        openPage: openPageById,
    }));

    const widgetTemplateMap = useMemo(() => buildWidgetTemplateMap(dashboard.widgets ?? []), [dashboard.widgets]);
    const {
        isWidgetLibraryLoading,
        isWidgetLibraryOpen,
        setIsWidgetLibraryOpen,
        isDashboardActionsOpen,
        setIsDashboardActionsOpen,
        activeDashboardModal,
        setActiveDashboardModal,
        dashboardItems,
        selectedDashboardId,
        activeDashboardWidgets,
        selectedDashboard,
        handleOpenWidgetLibrary,
        handleSelectDashboardAction,
        handleCreateDashboard,
        handleUpdateDashboard,
        handleDeleteDashboard,
        handleSelectDashboard,
        handleRenameWidget,
        handleAddWidget,
        handleRemoveWidget,
        handleRefreshWidget,
        filteredLibraryItems,
    } = useDashboardPreferencesState({
        dashboard,
        widgets,
        widgetTemplateMap,
    });

    return (
        <WorkspaceDraftStateProvider value={draftStateValue}>
            <section className="flex h-full min-w-0 flex-1 flex-col lg:flex-row lg:items-stretch">
                <div className="min-h-0 shrink-0 self-stretch lg:w-[58px]">
                    <DashboardSidebar
                        sidebar={dashboard.sidebar}
                        activePanelId={activePanelId}
                        onTogglePanel={handleTogglePanel}
                        onClosePanel={() => setActivePanelId(null)}
                        onSelectPanelItem={handleSelectPanelItem}
                        desktopTopOffset={topbarHeight}
                        mobileMenuOpen={mobileWorkspaceMenuOpen}
                        onCloseMobileMenu={onCloseMobileWorkspaceMenu}
                        preferences={dashboard.preferences}
                    />
                </div>

                <div
                    className="flex min-h-0 min-w-0 flex-1 flex-col border border-[#d3d9e7] border-t-0 bg-white/96 overflow-hidden lg:border-l-0 lg:border-t"
                >
                    <DashboardPageTabs
                        tabs={tabItems}
                        activePage={activePage}
                        onSelectPage={setActivePageId}
                        onClosePage={requestClosePage}
                        level2Tabs={decoratedLevel2Tabs}
                        activeLevel2TabId={activeLevel2TabId}
                        onSelectLevel2Tab={handleSelectLevel2Tab}
                        onCloseLevel2Tab={requestCloseLevel2Tab}
                    />

                    <DashboardActivePageContent
                        dashboard={dashboard}
                        widgets={widgets}
                        isLoading={!widgets}
                        dashboardItems={dashboardItems}
                        selectedDashboardId={selectedDashboardId}
                        isDashboardActionsOpen={isDashboardActionsOpen}
                        handleOpenWidgetLibrary={handleOpenWidgetLibrary}
                        handleSelectDashboard={handleSelectDashboard}
                        handleSelectDashboardAction={handleSelectDashboardAction}
                        setIsDashboardActionsOpen={setIsDashboardActionsOpen}
                        activeDashboardWidgets={activeDashboardWidgets}
                        handleRefreshWidget={handleRefreshWidget}
                        handleRenameWidget={handleRenameWidget}
                        handleRemoveWidget={handleRemoveWidget}
                        activePage={activePage}
                        activePageMode={activePageMode}
                        activeLevel2Tab={activeLevel2Tab}
                        detailTabOpeners={detailTabOpeners}
                        createDetailTabOpener={createDetailTabOpener}
                        handleOpenDefaultContentTab={handleOpenDefaultContentTab}
                        handleCloseDetailTab={handleCloseDetailTab}
                        isDashboardPageActive={isDashboardPageActive}
                    />
                </div>
            </section>

            <DashboardViewModals
                dashboard={dashboard}
                isWidgetLibraryLoading={isWidgetLibraryLoading}
                pageOpeningLoading={pageOpeningLoading}
                isWidgetLibraryOpen={isWidgetLibraryOpen}
                setIsWidgetLibraryOpen={setIsWidgetLibraryOpen}
                handleAddWidget={handleAddWidget}
                activeDashboardModal={activeDashboardModal}
                setActiveDashboardModal={setActiveDashboardModal}
                handleCreateDashboard={handleCreateDashboard}
                selectedDashboard={selectedDashboard}
                handleUpdateDashboard={handleUpdateDashboard}
                handleDeleteDashboard={handleDeleteDashboard}
                unsavedChangesModalOpen={Boolean(pendingCloseRequest)}
                onCloseUnsavedChangesModal={() => setPendingCloseRequest(null)}
                onConfirmUnsavedChangesModal={handleConfirmPendingClose}
                filteredLibraryItems={filteredLibraryItems}
            />
        </WorkspaceDraftStateProvider>
    );
});

export default DashboardView;
