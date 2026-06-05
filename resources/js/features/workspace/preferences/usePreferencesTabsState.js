import { useCallback, useMemo } from 'react';

export default function usePreferencesTabsState(tabs, activeTabId, onUpdate) {
    const activeTab = useMemo(() => {
        return tabs.find((tab) => tab.id === activeTabId) ?? tabs[0] ?? null;
    }, [activeTabId, tabs]);

    const updateActiveTab = useCallback(
        (updater) => {
            if (!tabs) return;
            const targetTabId = tabs.some((tab) => tab.id === activeTabId) ? activeTabId : tabs[0]?.id;
            const nextTabs = tabs.map((tab) => (tab.id === targetTabId ? updater(tab) : tab));
            onUpdate?.(nextTabs);
        },
        [activeTabId, tabs, onUpdate],
    );

    return {
        tabState: tabs,
        activeTab,
        updateActiveTab,
    };
}
