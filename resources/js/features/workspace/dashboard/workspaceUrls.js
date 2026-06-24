// URL ↔ Page ID mapping

export function getPagePath(pageId) {
    return `/${pageId}`;
}

// Resolves active page ID from URL pathname
export function resolvePageIdFromPath(pathname) {
    const parts = pathname.split('/').filter(Boolean);
    if (!parts.length) return null;
    if (parts[0] === 'dashboard') return parts[1] ?? null;
    return parts[0];
}
