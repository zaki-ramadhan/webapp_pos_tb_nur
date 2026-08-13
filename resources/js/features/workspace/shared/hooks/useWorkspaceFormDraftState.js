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
    const [savedSnapshot, setSavedSnapshot] = useState(initialValues);
    const [values, setValues] = useState(initialValues);

    const prevRecordId = useRef(recordId);

    // Sync when recordId changes (e.g. switching tabs / opening new record)
    useEffect(() => {
        if (recordId !== prevRecordId.current) {
            prevRecordId.current = recordId;
            setSavedSnapshot(initialValues);
            setValues(initialValues);
            onSync?.(initialValues);
        }
    }, [recordId, initialValues, onSync]);

    // Calculate isDirty: true ONLY if current values differ from savedSnapshot
    const isDirty = useMemo(
        () => !areComparableValuesEqual(savedSnapshot, values),
        [savedSnapshot, values]
    );

    // Automatically register dirty state with WorkspaceTabStore
    useWorkspaceDirtyRegistration({
        pageId,
        tabId,
        dirty: isDirty,
        enabled: Boolean(pageId && tabId),
    });

    // Mark form clean upon successful save
    const markClean = useCallback((newBaseline = null) => {
        setValues((current) => {
            const nextBaseline = newBaseline ?? current;
            setSavedSnapshot(nextBaseline);
            return nextBaseline;
        });
    }, []);

    // Update DB baseline without marking user edits dirty (e.g. for background item-locations fetch)
    const updateDbBaseline = useCallback((updater) => {
        setValues((current) => {
            const nextValues = typeof updater === 'function' ? updater(current) : updater;
            setSavedSnapshot(nextValues);
            return nextValues;
        });
    }, []);

    return {
        values,
        setValues,
        isDirty,
        markClean,
        updateDbBaseline,
        savedSnapshot,
        setSavedSnapshot,
    };
}
