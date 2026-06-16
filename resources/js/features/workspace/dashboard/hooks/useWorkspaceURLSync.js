import { useEffect, useRef, useCallback } from 'react';

export default function useWorkspaceURLSync({
    activePageId,
    dashboardPageId,
    pages,
    openPageById,
    setActivePageId,
}) {
    // Sinkronkan state React -> URL Path
    useEffect(() => {
        const url = new URL(window.location.href);
        if (activePageId && activePageId !== dashboardPageId) {
            url.pathname = `/${activePageId}`;
        } else {
            url.pathname = '/dashboard';
        }
        window.history.replaceState({ activePageId }, '', url.toString());
    }, [activePageId, dashboardPageId]);

    // Sinkronkan URL Path -> state React (load awal & back/forward)
    const restoreStateFromUrl = useCallback(() => {
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        // pathParts = ['dashboard', 'pageId'] atau ['pageId']
        const urlPageId = pathParts[0] === 'dashboard' ? pathParts[1] : pathParts[0];

        if (urlPageId && pages[urlPageId]) {
            openPageById(urlPageId);
        } else {
            setActivePageId(dashboardPageId);
        }
    }, [pages, openPageById, dashboardPageId, setActivePageId]);

    // Load awal
    const hasInitializedFromUrl = useRef(false);
    useEffect(() => {
        if (!hasInitializedFromUrl.current) {
            hasInitializedFromUrl.current = true;
            restoreStateFromUrl();
        }
    }, [restoreStateFromUrl]);

    // Listener popstate (tombol back/forward browser)
    useEffect(() => {
        window.addEventListener('popstate', restoreStateFromUrl);
        return () => window.removeEventListener('popstate', restoreStateFromUrl);
    }, [restoreStateFromUrl]);
}
