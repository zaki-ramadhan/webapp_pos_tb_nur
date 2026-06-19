import { useCallback, useEffect, useRef } from 'react';
import { getPagePath, resolvePageIdFromPath } from '@/features/workspace/dashboard/workspaceUrls';

export default function useWorkspaceURLSync({
    activePageId,
    dashboardPageId,
    pages,
    openPageById,
    setActivePageId,
}) {
    const isFirstRun = useRef(true);

    // Sync React state → URL (replace, bukan push — tab switch bukan navigasi history)
    useEffect(() => {
        // Lewati sinkronisasi pertama kali untuk mencegah menimpa URL yang sedang dibuka oleh browser
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const currentState = window.history.state || {};
        const newPath = getPagePath(activePageId ?? dashboardPageId);

        // Hanya replace jika path benar-benar berbeda agar tidak membebani browser history
        if (window.location.pathname !== newPath) {
            const nextState = { ...currentState };
            if (nextState.url !== undefined) {
                nextState.url = newPath;
            }
            nextState.activePageId = activePageId;

            window.history.replaceState(
                nextState,
                '',
                newPath,
            );
        }
    }, [activePageId, dashboardPageId]);

    // Sync URL → React state (hanya untuk back/forward browser popstate)
    const restoreStateFromUrl = useCallback(() => {
        const urlPageId = resolvePageIdFromPath(window.location.pathname);

        if (urlPageId && pages[urlPageId]) {
            // Pastikan halaman terbuka dan aktif
            openPageById(urlPageId);
            setActivePageId(urlPageId);
        } else {
            setActivePageId(dashboardPageId);
        }
    }, [pages, openPageById, dashboardPageId, setActivePageId]);

    useEffect(() => {
        window.addEventListener('popstate', restoreStateFromUrl);
        return () => window.removeEventListener('popstate', restoreStateFromUrl);
    }, [restoreStateFromUrl]);
}
