import { useCallback, useEffect, useMemo, useState } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';

export function useFormDraftState({
    sourceRecord,
    buildFormState,
    config,
    pageId,
    activeTabId,
    onSync,
    isEqual,
}) {
    const sourceRecordId = sourceRecord?.__backendRecordId || sourceRecord?.id || '';

    const [prevKeys, setPrevKeys] = useState({ sourceRecordId, activeTabId });
    const [dbState, setDbState] = useState(() => buildFormState(sourceRecord, config));
    const [values, setValues] = useState(dbState);

    const incomingDbState = useMemo(() => {
        return buildFormState(sourceRecord, config);
    }, [sourceRecord, config, buildFormState]);

    useEffect(() => {
        const keysChanged = prevKeys.sourceRecordId !== sourceRecordId || prevKeys.activeTabId !== activeTabId;
        const dbValuesChanged = !areComparableValuesEqual(dbState, incomingDbState);

        if (keysChanged || dbValuesChanged) {
            setPrevKeys({ sourceRecordId, activeTabId });
            setDbState(incomingDbState);
            setValues(incomingDbState);
            if (onSync) {
                onSync(incomingDbState);
            }
        }
    }, [sourceRecordId, activeTabId, incomingDbState, dbState, prevKeys, onSync]);

    const isDirty = useMemo(() => {
        if (isEqual) {
            return !isEqual(dbState, values);
        }
        return !areComparableValuesEqual(dbState, values);
    }, [dbState, values, isEqual]);

    const resetForm = useCallback((customState = null) => {
        const freshState = customState ?? buildFormState(sourceRecord, config);
        setDbState(freshState);
        setValues(freshState);
        if (onSync) {
            onSync(freshState);
        }
    }, [buildFormState, sourceRecord, config, onSync]);

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeTabId,
        dirty: isDirty,
        enabled: Boolean(pageId && activeTabId),
    });

    return [values, setValues, isDirty, resetForm];
}


