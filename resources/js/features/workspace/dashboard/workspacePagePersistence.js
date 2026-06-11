import { isWorkspacePageInactive } from '@/features/workspace/shared/workspaceAvailability';

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

        result[pageId] = Array.isArray(persistedTabs)
            ? clonePlainData(persistedTabs)
            : initialLevel2ContentTabs[pageId] ?? [];

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

        if (!rawValue) {
            return fallbackState;
        }

        const parsedValue = JSON.parse(rawValue);
        const pageIds = normalizePageIds(parsedValue?.openPageIds, pages, dashboardPage, preferences);
        const openPages = pageIds.map((pageId) => pages[pageId]).filter(Boolean);
        const activePageId = openPages.some((page) => page.id === parsedValue?.activePageId)
            ? parsedValue.activePageId
            : dashboardPage.id;

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
        // Ignore persistence failures and keep workspace tabs usable.
    }
}

export function clearWorkspacePageState() {
    if (!canUseBrowserStorage()) {
        return;
    }

    try {
        window.localStorage.removeItem(WORKSPACE_PAGE_STATE_STORAGE_KEY);
    } catch {
        // Ignore persistence cleanup failures.
    }
}
