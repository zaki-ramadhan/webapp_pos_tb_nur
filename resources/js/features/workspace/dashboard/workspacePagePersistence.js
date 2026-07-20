import { isWorkspacePageInactive } from '@/features/workspace/shared/workspaceAvailability';
import { resolvePageIdFromPath } from './workspaceUrls';

const WORKSPACE_PAGE_STATE_STORAGE_KEY = 'pos-workspace-open-pages:v2';

function canUseBrowserStorage() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function clonePlainData(value) {
    return JSON.parse(JSON.stringify(value));
}

function normalizePageIds(pageIds, pages, dashboardPage, preferences = {}) {
    const validIds = new Set(Object.keys(pages));
    const uniqueIds = [];

    [dashboardPage.id, ...(pageIds ?? [])].forEach((pageId) => {
        const normalizedId = String(pageId ?? '');

        if (
            !normalizedId ||
            !validIds.has(normalizedId) ||
            uniqueIds.includes(normalizedId) ||
            (normalizedId !== dashboardPage.id && isWorkspacePageInactive(normalizedId, preferences))
        ) {
            return;
        }

        uniqueIds.push(normalizedId);
    });

    return uniqueIds;
}

function normalizeLevel2Tabs(activeLevel2Tabs, initialLevel2Tabs, pages) {
    return Object.keys(pages).reduce((result, pageId) => {
        result[pageId] = activeLevel2Tabs?.[pageId] ?? initialLevel2Tabs[pageId];
        return result;
    }, {});
}

function normalizeContentTabs(pageLevel2ContentTabs, initialLevel2ContentTabs, pages) {
    return Object.keys(pages).reduce((result, pageId) => {
        const persistedTabs = pageLevel2ContentTabs?.[pageId];

        let resolved = Array.isArray(persistedTabs)
            ? clonePlainData(persistedTabs)
            : initialLevel2ContentTabs[pageId] ?? [];

        if (Array.isArray(resolved)) {
            resolved = resolved.filter((tab) => tab?.tabType !== 'create');
        }

        result[pageId] = resolved;
        return result;
    }, {});
}

export function loadWorkspacePageState({
    pages,
    dashboardPage,
    initialLevel2Tabs,
    initialLevel2ContentTabs,
    preferences = {},
}) {
    const fallbackState = {
        openPages: [dashboardPage],
        activePageId: dashboardPage.id,
        activeLevel2Tabs: initialLevel2Tabs,
        pageLevel2ContentTabs: initialLevel2ContentTabs,
    };

    if (!canUseBrowserStorage()) {
        return fallbackState;
    }

    try {
        const rawValue = window.localStorage.getItem(WORKSPACE_PAGE_STATE_STORAGE_KEY);
        const parsedValue = rawValue ? JSON.parse(rawValue) : null;
        
        const pageIds = normalizePageIds(parsedValue?.openPageIds, pages, dashboardPage, preferences);
        
        // Cek URL pathname untuk deep-linking langsung
        const urlPageId = typeof window !== 'undefined' ? resolvePageIdFromPath(window.location.pathname) : null;
        
        if (urlPageId && pages[urlPageId] && (urlPageId === dashboardPage.id || !isWorkspacePageInactive(urlPageId, preferences))) {
            if (!pageIds.includes(urlPageId)) {
                pageIds.push(urlPageId);
            }
        }

        const openPages = pageIds.map((pageId) => pages[pageId]).filter(Boolean);
        
        const activePageId = (urlPageId && pages[urlPageId] && (urlPageId === dashboardPage.id || !isWorkspacePageInactive(urlPageId, preferences)))
            ? urlPageId
            : (parsedValue && openPages.some((page) => page.id === parsedValue.activePageId)
                ? parsedValue.activePageId
                : dashboardPage.id);

        return {
            openPages: openPages.length ? openPages : fallbackState.openPages,
            activePageId,
            activeLevel2Tabs: normalizeLevel2Tabs(parsedValue?.activeLevel2Tabs, initialLevel2Tabs, pages),
            pageLevel2ContentTabs: normalizeContentTabs(
                parsedValue?.pageLevel2ContentTabs,
                initialLevel2ContentTabs,
                pages,
            ),
        };
    } catch {
        return fallbackState;
    }
}

export function saveWorkspacePageState({
    openPages,
    activePageId,
    activeLevel2Tabs,
    pageLevel2ContentTabs,
}) {
    if (!canUseBrowserStorage()) {
        return;
    }

    try {
        window.localStorage.setItem(
            WORKSPACE_PAGE_STATE_STORAGE_KEY,
            JSON.stringify({
                openPageIds: (openPages ?? []).map((page) => page.id),
                activePageId,
                activeLevel2Tabs,
                pageLevel2ContentTabs,
            }),
        );
    } catch {
        // Abaikan gagal simpan tab
    }
}

export function clearWorkspacePageState() {
    if (!canUseBrowserStorage()) {
        return;
    }

    try {
        window.localStorage.removeItem(WORKSPACE_PAGE_STATE_STORAGE_KEY);
    } catch {
        // Abaikan gagal hapus persistence
    }
}
