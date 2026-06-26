import { useEffect, useMemo, useState } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';

export function useFormDraftState({
    sourceRecord,
    buildFormState,
    config,
    pageId,
    activeTabId,
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
        }
    }, [sourceRecordId, activeTabId, incomingDbState, dbState, prevKeys]);

    const isDirty = useMemo(() => !areComparableValuesEqual(dbState, values), [dbState, values]);

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeTabId,
        dirty: isDirty,
        enabled: Boolean(pageId && activeTabId),
    });

    return [values, setValues, isDirty];
}


