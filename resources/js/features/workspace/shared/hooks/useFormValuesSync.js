import { useEffect, useRef } from 'react';

// Syncs form values with initial state while preventing overwrite of active edits
export function useFormValuesSync({
    initialValues,
    recordId,
    values,
    setValues,
    onSync,
}) {
    const prevRecordId = useRef(recordId);
    const lastInitialValuesRef = useRef(initialValues);
    const latestValuesRef = useRef(values);

    // Keep the latest values in a ref on every render
    latestValuesRef.current = values;

    useEffect(() => {
        const recordIdChanged = recordId !== prevRecordId.current;
        const userHasEdited = lastInitialValuesRef.current
            ? JSON.stringify(latestValuesRef.current) !== JSON.stringify(lastInitialValuesRef.current)
            : false;

        if (recordIdChanged || !userHasEdited) {
            setValues(initialValues);
            onSync?.(initialValues);
            lastInitialValuesRef.current = initialValues;
            prevRecordId.current = recordId;
        } else {
            lastInitialValuesRef.current = initialValues;
        }
    }, [initialValues, recordId, setValues]);
}
