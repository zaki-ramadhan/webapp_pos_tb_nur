import { useState, useCallback, useMemo, useEffect } from 'react';
import {
    createDetailTabOpeners,
    resolveActivePageContentTabs,
} from '@/features/workspace/dashboard/dashboardPageState';

export default function useWorkspaceTabs({
    pages,
    initialLevel2Tabs,
    initialLevel2ContentTabs,
    initialActiveLevel2Tabs,
    initialPageLevel2ContentTabs,
    dirtyTabs,
    clearTabDirty,
    closePageNow,
    activePage,
    setPendingCloseRequest,
}) {
    const [activeLevel2Tabs, setActiveLevel2Tabs] = useState(initialActiveLevel2Tabs);
    const [pageLevel2ContentTabs, setPageLevel2ContentTabs] = useState(initialPageLevel2ContentTabs);

    useEffect(() => {
        function handleUpdateTabLabel(e) {
            const { pageId, tabId, label } = e.detail || {};
            if (!pageId || !tabId || !label) return;

            setPageLevel2ContentTabs((currentTabs) => {
                const pageTabs = currentTabs[pageId] ?? [];
                const updatedTabs = pageTabs.map((tab) =>
                    tab.id === tabId ? { ...tab, label } : tab
                );

                return {
                    ...currentTabs,
                    [pageId]: updatedTabs,
                };
            });
        }

        window.addEventListener('workspace:update-tab-label', handleUpdateTabLabel);
        return () => window.removeEventListener('workspace:update-tab-label', handleUpdateTabLabel);
    }, []);

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

    const handleOpenDefaultContentTab = useCallback((pageId) => {
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
    }, [pages, handleOpenContentTab]);

    const detailTabBuilders = useMemo(() => createDetailTabOpeners(pages), [pages]);
    
    const createDetailTabOpener = useCallback((pageId) => (detail) => {
        const buildTab = detailTabBuilders[pageId];

        if (!buildTab) {
            return;
        }

        handleOpenContentTab(pageId, buildTab(detail));
    }, [detailTabBuilders, handleOpenContentTab]);

    const detailTabOpeners = useMemo(
        () =>
            Object.fromEntries(
                Object.entries(detailTabBuilders).map(([pageId, buildTab]) => [
                    pageId,
                    (detail) => handleOpenContentTab(pageId, buildTab(detail)),
                ]),
            ),
        [detailTabBuilders, handleOpenContentTab],
    );

    const handleSelectLevel2Tab = useCallback((tabId) => {
        if (!activePage.subtab && !activePage.detailTabsOnly) {
            return;
        }

        setActiveLevel2Tabs((currentTabs) => ({
            ...currentTabs,
            [activePage.id]: tabId,
        }));
    }, [activePage.id, activePage.subtab, activePage.detailTabsOnly]);

    const closeLevel2TabNow = useCallback((tabId) => {
        clearTabDirty(activePage.id, tabId);
        
        const activePageContentTabs = resolveActivePageContentTabs(activePage, pageLevel2ContentTabs);
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

        const currentActiveTabId = activeLevel2Tabs[activePage.id] ?? initialLevel2Tabs[activePage.id];
        if (currentActiveTabId === tabId) {
            setActiveLevel2Tabs((currentTabs) => ({
                ...currentTabs,
                [activePage.id]: remainingTabs[remainingTabs.length - 1].id,
            }));
        }
    }, [activePage, pageLevel2ContentTabs, activeLevel2Tabs, clearTabDirty, closePageNow, initialLevel2Tabs]);

    const requestCloseLevel2Tab = useCallback((tabId) => {
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
    }, [activePage.id, dirtyTabs, closeLevel2TabNow, setPendingCloseRequest]);

    const handleCloseDetailTab = useCallback((pageId, recordId) => {
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
    }, [clearTabDirty, initialLevel2ContentTabs, initialLevel2Tabs]);

    return {
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
    };
}
