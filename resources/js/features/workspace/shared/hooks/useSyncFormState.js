import { useEffect, useRef, useState, useMemo } from 'react';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';

/**
 * Custom hook to manage form state synchronization with server record,
 * transition checks (bypass on record ID change), and dirty tracking.
 */
export function useSyncFormState({
    sourceRecord,
    buildFormState,
    initialComparable,
    onValuesUpdated,
}) {
    const [values, setValues] = useState(() => buildFormState(sourceRecord));
    const lastInitialComparableRef = useRef(initialComparable);

    const onValuesUpdatedRef = useRef(onValuesUpdated);
    useEffect(() => {
        onValuesUpdatedRef.current = onValuesUpdated;
    }, [onValuesUpdated]);

    useEffect(() => {
        const nextValues = buildFormState(sourceRecord);
        setValues((current) => {
            const recordId = sourceRecord?.__backendRecordId || sourceRecord?.id;
            const currentRecordId = current?.__backendRecordId || current?.id;
            if (recordId !== currentRecordId) {
                if (onValuesUpdatedRef.current) {
                    onValuesUpdatedRef.current(nextValues);
                }
                return nextValues;
            }
            const userHasEdited = !areComparableValuesEqual(lastInitialComparableRef.current, current);
            if (!userHasEdited) {
                if (onValuesUpdatedRef.current) {
                    onValuesUpdatedRef.current(nextValues);
                }
                return nextValues;
            }
            return current;
        });
        lastInitialComparableRef.current = initialComparable;
    }, [sourceRecord, initialComparable, buildFormState]);

    const isDirty = useMemo(() => {
        return !areComparableValuesEqual(lastInitialComparableRef.current, values);
    }, [values]);

    return [values, setValues, isDirty, lastInitialComparableRef];
}
