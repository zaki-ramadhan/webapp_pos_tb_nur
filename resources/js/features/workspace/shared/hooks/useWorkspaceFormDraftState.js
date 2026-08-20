import { useCallback, useEffect, useRef, useState } from 'react';

export function useWorkspaceFormDraftState({
    initialValues,
    recordId,
    onSync,
}) {
    const [values, setValues] = useState(initialValues);
    const [savedSnapshot, setSavedSnapshot] = useState(initialValues);

    const prevRecordId = useRef(recordId);
    const prevInitialValues = useRef(initialValues);
    const hasUserEditedRef = useRef(false);

    useEffect(() => {
        const recordChanged = recordId !== prevRecordId.current;

        if (recordChanged) {
            prevRecordId.current = recordId;
            prevInitialValues.current = initialValues;
            hasUserEditedRef.current = false;
            setValues(initialValues);
            setSavedSnapshot(initialValues);
            onSync?.(initialValues);
        }
    }, [recordId, initialValues, onSync]);

    const markClean = useCallback((newBaseline = null) => {
        const nextBaseline = newBaseline ?? values;
        setSavedSnapshot(nextBaseline);
    }, [values]);

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
        isDirty: false,
        markClean,
        updateDbBaseline,
        savedSnapshot,
        hasUserEdited: false,
    };
}
