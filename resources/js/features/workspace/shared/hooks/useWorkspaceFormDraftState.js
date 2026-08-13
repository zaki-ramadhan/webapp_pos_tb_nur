import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';

export function useWorkspaceFormDraftState({
    initialValues,
    recordId,
    pageId,
    tabId,
    onSync,
}) {
    // Single atomic state container to prevent race conditions
    const [state, setState] = useState(() => ({
        values: initialValues,
        savedSnapshot: initialValues,
        hasUserEdited: false,
    }));

    const prevRecordId = useRef(recordId);

    // Calculate isDirty: ONLY true if user has actively edited AND values differ from savedSnapshot
    const isDirty = useMemo(
        () => state.hasUserEdited && !areComparableValuesEqual(state.savedSnapshot, state.values),
        [state.hasUserEdited, state.savedSnapshot, state.values]
    );

    // Sync when recordId changes OR when initialValues update while form is pristine (!hasUserEdited)
    useEffect(() => {
        const recordIdChanged = recordId !== prevRecordId.current;

        if (recordIdChanged || !state.hasUserEdited) {
            prevRecordId.current = recordId;
            setState((prev) => ({
                ...prev,
                values: initialValues,
                savedSnapshot: initialValues,
            }));
            onSync?.(initialValues);
        }
    }, [recordId, initialValues, onSync, state.hasUserEdited]);

    // Automatically register dirty state with WorkspaceTabStore
    useWorkspaceDirtyRegistration({
        pageId,
        tabId,
        dirty: isDirty,
        enabled: Boolean(pageId && tabId),
    });

    // Update user form values (called when user edits a field)
    const setValues = useCallback((updater) => {
        setState((prev) => {
            const nextValues = typeof updater === 'function' ? updater(prev.values) : updater;
            return {
                ...prev,
                values: nextValues,
                hasUserEdited: true, // Mark that user has actively modified form
            };
        });
    }, []);

    // Mark form clean upon successful save (resets hasUserEdited flag and syncs savedSnapshot)
    const markClean = useCallback((newBaseline = null) => {
        setState((prev) => {
            const nextBaseline = newBaseline ?? prev.values;
            return {
                values: nextBaseline,
                savedSnapshot: nextBaseline,
                hasUserEdited: false, // Reset user edit flag
            };
        });
    }, []);

    // Update DB baseline without marking user edits (e.g. background item-locations fetch)
    const updateDbBaseline = useCallback((updater) => {
        setState((prev) => {
            const nextValues = typeof updater === 'function' ? updater(prev.values) : updater;
            return {
                ...prev,
                values: nextValues,
                savedSnapshot: nextValues,
                // Preserves existing hasUserEdited state
            };
        });
    }, []);

    return {
        values: state.values,
        setValues,
        isDirty,
        markClean,
        updateDbBaseline,
        savedSnapshot: state.savedSnapshot,
        hasUserEdited: state.hasUserEdited,
    };
}
