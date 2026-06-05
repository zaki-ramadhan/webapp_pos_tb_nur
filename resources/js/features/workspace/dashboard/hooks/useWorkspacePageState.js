import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    hasAnyDirtyTabs,
    hasDirtyTabsForPage,
    withDirtyLabel,
} from '@/features/workspace/dashboard/WorkspaceDraftState';
import {
    buildInitialLevel2ContentTabsState,
    buildInitialLevel2TabsState,
    buildTabItems,
    createDetailTabOpeners,
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

export default function useWorkspacePageState({ dashboard, onCloseMobileWorkspaceMenu }) {
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
    const [dirtyTabs, setDirtyTabs] = useState({});
    const [pendingCloseRequest, setPendingCloseRequest] = useState(null);

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

    const openPageById = useCallback((pageId) => {
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
    }, [dashboardPage.id, pages, openPages, onCloseMobileWorkspaceMenu]);

    function handleSelectPanelItem(item) {
        openPageById(item.id);
    }

    const activePage = resolveActivePage(openPages, activePageId, dashboardPage);
    const activePageContentTabs = resolveActivePageContentTabs(activePage, pageLevel2ContentTabs);
    const isDashboardPageActive = activePage.id === dashboardPage.id;
    const {
        level2Tabs,
        activeLevel2TabId,
        activeLevel2Tab,
        activePageMode,
    } = resolveLevel2State(activePage, activePageContentTabs, activeLevel2Tabs);

    const setTabDirty = useCallback((pageId, tabId) => {
        if (!pageId || !tabId) {
            return;
        }

        setDirtyTabs((currentTabs) => {
            if (currentTabs?.[pageId]?.[tabId]) {
                return currentTabs;
            }

            return {
                ...currentTabs,
                [pageId]: {
                    ...(currentTabs[pageId] ?? {}),
                    [tabId]: true,
                },
            };
        });
    }, []);

    const clearTabDirty = useCallback((pageId, tabId) => {
        if (!pageId || !tabId) {
            return;
        }

        setDirtyTabs((currentTabs) => {
            if (!currentTabs?.[pageId]?.[tabId]) {
                return currentTabs;
            }

            const nextPageTabs = { ...(currentTabs[pageId] ?? {}) };
            delete nextPageTabs[tabId];

            if (Object.keys(nextPageTabs).length) {
                return {
                    ...currentTabs,
                    [pageId]: nextPageTabs,
                };
            }

            const nextTabs = { ...currentTabs };
            delete nextTabs[pageId];
            return nextTabs;
        });
    }, []);

    const clearPageDirty = useCallback((pageId) => {
        if (!pageId) {
            return;
        }

        setDirtyTabs((currentTabs) => {
            if (!currentTabs?.[pageId]) {
                return currentTabs;
            }

            const nextTabs = { ...currentTabs };
            delete nextTabs[pageId];
            return nextTabs;
        });
    }, []);

    const draftStateValue = useMemo(
        () => ({
            dirtyTabs,
            setTabDirty,
            clearTabDirty,
            clearPageDirty,
        }),
        [clearPageDirty, clearTabDirty, dirtyTabs, setTabDirty],
    );

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

    function closePageNow(pageId) {
        if (pageId === dashboardPage.id) {
            return;
        }

        clearPageDirty(pageId);
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

    const handleOpenContentTab = useCallback((pageId, tab) => {
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
    }, [pages, initialLevel2ContentTabs]);

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

    function handleSelectLevel2Tab(tabId) {
        if (!activePage.subtab && !activePage.detailTabsOnly) {
            return;
        }

        setActiveLevel2Tabs((currentTabs) => ({
            ...currentTabs,
            [activePage.id]: tabId,
        }));
    }

    function closeLevel2TabNow(tabId) {
        clearTabDirty(activePage.id, tabId);
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

            closePageNow(activePage.id);
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

    function requestCloseLevel2Tab(tabId) {
        if (!tabId) {
            return;
        }

        if (!dirtyTabs?.[activePage.id]?.[tabId]) {
            closeLevel2TabNow(tabId);
            return;
        }

        setPendingCloseRequest({
            type: 'level2-tab',
            pageId: activePage.id,
            tabId,
        });
    }

    function handleCloseDetailTab(pageId, recordId) {
        if (!pageId || recordId == null) {
            return;
        }

        const tabId = `${pageId}-detail-${recordId}`;
        clearTabDirty(pageId, tabId);

        setPageLevel2ContentTabs((currentTabs) => {
            const pageTabs = currentTabs[pageId] ?? initialLevel2ContentTabs[pageId] ?? [];
            const remainingTabs = pageTabs.filter((tab) => tab.id !== tabId);

            if (remainingTabs.length === pageTabs.length) {
                return currentTabs;
            }

             setActiveLevel2Tabs((currentLevel2Tabs) => {
                if (currentLevel2Tabs[pageId] !== tabId) {
                    return currentLevel2Tabs;
                }

                return {
                    ...currentLevel2Tabs,
                    [pageId]: remainingTabs.length
                        ? remainingTabs[remainingTabs.length - 1].id
                        : initialLevel2Tabs[pageId],
                };
            });

            return {
                ...currentTabs,
                [pageId]: remainingTabs,
            };
        });
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

    useEffect(() => {
        if (!hasAnyDirtyTabs(dirtyTabs)) {
            return undefined;
        }

        function handleBeforeUnload(event) {
            event.preventDefault();
            event.returnValue = '';
        }

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [dirtyTabs]);

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

    // Sync browser URL with the active page to support bookmarking/sharing links
    useEffect(() => {
        const url = new URL(window.location.href);
        if (activePageId && activePageId !== dashboardPage.id) {
            url.searchParams.set('page', activePageId);
        } else {
            url.searchParams.delete('page');
        }
        window.history.replaceState({}, '', url.toString());
    }, [activePageId, dashboardPage.id]);

    // Initialize the active page from the URL query parameter on mount
    const hasInitializedFromUrl = useRef(false);
    useEffect(() => {
        if (hasInitializedFromUrl.current) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const urlPageId = params.get('page');
        if (urlPageId && pages[urlPageId]) {
            hasInitializedFromUrl.current = true;
            openPageById(urlPageId);
        }
    }, [pages, openPageById]);

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
