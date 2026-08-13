import { useCallback, useEffect, useRef, useState } from 'react';

export function useWorkspaceFormDraftState({
    initialValues,
    recordId,
    onSync,
}) {
    const [values, setValues] = useState(initialValues);
    const [savedSnapshot, setSavedSnapshot] = useState(initialValues);

    const prevRecordId = useRef(recordId);

    useEffect(() => {
        if (recordId !== prevRecordId.current) {
            prevRecordId.current = recordId;
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
