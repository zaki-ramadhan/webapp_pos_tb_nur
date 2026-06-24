import { createContext, useContext, useEffect } from 'react';

const WorkspaceDraftStateContext = createContext(null);

const DIRTY_PREFIX = '*';

export function stripDirtyPrefix(label = '') {
    return String(label ?? '').replace(/^\*/, '');
}

export function renderTabLabel(label, active = false, isPrimary = false) {
    if (typeof label === 'string' && label.startsWith('*')) {
        const cleanLabel = label.slice(1);
        const asteriskColor = isPrimary && active ? 'text-white' : 'text-[#ED3969]';
        return (
            <span className="inline-flex items-baseline min-w-0 w-full">
                <sup className={`text-[0.85em] font-bold select-none align-super relative -top-[0.05em] mr-0.5 ${asteriskColor}`}>*</sup>
                <span className="truncate">{cleanLabel}</span>
            </span>
        );
    }
    return label;
}

export function withDirtyLabel(label, dirty) {
    const normalizedLabel = stripDirtyPrefix(label);

    return dirty ? `${DIRTY_PREFIX}${normalizedLabel}` : normalizedLabel;
}

export function isWorkspaceTabDirty(dirtyTabs, pageId, tabId) {
    if (!pageId || !tabId) {
        return false;
    }

    return Boolean(dirtyTabs?.[pageId]?.[tabId]);
}

export function hasDirtyTabsForPage(dirtyTabs, pageId) {
    if (!pageId) {
        return false;
    }

    return Object.values(dirtyTabs?.[pageId] ?? {}).some(Boolean);
}

export function hasAnyDirtyTabs(dirtyTabs) {
    return Object.values(dirtyTabs ?? {}).some((pageTabs) => Object.values(pageTabs ?? {}).some(Boolean));
}

export function WorkspaceDraftStateProvider({ value, children }) {
    return (
        <WorkspaceDraftStateContext.Provider value={value}>
            {children}
        </WorkspaceDraftStateContext.Provider>
    );
}

export function useWorkspaceDraftState() {
    const context = useContext(WorkspaceDraftStateContext);

    if (!context) {
        throw new Error('useWorkspaceDraftState must be used inside WorkspaceDraftStateProvider.');
    }

    return context;
}

export function useWorkspaceDirtyRegistration({
    pageId,
    tabId,
    dirty,
    enabled = true,
}) {
    const { setTabDirty, clearTabDirty } = useWorkspaceDraftState();

    useEffect(() => {
        if (!enabled || !pageId || !tabId) {
            return undefined;
        }

        if (dirty) {
            setTabDirty(pageId, tabId);
        } else {
            clearTabDirty(pageId, tabId);
        }

        return undefined;
    }, [clearTabDirty, dirty, enabled, pageId, setTabDirty, tabId]);
}
