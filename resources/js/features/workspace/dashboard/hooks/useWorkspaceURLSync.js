import { useEffect, useRef } from 'react';

export default function useWorkspaceURLSync({ activePageId, dashboardPageId, pages, openPageById }) {
    // Sinkronkan URL aktif
    useEffect(() => {
        const url = new URL(window.location.href);
        if (activePageId && activePageId !== dashboardPageId) {
            url.searchParams.set('page', activePageId);
        } else {
            url.searchParams.delete('page');
        }
        window.history.replaceState({}, '', url.toString());
    }, [activePageId, dashboardPageId]);

    // Ambil halaman aktif dari URL
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
}
