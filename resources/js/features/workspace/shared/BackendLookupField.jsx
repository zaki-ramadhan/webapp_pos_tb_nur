import { useEffect, useState } from 'react';

import { extractBackendRows, listBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import ReferenceLookupInput from './ReferenceLookupInput';

export default function BackendLookupField({
    resource,
    values = [],
    placeholder = 'Cari/Pilih...',
    searchLabel = 'Cari data',
    getOptionLabel = (option) => (typeof option === 'string' ? option : (option?.label ?? option?.name ?? '')),
    getOptionSearchText = (option) => (typeof option === 'string' ? option : (option?.label ?? option?.name ?? '')),
    filterOption = null,
    renderOption = null,
    queryParams = {},
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

    const queryParamsString = JSON.stringify(queryParams);

    useEffect(() => {
        if (!hasActivated || disabled) return;

        let ignore = false;
        async function fetchRecords() {
            setSearching(true);
            try {
                const payload = await listBackendResource(resource, { per_page: 150, ...queryParams });
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
    }, [resource, hasActivated, disabled, queryParamsString]);

    const handleActivate = () => {
        if (!hasActivated && !disabled) {
            setHasActivated(true);
        }
    };

    const resolvedItems = filterOption ? items.filter(filterOption) : items;

    return (
        <div
            onFocusCapture={handleActivate}
            onMouseDownCapture={handleActivate}
            className="w-full"
        >
            <ReferenceLookupInput
                values={(values || []).map((val) => (typeof val === 'string' ? val : getOptionLabel(val)))}
                placeholder={placeholder}
                searchLabel={searchLabel}
                items={resolvedItems}
                searching={searching}
                getOptionLabel={getOptionLabel}
                getOptionSearchText={getOptionSearchText}
                renderOption={renderOption}
                onSelect={onSelect}
                onRemove={(label) => {
                    const item = (values || []).find((val) => (typeof val === 'string' ? val : getOptionLabel(val)) === label);
                    if (item) onRemove?.(item);
                    else onRemove?.(label);
                }}
                emptyTitle={emptyTitle}
                emptyDescription={emptyDescription}
                className={className}
                disabled={disabled}
            />
        </div>
    );
}
