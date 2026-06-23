import { useEffect, useRef } from 'react';

/**
 * Custom hook to safely sync form values state with backend/initial values
 * while preventing accidental overwrite of user's active edits (dirty drafts),
 * and instantly forcing synchronization when transitioning between records.
 *
 * @param {object} params
 * @param {object} params.initialValues - The initial values parsed from the detail record (or defaults).
 * @param {any} params.recordId - The current active record ID (null if create mode).
 * @param {boolean} params.isDirty - Whether the form has changes.
 * @param {function} params.setValues - React state setter for form values.
 * @param {function} [params.onSync] - Optional callback after synchronization.
 */
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
