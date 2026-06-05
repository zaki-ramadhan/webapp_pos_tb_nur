import { useCallback, useEffect, useMemo, useState } from 'react';
import { hasAnyDirtyTabs } from '@/features/workspace/dashboard/WorkspaceDraftState';

export default function useWorkspaceDirtyState() {
    const [dirtyTabs, setDirtyTabs] = useState({});

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

    const draftStateValue = useMemo(
        () => ({
            dirtyTabs,
            setTabDirty,
            clearTabDirty,
            clearPageDirty,
        }),
        [clearPageDirty, clearTabDirty, dirtyTabs, setTabDirty],
    );

    return {
        dirtyTabs,
        clearPageDirty,
        clearTabDirty,
        draftStateValue,
    };
}
