import { useCallback, useEffect, useMemo, useState } from 'react';

export function clonePreferenceValue(value) {
    if (typeof globalThis.structuredClone === 'function') {
        return globalThis.structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value));
}

export default function usePreferencesTabsState(tabs, activeTabId) {
    const [tabState, setTabState] = useState(() => clonePreferenceValue(tabs ?? []));

    useEffect(() => {
        setTabState(clonePreferenceValue(tabs ?? []));
    }, [tabs]);

    const activeTab = useMemo(() => {
        return tabState.find((tab) => tab.id === activeTabId) ?? tabState[0] ?? null;
    }, [activeTabId, tabState]);

    const updateActiveTab = useCallback(
        (updater) => {
            setTabState((currentTabs) => {
                const targetTabId = currentTabs.some((tab) => tab.id === activeTabId) ? activeTabId : currentTabs[0]?.id;

                return currentTabs.map((tab) => (tab.id === targetTabId ? updater(tab) : tab));
            });
        },
        [activeTabId],
    );

    return {
        tabState,
        activeTab,
        updateActiveTab,
        setTabState,
    };
}
