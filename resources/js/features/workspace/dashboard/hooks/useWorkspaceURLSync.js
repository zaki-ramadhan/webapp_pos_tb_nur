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

  // Sync state → URL (replace instead of push)

    useEffect(() => {
      // Skip first sync to prevent overwriting URL

        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const currentState = window.history.state || {};
        const newPath = getPagePath(activePageId ?? dashboardPageId);

      // Only replace if path changes

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

  // Sync URL → state (popstate back/forward navigation)

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
