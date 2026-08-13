import { createContext, useContext } from 'react';

const WorkspaceDraftStateContext = createContext(null);

export function stripDirtyPrefix(label = '') {
    return String(label ?? '').replace(/^\*/, '');
}

export function renderTabLabel(label) {
    return stripDirtyPrefix(label);
}

export function withDirtyLabel(label) {
    return stripDirtyPrefix(label);
}

export function isWorkspaceTabDirty() {
    return false;
}

export function hasDirtyTabsForPage() {
    return false;
}

export function hasAnyDirtyTabs() {
    return false;
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

export function useWorkspaceDirtyRegistration() {
    // Option 1: No-op. All tabs remain clean without dirty asterisk indicators or modal close blocks.
}
