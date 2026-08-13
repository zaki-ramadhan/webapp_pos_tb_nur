import { useCallback, useMemo, useState } from 'react';

export default function useWorkspaceDirtyState() {
    const [dirtyTabs] = useState({});

    const setTabDirty = useCallback(() => {}, []);
    const clearTabDirty = useCallback(() => {}, []);
    const clearPageDirty = useCallback(() => {}, []);

    const draftStateValue = useMemo(
        () => ({
            dirtyTabs,
            setTabDirty,
            clearTabDirty,
            clearPageDirty,
        }),
        [clearPageDirty, clearTabDirty, dirtyTabs, setTabDirty],
    );

    return draftStateValue;
}
