import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';

import DashboardActivePageContent from '@/features/workspace/dashboard/DashboardActivePageContent';
import DashboardSidebar from '@/features/workspace/dashboard/DashboardSidebar';
import {
    buildWidgetTemplateMap,
} from '@/features/workspace/dashboard/dashboardPersistence';
import {
    resolvePageLevel2Actions,
} from '@/features/workspace/dashboard/dashboardLevel2Tabs';
import {
    buildInitialLevel2ContentTabsState,
    buildInitialLevel2TabsState,
    buildTabItems,
    createDetailTabOpeners,
    resolveActivePage,
    resolveActivePageContentTabs,
    resolveLevel2State,
} from '@/features/workspace/dashboard/dashboardPageState';
import mergeWorkspacePageConfigs from '@/features/workspace/dashboard/mergeWorkspacePageConfigs';
import DashboardPageTabs from '@/features/workspace/dashboard/DashboardPageTabs';
import DashboardViewModals from '@/features/workspace/dashboard/DashboardViewModals';
import useDashboardPreferencesState from '@/features/workspace/dashboard/useDashboardPreferencesState';
import {
    loadWorkspacePageState,
    saveWorkspacePageState,
} from '@/features/workspace/dashboard/workspacePagePersistence';
import { isWorkspacePageInactive } from '@/features/workspace/shared/workspaceAvailability';

const DashboardView = forwardRef(function DashboardView(
    {
        dashboard,
        topbarHeight = 0,
        mobileWorkspaceMenuOpen = false,
        onCloseMobileWorkspaceMenu,
    },
    ref,
) {
    const pages = useMemo(() => mergeWorkspacePageConfigs(dashboard.pages), [dashboard.pages]);
    const dashboardPage = pages.dashboard;
    const initialLevel2Tabs = useMemo(() => buildInitialLevel2TabsState(pages), [pages]);
    const initialLevel2ContentTabs = useMemo(() => buildInitialLevel2ContentTabsState(pages), [pages]);
    const initialWorkspacePageState = useMemo(
        () =>
            loadWorkspacePageState({
                pages,
                dashboardPage,
                initialLevel2Tabs,
                initialLevel2ContentTabs,
            }),
        [dashboardPage, initialLevel2ContentTabs, initialLevel2Tabs, pages],
    );

    const [activePanelId, setActivePanelId] = useState(null);
    const [openPages, setOpenPages] = useState(initialWorkspacePageState.openPages);
    const [activePageId, setActivePageId] = useState(initialWorkspacePageState.activePageId);
    const [activeLevel2Tabs, setActiveLevel2Tabs] = useState(initialWorkspacePageState.activeLevel2Tabs);
    const [pageLevel2ContentTabs, setPageLevel2ContentTabs] = useState(initialWorkspacePageState.pageLevel2ContentTabs);
    const [pageOpeningLoading, setPageOpeningLoading] = useState(null);

    useEffect(() => {
        setOpenPages((currentPages) => {
            const nextPages = currentPages
                .map((page) => pages[page.id])
                .filter(Boolean);

            return nextPages.length ? nextPages : [dashboardPage];
        });

        setActivePageId((currentPageId) => (pages[currentPageId] ? currentPageId : dashboardPage.id));
        setActiveLevel2Tabs((currentTabs) => ({
            ...initialLevel2Tabs,
            ...currentTabs,
        }));
        setPageLevel2ContentTabs((currentTabs) => ({
            ...initialLevel2ContentTabs,
            ...currentTabs,
        }));
    }, [dashboardPage, initialLevel2ContentTabs, initialLevel2Tabs, pages]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            saveWorkspacePageState({
                openPages,
                activePageId,
                activeLevel2Tabs,
                pageLevel2ContentTabs,
            });
        }, 120);

        return () => clearTimeout(timeoutId);
    }, [activeLevel2Tabs, activePageId, openPages, pageLevel2ContentTabs]);

    useEffect(() => {
        if (openPages.some((page) => page.id === activePageId)) {
            return;
        }

        setActivePageId(dashboardPage.id);
    }, [activePageId, dashboardPage.id, openPages]);

    function handleTogglePanel(panelId) {
        setActivePanelId((currentPanelId) => (currentPanelId === panelId ? null : panelId));
    }

    const handleRefreshWidget = useCallback(
        async () =>
            new Promise((resolve) => {
                setTimeout(resolve, dashboard.toolbar.loadingOverlay.durationMs ?? 900);
            }),
        [dashboard.toolbar.loadingOverlay.durationMs],
    );
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
    } = useDashboardPreferencesState({
        dashboard,
        widgetTemplateMap,
    });

    function openPageById(pageId) {
        if (pageId !== dashboardPage.id && isWorkspacePageInactive(pageId)) {
            setActivePanelId(null);
            onCloseMobileWorkspaceMenu?.();
            return;
        }

        const nextPage = pages[pageId];

        if (!nextPage) {
            setActivePanelId(null);
            return;
        }

        const pageAlreadyOpen = openPages.some((page) => page.id === nextPage.id);

        if (nextPage.openLoading && !pageAlreadyOpen) {
            setActivePanelId(null);
            setPageOpeningLoading({
                pageId: nextPage.id,
                loading: nextPage.openLoading,
            });
            return;
        }

        setOpenPages((currentPages) => (pageAlreadyOpen ? currentPages : [...currentPages, nextPage]));
        setActivePageId(nextPage.id);
        setActivePanelId(null);
        onCloseMobileWorkspaceMenu?.();
    }

    function handleSelectPanelItem(item) {
        openPageById(item.id);
    }

    useImperativeHandle(ref, () => ({
        openPage: openPageById,
    }));
    const activePage = resolveActivePage(openPages, activePageId, dashboardPage);
    const activePageContentTabs = resolveActivePageContentTabs(activePage, pageLevel2ContentTabs);
    const tabItems = buildTabItems(openPages, dashboardPage.id);
    const isDashboardPageActive = activePage.id === dashboardPage.id;
    const {
        level2Tabs,
        activeLevel2TabId,
        activeLevel2Tab,
        activePageMode,
    } = resolveLevel2State(activePage, activePageContentTabs, activeLevel2Tabs);
    const activePageLevel2Actions = resolvePageLevel2Actions(activePage);

    function handleClosePage(pageId) {
        if (pageId === dashboardPage.id) {
            return;
        }

        setOpenPages((currentPages) => currentPages.filter((page) => page.id !== pageId));
        setPageLevel2ContentTabs((currentTabs) => ({
            ...currentTabs,
            [pageId]: initialLevel2ContentTabs[pageId] ?? [],
        }));
        setActiveLevel2Tabs((currentTabs) => ({
            ...currentTabs,
            [pageId]: initialLevel2Tabs[pageId] ?? currentTabs[pageId],
        }));
        setActivePageId((currentPageId) => (currentPageId === pageId ? dashboardPage.id : currentPageId));
    }

    function handleOpenContentTab(pageId, tab) {
        if (!pages[pageId]?.subtab && !pages[pageId]?.detailTabsOnly) {
            return;
        }

        setPageLevel2ContentTabs((currentTabs) => {
            const pageTabs = currentTabs[pageId] ?? initialLevel2ContentTabs[pageId] ?? [];

            if (pageTabs.some((item) => item.id === tab.id)) {
                return currentTabs;
            }

            return {
                ...currentTabs,
                [pageId]: [...pageTabs, tab],
            };
        });
        setActiveLevel2Tabs((currentTabs) => ({
            ...currentTabs,
            [pageId]: tab.id,
        }));
    }

    function handleOpenDefaultContentTab(pageId) {
        const page = pages[pageId];

        if (!page?.subtab) {
            return;
        }

        handleOpenContentTab(pageId, {
            id: page.subtab.id,
            kind: 'content',
            label: page.subtab.label,
            closable: true,
            tabType: 'create',
        });
    }
    const detailTabBuilders = useMemo(() => createDetailTabOpeners(pages), [pages]);
    const createDetailTabOpener = (pageId) => (detail) => {
        const buildTab = detailTabBuilders[pageId];

        if (!buildTab) {
            return;
        }

        handleOpenContentTab(pageId, buildTab(detail));
    };
    const detailTabOpeners = useMemo(
        () =>
            Object.fromEntries(
                Object.entries(detailTabBuilders).map(([pageId, buildTab]) => [
                    pageId,
                    (detail) => handleOpenContentTab(pageId, buildTab(detail)),
                ]),
            ),
        [detailTabBuilders],
    );

    function handleSelectLevel2Tab(tabId) {
        if (!activePage.subtab && !activePage.detailTabsOnly) {
            return;
        }

        setActiveLevel2Tabs((currentTabs) => ({
            ...currentTabs,
            [activePage.id]: tabId,
        }));
    }

    function handleCloseLevel2Tab(tabId) {
        const remainingTabs = activePageContentTabs.filter((tab) => tab.id !== tabId);

        if (remainingTabs.length === activePageContentTabs.length) {
            return;
        }

        if (!remainingTabs.length) {
            if (activePage.detailTabsOnly) {
                setPageLevel2ContentTabs((currentTabs) => ({
                    ...currentTabs,
                    [activePage.id]: [],
                }));
                setActiveLevel2Tabs((currentTabs) => ({
                    ...currentTabs,
                    [activePage.id]: initialLevel2Tabs[activePage.id],
                }));
                return;
            }

            handleClosePage(activePage.id);
            return;
        }

        setPageLevel2ContentTabs((currentTabs) => ({
            ...currentTabs,
            [activePage.id]: remainingTabs,
        }));

        if (activeLevel2TabId === tabId) {
            setActiveLevel2Tabs((currentTabs) => ({
                ...currentTabs,
                [activePage.id]: remainingTabs[remainingTabs.length - 1].id,
            }));
        }
    }

    useEffect(() => {
        if (!pageOpeningLoading) {
            return undefined;
        }

        const timeoutId = setTimeout(() => {
            const nextPage = pages[pageOpeningLoading.pageId];

            if (nextPage) {
                setOpenPages((currentPages) =>
                    currentPages.some((page) => page.id === nextPage.id)
                        ? currentPages
                        : [...currentPages, nextPage],
                );
                setActivePageId(nextPage.id);
            }

            setPageOpeningLoading(null);
        }, pageOpeningLoading.loading.durationMs ?? 700);

        return () => clearTimeout(timeoutId);
    }, [pageOpeningLoading, pages]);

    return (
        <>
            <section className="flex min-h-full min-w-0 flex-1 flex-col lg:flex-row lg:items-stretch">
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
                    />
                </div>

                <div
                    className="flex min-h-0 min-w-0 flex-1 flex-col border border-[#d3d9e7] border-t-0 bg-white/96 overflow-visible lg:border-l-0 lg:border-t"
                >
                    <DashboardPageTabs
                        tabs={tabItems}
                        activePage={activePage}
                        onSelectPage={setActivePageId}
                        onClosePage={handleClosePage}
                        level2Tabs={level2Tabs}
                        level2Actions={activePageLevel2Actions}
                        activeLevel2TabId={activeLevel2TabId}
                        onSelectLevel2Tab={handleSelectLevel2Tab}
                        onCloseLevel2Tab={handleCloseLevel2Tab}
                    />

                    <DashboardActivePageContent
                        dashboard={dashboard}
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
                        activePage={activePage}
                        activePageMode={activePageMode}
                        activeLevel2Tab={activeLevel2Tab}
                        detailTabOpeners={detailTabOpeners}
                        createDetailTabOpener={createDetailTabOpener}
                        handleOpenDefaultContentTab={handleOpenDefaultContentTab}
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
            />
        </>
    );
});

export default DashboardView;
