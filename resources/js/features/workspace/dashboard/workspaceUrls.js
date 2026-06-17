/**
 * Single source of truth for workspace URL ↔ page ID mapping.
 * Used by both the URL sync hook and tab link rendering.
 */

/** Derives the URL path for a given workspace page ID. */
export function getPagePath(pageId) {
    return `/${pageId}`;
}

/**
 * Resolves the active page ID from a URL pathname.
 * Returns null when the path points to the dashboard root.
 *
 * Supports:
 *   /dashboard         → null (→ dashboardPageId)
 *   /dashboard/pageId  → 'pageId' (legacy deep-link)
 *   /pageId            → 'pageId'
 */
export function resolvePageIdFromPath(pathname) {
    const parts = pathname.split('/').filter(Boolean);
    if (!parts.length) return null;
    if (parts[0] === 'dashboard') return parts[1] ?? null;
    return parts[0];
}
