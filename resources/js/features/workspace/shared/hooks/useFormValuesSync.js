import { useEffect, useRef } from 'react';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';

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
            ? !areComparableValuesEqual(latestValuesRef.current, lastInitialValuesRef.current)
            : false;
        const matchesNewInitial = areComparableValuesEqual(latestValuesRef.current, initialValues);

        if (recordIdChanged || !userHasEdited || matchesNewInitial) {
            setValues(initialValues);
            onSync?.(initialValues);
            lastInitialValuesRef.current = initialValues;
            prevRecordId.current = recordId;
        } else {
            lastInitialValuesRef.current = initialValues;
        }
    }, [initialValues, recordId, setValues]);
}
