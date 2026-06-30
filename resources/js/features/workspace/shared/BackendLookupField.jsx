import { useEffect, useState } from 'react';

import { extractBackendRows, listBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import ReferenceLookupInput from './ReferenceLookupInput';

export default function BackendLookupField({
    resource,
    values = [],
    placeholder = 'Cari/Pilih...',
    searchLabel = 'Cari data',
    getOptionLabel = (option) => option?.label ?? option?.name ?? '',
    getOptionSearchText = (option) => getOptionLabel(option),
    onSelect,
    onRemove,
    emptyTitle,
    emptyDescription,
    className = '',
    disabled = false,
}) {
    const [items, setItems] = useState([]);
    const [searching, setSearching] = useState(false);
    const [hasActivated, setHasActivated] = useState(false);

    useEffect(() => {
        if (!hasActivated || disabled) return;

        let ignore = false;
        async function fetchRecords() {
            setSearching(true);
            try {
                const payload = await listBackendResource(resource, { per_page: 150 });
                if (!ignore) {
                    setItems(extractBackendRows(payload));
                }
            } catch {
                // Abaikan error
            } finally {
                if (!ignore) setSearching(false);
            }
        }
        fetchRecords();
        return () => { ignore = true; };
    }, [resource, hasActivated, disabled]);

    const handleActivate = () => {
        if (!hasActivated && !disabled) {
            setHasActivated(true);
        }
    };

    return (
        <div
            onFocusCapture={handleActivate}
            onMouseDownCapture={handleActivate}
            className="w-full"
        >
            <ReferenceLookupInput
                values={values.map(getOptionLabel)}
                placeholder={placeholder}
                searchLabel={searchLabel}
                items={items}
                searching={searching}
                getOptionLabel={getOptionLabel}
                getOptionSearchText={getOptionSearchText}
                onSelect={onSelect}
                onRemove={(label) => {
                    const item = values.find((val) => getOptionLabel(val) === label);
                    if (item) onRemove(item);
                }}
                emptyTitle={emptyTitle}
                emptyDescription={emptyDescription}
                className={className}
                disabled={disabled}
            />
        </div>
    );
}
