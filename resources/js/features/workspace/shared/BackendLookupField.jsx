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
}) {
    const [items, setItems] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        let ignore = false;
        async function fetchRecords() {
            setSearching(true);
            try {
                const payload = await listBackendResource(resource, { per_page: 150 });
                if (!ignore) {
                    const rows = extractBackendRows(payload);
                    setItems(rows);
                }
            } catch (err) {
                // Ignore error
            } finally {
                if (!ignore) {
                    setSearching(false);
                }
            }
        }
        fetchRecords();
        return () => {
            ignore = true;
        };
    }, [resource]);

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
                if (item) {
                    onRemove(item);
                }
            }}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            className={className}
        />
    );
}
