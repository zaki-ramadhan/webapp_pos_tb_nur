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
    // Single atomic state container to prevent race conditions between values and savedSnapshot
    const [state, setState] = useState(() => ({
        values: initialValues,
        savedSnapshot: initialValues,
    }));

    const prevRecordId = useRef(recordId);

    // Calculate isDirty atomically: true ONLY if current values differ from savedSnapshot
    const isDirty = useMemo(
        () => !areComparableValuesEqual(state.savedSnapshot, state.values),
        [state.savedSnapshot, state.values]
    );

    const isDirtyRef = useRef(isDirty);
    isDirtyRef.current = isDirty;

    // Sync when recordId changes OR when initialValues update while form is pristine (!isDirty)
    useEffect(() => {
        const recordIdChanged = recordId !== prevRecordId.current;

        if (recordIdChanged || !isDirtyRef.current) {
            prevRecordId.current = recordId;
            setState({
                values: initialValues,
                savedSnapshot: initialValues,
            });
            onSync?.(initialValues);
        }
    }, [recordId, initialValues, onSync]);

    // Automatically register dirty state with WorkspaceTabStore
    useWorkspaceDirtyRegistration({
        pageId,
        tabId,
        dirty: isDirty,
        enabled: Boolean(pageId && tabId),
    });

    // Update user form values
    const setValues = useCallback((updater) => {
        setState((prev) => {
            const nextValues = typeof updater === 'function' ? updater(prev.values) : updater;
            return {
                ...prev,
                values: nextValues,
            };
        });
    }, []);

    // Mark form clean upon successful save (atomically syncs baseline to values)
    const markClean = useCallback((newBaseline = null) => {
        setState((prev) => {
            const nextBaseline = newBaseline ?? prev.values;
            return {
                values: nextBaseline,
                savedSnapshot: nextBaseline,
            };
        });
    }, []);

    // Update DB baseline without marking user edits dirty (e.g. for background item-locations fetch)
    const updateDbBaseline = useCallback((updater) => {
        setState((prev) => {
            const nextValues = typeof updater === 'function' ? updater(prev.values) : updater;
            return {
                values: nextValues,
                savedSnapshot: nextValues,
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
    };
}
