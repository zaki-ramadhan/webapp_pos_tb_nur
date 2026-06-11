import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    hasDirtyTabsForPage,
    withDirtyLabel,
} from '@/features/workspace/dashboard/WorkspaceDraftState';
import {
    buildInitialLevel2ContentTabsState,
    buildInitialLevel2TabsState,
    buildTabItems,
    resolveActivePage,
    resolveActivePageContentTabs,
    resolveLevel2State,
} from '@/features/workspace/dashboard/dashboardPageState';
import {
    loadWorkspacePageState,
    saveWorkspacePageState,
} from '@/features/workspace/dashboard/workspacePagePersistence';
import mergeWorkspacePageConfigs from '@/features/workspace/dashboard/mergeWorkspacePageConfigs';
import { isWorkspacePageInactive } from '@/features/workspace/shared/workspaceAvailability';
import useWorkspaceDirtyState from './useWorkspaceDirtyState';
import useWorkspaceURLSync from './useWorkspaceURLSync';
import useWorkspaceTabs from './useWorkspaceTabs';

export default function useWorkspacePageState({ dashboard, onCloseMobileWorkspaceMenu }) {
    const preferences = useMemo(() => dashboard.preferences ?? {}, [dashboard.preferences]);
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
                preferences,
            }),
        [dashboardPage, initialLevel2ContentTabs, initialLevel2Tabs, pages, preferences],
    );

    const [activePanelId, setActivePanelId] = useState(null);
    const [openPages, setOpenPages] = useState(initialWorkspacePageState.openPages);
    const [activePageId, setActivePageId] = useState(initialWorkspacePageState.activePageId);
    const [pageOpeningLoading, setPageOpeningLoading] = useState(null);
    
    // Delegate dirty tab state management to custom hook
    const {
        dirtyTabs,
        clearPageDirty,
        clearTabDirty,
        draftStateValue,
    } = useWorkspaceDirtyState();

    const [pendingCloseRequest, setPendingCloseRequest] = useState(null);

    const activePage = resolveActivePage(openPages, activePageId, dashboardPage);

    // Hoisted helper closure for page closing
    function closePageNow(pageId) {
        if (pageId === dashboardPage.id) {
            return;
        }

        clearPageDirty(pageId);

        // Clear cached resource data for this page when it is closed
        if (typeof window !== 'undefined' && typeof window.__clearBackendCache === 'function') {
            window.__clearBackendCache(pageId);
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

    const {
        activeLevel2Tabs,
        setActiveLevel2Tabs,
        pageLevel2ContentTabs,
        setPageLevel2ContentTabs,
        handleOpenContentTab,
        handleOpenDefaultContentTab,
        detailTabBuilders,
        detailTabOpeners,
        createDetailTabOpener,
        handleSelectLevel2Tab,
        closeLevel2TabNow,
        requestCloseLevel2Tab,
        handleCloseDetailTab,
    } = useWorkspaceTabs({
        pages,
        initialLevel2Tabs,
        initialLevel2ContentTabs,
        initialActiveLevel2Tabs: initialWorkspacePageState.activeLevel2Tabs,
        initialPageLevel2ContentTabs: initialWorkspacePageState.pageLevel2ContentTabs,
        dirtyTabs,
        clearTabDirty,
        closePageNow,
        activePage,
        setPendingCloseRequest,
    });

    const activePageContentTabs = resolveActivePageContentTabs(activePage, pageLevel2ContentTabs);
    const isDashboardPageActive = activePage.id === dashboardPage.id;
    const {
        level2Tabs,
        activeLevel2TabId,
        activeLevel2Tab,
        activePageMode,
    } = resolveLevel2State(activePage, activePageContentTabs, activeLevel2Tabs);

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
    }, [dashboardPage, initialLevel2ContentTabs, initialLevel2Tabs, pages, setActiveLevel2Tabs, setPageLevel2ContentTabs]);

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

    const openPageById = useCallback((pageId) => {
        if (pageId !== dashboardPage.id && isWorkspacePageInactive(pageId, preferences)) {
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

        setOpenPages((currentPages) => (pageAlreadyOpen ? currentPages : [...currentPages, nextPage]));
        setActivePageId(nextPage.id);
        setActivePanelId(null);
        onCloseMobileWorkspaceMenu?.();
    }, [dashboardPage.id, pages, openPages, onCloseMobileWorkspaceMenu, preferences]);

    function handleSelectPanelItem(item) {
        openPageById(item.id);
    }

    const tabItems = useMemo(
        () =>
            buildTabItems(openPages, dashboardPage.id).map((tab) => ({
                ...tab,
                label: withDirtyLabel(tab.label, hasDirtyTabsForPage(dirtyTabs, tab.id)),
            })),
        [dashboardPage.id, dirtyTabs, openPages],
    );

    const decoratedLevel2Tabs = useMemo(
        () =>
            level2Tabs.map((tab) => ({
                ...tab,
                label: withDirtyLabel(tab.label, Boolean(dirtyTabs?.[activePage.id]?.[tab.id])),
                title: withDirtyLabel(tab.title ?? tab.label, Boolean(dirtyTabs?.[activePage.id]?.[tab.id])),
            })),
        [activePage.id, dirtyTabs, level2Tabs],
    );

    function requestClosePage(pageId) {
        if (pageId === dashboardPage.id) {
            return;
        }

        if (!hasDirtyTabsForPage(dirtyTabs, pageId)) {
            closePageNow(pageId);
            return;
        }

        setPendingCloseRequest({
            type: 'page',
            pageId,
        });
    }

    useEffect(() => {
        function handleOpenPage(e) {
            const { pageId, recordId, tabLabel, label } = e.detail || {};
            if (!pageId) return;

            openPageById(pageId);

            if (recordId != null) {
                const buildTab = detailTabBuilders[pageId];
                if (buildTab) {
                    const tabItem = buildTab({
                        recordId,
                        tabLabel: tabLabel ?? label,
                        label: label,
                    });
                    handleOpenContentTab(pageId, tabItem);
                }
            }
        }
        window.addEventListener('workspace:open-page', handleOpenPage);
        return () => window.removeEventListener('workspace:open-page', handleOpenPage);
    }, [openPageById, detailTabBuilders, handleOpenContentTab]);

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

    function handleConfirmPendingClose() {
        if (!pendingCloseRequest) {
            return;
        }

        if (pendingCloseRequest.type === 'page') {
            closePageNow(pendingCloseRequest.pageId);
        }

        if (pendingCloseRequest.type === 'level2-tab') {
            closeLevel2TabNow(pendingCloseRequest.tabId);
        }

        setPendingCloseRequest(null);
    }

    useWorkspaceURLSync({
        activePageId,
        dashboardPageId: dashboardPage.id,
        pages,
        openPageById,
    });

    return {
        activePanelId,
        setActivePanelId,
        openPages,
        activePageId,
        setActivePageId,
        pageOpeningLoading,
        pendingCloseRequest,
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
    };
}
