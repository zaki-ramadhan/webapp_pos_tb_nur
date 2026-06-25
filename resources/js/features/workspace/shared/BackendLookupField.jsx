import { useEffect, useState } from 'react';

import { extractBackendRows, listBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import ReferenceLookupInput from './ReferenceLookupInput';

export default function BackendLookupField({
    resource,
    values = [],
    resetAfterSelect = false,
    placeholder = 'Cari/Pilih...',
    searchLabel = 'Cari data',
    getOptionLabel = (option) => option?.label ?? option?.name ?? '',
    getOptionSearchText = (option) => getOptionLabel(option),
    onSelect,
    onRemove,
    emptyTitle,
    emptyDescription,
    className = '',
}) {
    const [items, setItems] = useState([]);
    const [searching, setSearching] = useState(false);
    const [internalValue, setInternalValue] = useState('');

    useEffect(() => {
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
    }, [resource]);

    if (resetAfterSelect) {
        return (
            <ReferenceLookupInput
                value={internalValue}
                placeholder={placeholder}
                searchLabel={searchLabel}
                items={items}
                searching={searching}
                getOptionLabel={getOptionLabel}
                getOptionSearchText={getOptionSearchText}
                onSelect={(item) => {
                    onSelect?.(item);
                    setInternalValue('');
                }}
                onClear={() => setInternalValue('')}
                emptyTitle={emptyTitle}
                emptyDescription={emptyDescription}
                className={className}
            />
        );
    }

    return (
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
        />
    );
}
