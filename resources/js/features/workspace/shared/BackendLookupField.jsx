import { useEffect, useState } from 'react';

import { extractBackendRows, listBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import { buildHierarchicalCategories } from '@/features/workspace/modules/item-category/itemCategoryShared';
import ReferenceLookupInput from './ReferenceLookupInput';

export default function BackendLookupField({
    resource,
    value = null,
    values = null,
    multi = false,
    placeholder = 'Cari/Pilih...',
    searchLabel = 'Cari data',
    getOptionLabel = (option) => (typeof option === 'string' ? option : (option?.label ?? option?.name ?? '')),
    getOptionSearchText = (option) => (typeof option === 'string' ? option : `${option?.name ?? option?.label ?? ''} ${option?.code ?? ''}`),
    filterOption = null,
    renderOption = null,
    queryParams = {},
    transformItems = null,
    onSelect,
    onRemove,
    onClear,
    emptyTitle,
    emptyDescription,
    className = '',
    disabled = false,
    error = '',
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
                const effectivePerPage = resource === 'product-categories' ? 250 : 150;
                const payload = await listBackendResource(resource, { per_page: effectivePerPage, ...queryParams });
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

    const isCategory = resource === 'product-categories';
    const effectiveTransform = transformItems ?? (isCategory ? buildHierarchicalCategories : null);
    const filteredItems = filterOption ? items.filter(filterOption) : items;
    const resolvedItems = effectiveTransform ? effectiveTransform(filteredItems) : filteredItems;

    const isMulti = Boolean(multi);
    const singleLabel = value !== null && value !== undefined
        ? (typeof value === 'string' ? value : getOptionLabel(value))
        : (!isMulti && Array.isArray(values) && values.length > 0
            ? (typeof values[0] === 'string' ? values[0] : getOptionLabel(values[0]))
            : '');

    return (
        <div
            onFocusCapture={handleActivate}
            onMouseDownCapture={handleActivate}
            className="w-full"
        >
            <ReferenceLookupInput
                {...(isMulti
                    ? {
                        values: (values || []).map((val) => (typeof val === 'string' ? val : getOptionLabel(val))),
                        onRemove: (label) => {
                            const item = (values || []).find((val) => (typeof val === 'string' ? val : getOptionLabel(val)) === label);
                            if (item) onRemove?.(item);
                            else onRemove?.(label);
                        },
                    }
                    : {
                        value: singleLabel,
                        onClear: () => {
                            onClear?.();
                            if (onRemove) {
                                const item = Array.isArray(values) && values.length > 0 ? values[0] : singleLabel;
                                onRemove(item);
                            }
                        },
                    }
                )}
                placeholder={placeholder}
                searchLabel={searchLabel}
                items={resolvedItems}
                searching={searching}
                getOptionLabel={getOptionLabel}
                getOptionSearchText={getOptionSearchText}
                renderOption={renderOption}
                onSelect={onSelect}
                emptyTitle={emptyTitle}
                emptyDescription={emptyDescription}
                className={className}
                disabled={disabled}
                error={error}
            />
        </div>
    );
}
