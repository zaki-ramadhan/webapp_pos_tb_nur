import { useEffect, useRef } from 'react';

// Syncs form values with initial state while preventing overwrite of active edits
export function useFormValuesSync({
    initialValues,
    recordId,
    isDirty,
    setValues,
    onSync,
}) {
    const prevRecordId = useRef(recordId);

    useEffect(() => {
        if (recordId !== prevRecordId.current) {
            setValues(initialValues);
            onSync?.(initialValues);
            prevRecordId.current = recordId;
        } else if (!isDirty) {
            setValues(initialValues);
            onSync?.(initialValues);
        }
    }, [initialValues, isDirty, recordId, setValues]);
}
