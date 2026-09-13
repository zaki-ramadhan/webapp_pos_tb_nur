import { useEffect, useState, useCallback, useRef } from 'react';

import {
    createBackendResource,
    extractBackendRows,
    listBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { subscribeToLiveUpdates } from '@/features/workspace/backend/useBackendIndexResource';
import { buildHierarchicalCategories } from '@/features/workspace/modules/item-category/itemCategoryShared';
import { showCrudErrorToast, showCrudSuccessToast } from '@/features/workspace/shared/crudFeedback';
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
    allowQuickCreate = resource === 'units',
    className = '',
    disabled = false,
    error = '',
}) {
    const [items, setItems] = useState([]);
    const [searching, setSearching] = useState(false);
    const [hasActivated, setHasActivated] = useState(false);
    const filterOptionRef = useRef(filterOption);
    filterOptionRef.current = filterOption;

    const queryParamsString = JSON.stringify(queryParams);

    const loadRecords = useCallback(async (isRefresh = false) => {
        setSearching(true);
        try {
            const effectivePerPage = resource === 'product-categories' ? 250 : 150;
            const params = { per_page: effectivePerPage, ...queryParams };
            if (isRefresh) {
                params._refresh = Date.now();
            }
            const payload = await listBackendResource(resource, params);
            setItems(extractBackendRows(payload));
        } catch {
            // Abaikan error
        } finally {
            setSearching(false);
        }
    }, [resource, queryParamsString]);

    useEffect(() => {
        if (!hasActivated || disabled) return;
        loadRecords();
    }, [hasActivated, disabled, loadRecords]);

    // Berlangganan event live update (Reverb WebSocket / Polling)
    useEffect(() => {
        const unsubscribe = subscribeToLiveUpdates((change) => {
            if (!change || !change.resource) return;
            const res = String(change.resource).toLowerCase();
            const targetRes = String(resource || '').toLowerCase();
            const isMatch = res === targetRes ||
                (targetRes === 'units' && (res === 'units' || res === 'item-unit')) ||
                (targetRes === 'item-unit' && (res === 'units' || res === 'item-unit'));

            if (!isMatch) return;

            if (change.action === 'deleted' && change.recordId) {
                setItems((prev) => prev.filter((item) => String(item.id) !== String(change.recordId)));
                // Jika nilai yang sedang aktif adalah data yang baru saja dihapus, bersihkan
                if (value && typeof value === 'object' && String(value.id) === String(change.recordId)) {
                    onClear?.();
                } else if (value && String(value) === String(change.recordId)) {
                    onClear?.();
                }
            } else if (hasActivated) {
                loadRecords(true);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [resource, hasActivated, value, onClear, loadRecords]);

    const handleActivate = () => {
        if (!hasActivated && !disabled) {
            setHasActivated(true);
        } else if (!disabled) {
            // Muat ulang di latar belakang agar selalu sinkron ketika dibuka kembali
            loadRecords();
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

    const handleQuickCreate = async (keyword) => {
        if (!keyword || !keyword.trim()) return null;
        const trimmed = keyword.trim().toLowerCase();

        // 1. Cek apakah satuan sudah ada di database / list items (case-insensitive)
        const existingRecord = items.find((item) => {
            const name = String(item?.name ?? item?.label ?? '').trim().toLowerCase();
            return name === trimmed;
        });

        if (existingRecord) {
            // Cek apakah item ini sedang difilter keluar (misal sudah dipilih sebagai satuan dasar / konversi lain)
            if (filterOptionRef.current && !filterOptionRef.current(existingRecord)) {
                showCrudErrorToast(`Satuan "${existingRecord.name || trimmed}" sudah digunakan pada barang ini.`);
                return null;
            }
            onSelect?.(existingRecord);
            showCrudSuccessToast(`Satuan "${existingRecord.name || trimmed}" dipilih.`);
            return existingRecord;
        }

        try {
            const payload = {
                name: trimmed,
                is_active: true,
            };
            const result = await createBackendResource(resource, payload);
            const newRecord = result?.data ?? result;
            if (newRecord && newRecord.id) {
                const label = getOptionLabel(newRecord) || newRecord.name || trimmed;
                const formattedRecord = {
                    ...newRecord,
                    id: newRecord.id,
                    name: newRecord.name ?? label,
                    label: label,
                };
                setItems((prev) => {
                    const exists = prev.some((it) => String(it.id) === String(newRecord.id));
                    return exists ? prev : [...prev, formattedRecord];
                });
                onSelect?.(formattedRecord);
                showCrudSuccessToast(`Satuan "${trimmed}" berhasil ditambahkan.`);
                return formattedRecord;
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Gagal menambahkan satuan baru.';
            showCrudErrorToast(msg);
            throw err;
        }
        return null;
    };

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
                onCreateNew={allowQuickCreate ? handleQuickCreate : null}
                emptyTitle={emptyTitle}
                emptyDescription={emptyDescription}
                className={className}
                disabled={disabled}
                error={error}
            />
        </div>
    );
}
