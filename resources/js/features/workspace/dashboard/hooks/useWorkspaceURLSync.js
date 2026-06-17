import { useCallback, useEffect, useRef } from 'react';
import { getPagePath, resolvePageIdFromPath } from '@/features/workspace/dashboard/workspaceUrls';

export default function useWorkspaceURLSync({
    activePageId,
    dashboardPageId,
    pages,
    openPageById,
    setActivePageId,
}) {
    // Sync React state → URL (replace, bukan push — tab switch bukan navigasi history)
    useEffect(() => {
        window.history.replaceState(
            { activePageId },
            '',
            getPagePath(activePageId ?? dashboardPageId),
        );
    }, [activePageId, dashboardPageId]);

    // Sync URL → React state (load awal & back/forward browser)
    const restoreStateFromUrl = useCallback(() => {
        const urlPageId = resolvePageIdFromPath(window.location.pathname);

        if (urlPageId && pages[urlPageId]) {
            openPageById(urlPageId);
        } else {
            setActivePageId(dashboardPageId);
        }
    }, [pages, openPageById, dashboardPageId, setActivePageId]);

    const hasInitialized = useRef(false);
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            restoreStateFromUrl();
        }
    }, [restoreStateFromUrl]);

    useEffect(() => {
        window.addEventListener('popstate', restoreStateFromUrl);
        return () => window.removeEventListener('popstate', restoreStateFromUrl);
    }, [restoreStateFromUrl]);
}
