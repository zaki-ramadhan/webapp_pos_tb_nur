import { useEffect, useState, useCallback, useRef } from 'react';

import {
    createBackendResource,
    extractBackendRows,
    listBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { subscribeToLiveUpdates } from '@/features/workspace/backend/useBackendIndexResource';
import { buildHierarchicalCategories } from '@/features/workspace/modules/item-category/itemCategoryShared';
import { showCrudErrorToast, showCrudSuccessToast } from '@/features/workspace/shared/crudFeedback';
import { HighlightText } from '@/features/workspace/shared/LookupPrimitives';
import { translateAccountType } from '@/features/workspace/shared/hooks/useAccountLookupController';
import ReferenceLookupInput from './ReferenceLookupInput';

export default function BackendLookupField({
    resource,
    value = null,
    values = null,
    multi = false,
    fullWidthChips = false,
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
    allowQuickCreate = ['units', 'customers', 'suppliers', 'product-categories'].includes(resource),
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
        if (!isRefresh && items.length === 0) {
            setSearching(true);
        }
        try {
            const effectivePerPage = resource === 'accounts' ? 300 : resource === 'product-categories' ? 250 : 150;
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
    }, [resource, queryParamsString, items.length]);

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
        }
    };

    const isCategory = resource === 'product-categories';
    const effectiveTransform = transformItems ?? (isCategory ? buildHierarchicalCategories : null);
    const filteredItems = filterOption ? items.filter(filterOption) : items;
    const resolvedItems = effectiveTransform ? effectiveTransform(filteredItems) : filteredItems;

    const defaultAccountRenderOption = (account, query) => {
        const name = account?.name ?? (typeof account === 'string' ? account.replace(/^\[[^\]]+\]\s*/, '') : '');
        const code = account?.code ?? (typeof account === 'string' ? (account.match(/^\[([^\]]+)\]/)?.[1] ?? '') : '');
        const typeLabel = translateAccountType(account?.account_type);
        const prefix = account?.hierarchicalPrefix ?? '';

        return (
            <div
                className="flex w-full min-w-0 flex-col gap-0.5 select-none"
                style={{ paddingLeft: (account?.level ?? 0) > 0 ? `${account.level * 14}px` : undefined }}
            >
                <div className="line-clamp-2 break-words text-xs sm:text-sm font-normal text-text-workspace-dark leading-snug">
                    <HighlightText text={`${prefix}${name}`} search={query} />
                </div>
                <div className={`w-full text-xs sm:text-[13px] text-text-workspace-dark ${typeLabel ? 'flex items-start justify-between gap-4' : 'block'}`}>
                    <span className={`${typeLabel ? 'truncate min-w-0' : 'break-words whitespace-normal'} font-normal not-italic leading-snug`}>
                        <HighlightText text={code} search={query} />
                    </span>
                    {typeLabel ? (
                        <span className="shrink-0 italic font-normal leading-snug">
                            {typeLabel}
                        </span>
                    ) : null}
                </div>
            </div>
        );
    };

    const effectiveRenderOption = renderOption ?? (resource === 'accounts' ? defaultAccountRenderOption : null);
    const resolvedGetOptionSearchText = (option) => {
        if (resource === 'accounts' && typeof option === 'object' && option !== null) {
            const type = translateAccountType(option?.account_type);
            return `${option?.name ?? ''} ${option?.code ?? ''} ${type}`.trim();
        }
        return getOptionSearchText(option);
    };

    const isMulti = Boolean(multi);
    const singleLabel = value !== null && value !== undefined
        ? (typeof value === 'string' ? value : getOptionLabel(value))
        : (!isMulti && Array.isArray(values) && values.length > 0
            ? (typeof values[0] === 'string' ? values[0] : getOptionLabel(values[0]))
            : '');

    const handleQuickCreate = async (keyword) => {
        if (!keyword || !keyword.trim()) return null;
        const rawTrimmed = keyword.trim();
        const lowerTrimmed = rawTrimmed.toLowerCase();
        const entityLabel = resource === 'customers' ? 'Pelanggan'
            : (resource === 'suppliers' ? 'Pemasok'
            : (resource === 'units' ? 'Satuan'
            : (resource === 'product-categories' ? 'Kategori Barang' : 'Data')));

        // 1. Cek apakah record sudah ada di database / list items (case-insensitive)
        const existingRecord = items.find((item) => {
            const name = String(item?.name ?? item?.label ?? '').trim().toLowerCase();
            return name === lowerTrimmed;
        });

        if (existingRecord) {
            // Cek apakah item ini sedang difilter keluar (misal sudah dipilih sebagai satuan dasar / konversi lain)
            if (filterOptionRef.current && !filterOptionRef.current(existingRecord)) {
                showCrudErrorToast(`${entityLabel} "${existingRecord.name || rawTrimmed}" sudah digunakan.`);
                return null;
            }
            onSelect?.(existingRecord);
            showCrudSuccessToast(`${entityLabel} "${existingRecord.name || rawTrimmed}" dipilih.`);
            return existingRecord;
        }

        try {
            const payload = {
                name: rawTrimmed,
                is_active: true,
                ...(resource === 'product-categories' ? { parent_id: null, is_default: false } : {}),
            };
            const result = await createBackendResource(resource, payload);
            const newRecord = result?.data ?? result;
            if (newRecord && newRecord.id) {
                const label = getOptionLabel(newRecord) || newRecord.name || rawTrimmed;
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
                showCrudSuccessToast(`${entityLabel} "${newRecord.name ?? rawTrimmed}" berhasil ditambahkan.`);
                return formattedRecord;
            }
        } catch (err) {
            const status = err?.response?.status;
            if (status === 422) {
                try {
                    const searchRes = await listBackendResource(resource, { search: rawTrimmed, _refresh: Date.now() });
                    const rows = extractBackendRows(searchRes);
                    const matched = rows.find((r) => String(r.name ?? '').trim().toLowerCase() === lowerTrimmed);
                    if (matched) {
                        if (filterOptionRef.current && !filterOptionRef.current(matched)) {
                            showCrudErrorToast(`${entityLabel} "${matched.name || rawTrimmed}" sudah digunakan.`);
                            return null;
                        }
                        const label = getOptionLabel(matched) || matched.name || rawTrimmed;
                        const formatted = { ...matched, label };
                        setItems((prev) => {
                            const exists = prev.some((it) => String(it.id) === String(matched.id));
                            return exists ? prev : [...prev, formatted];
                        });
                        onSelect?.(formatted);
                        showCrudSuccessToast(`${entityLabel} "${matched.name || rawTrimmed}" dipilih.`);
                        return formatted;
                    }
                } catch {
                    // Fallback to error handling below
                }
            }
            const msg = err?.response?.data?.errors?.name?.[0] || err?.response?.data?.message || err?.message || `Gagal menambahkan ${entityLabel.toLowerCase()} baru.`;
            showCrudErrorToast(msg);
            throw err;
        }
        return null;
    };

    return (
        <div
            onFocusCapture={handleActivate}
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
                getOptionSearchText={resolvedGetOptionSearchText}
                renderOption={effectiveRenderOption}
                onSelect={onSelect}
                onCreateNew={allowQuickCreate ? handleQuickCreate : null}
                emptyTitle={emptyTitle}
                emptyDescription={emptyDescription}
                className={className}
                fullWidthChips={fullWidthChips}
                disabled={disabled}
                error={error}
            />
        </div>
    );
}
