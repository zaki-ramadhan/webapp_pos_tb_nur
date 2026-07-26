import { useState, useEffect, useRef, useMemo } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import TextInput from '@/components/ui/TextInput';
import CheckboxField from '@/components/ui/CheckboxField';
import Button from '@/components/ui/Button';
import {
    DataTable,
    DataTableHeader,
    DataTableBody,
    DataTableRow,
    DataTableHead,
    DataTableCell,
} from '@/components/ui/DataTable';
import { SearchIcon, LoadingIcon } from '@/features/workspace/shared/Icons';
import { listBackendResource, getBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import { formatIsoDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { HighlightText, LookupDropdownSurface, LookupEmptyState } from '@/features/workspace/shared/LookupPrimitives';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import {
    SALES_DOCUMENT_COPY_CONFIG_MAP,
    getItemKey,
    getCostKey,
    getAdvanceKey,
    extractDocumentItems,
    extractDocumentCosts,
    extractDocumentAdvances,
} from './salesDocumentCopyUtils';

export default function SalesDocumentCopyModal({
    open,
    onClose,
    option,
    partnerId,
    partnerField = 'customer_id',
    onApply,
}) {
    const optionKey = Object.keys(SALES_DOCUMENT_COPY_CONFIG_MAP).find(
        (k) => k.toLowerCase() === String(option || '').trim().toLowerCase()
    ) || option;

    const config = SALES_DOCUMENT_COPY_CONFIG_MAP[optionKey] || SALES_DOCUMENT_COPY_CONFIG_MAP['Pesanan'];
    const mode = config.mode || 'document';

    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [allDocs, setAllDocs] = useState([]);
    const [loadingAllDocs, setLoadingAllDocs] = useState(false);

    const [selectedDoc, setSelectedDoc] = useState(null);
    const [docDetails, setDocDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [activeTab, setActiveTab] = useState(config.tabs?.[0] || 'Informasi Pesanan');
    const [itemQuery, setItemQuery] = useState('');

    const [directRows, setDirectRows] = useState([]);
    const [loadingDirectRows, setLoadingDirectRows] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedCategoryName, setSelectedCategoryName] = useState('');

    const [selectedItems, setSelectedItems] = useState(new Set());
    const [selectedCosts, setSelectedCosts] = useState(new Set());
    const [selectedAdvances, setSelectedAdvances] = useState(new Set());

    const suggestionsRef = useRef(null);

    useEffect(() => {
        if (!open) {
            setQuery('');
            setSuggestions([]);
            setShowSuggestions(false);
            setSelectedDoc(null);
            setDocDetails(null);
            setAllDocs([]);
            setActiveTab(config.tabs?.[0] || 'Informasi Pesanan');
            setItemQuery('');
            setSelectedItems(new Set());
            setSelectedCosts(new Set());
            setSelectedAdvances(new Set());
            setDirectRows([]);
            setSelectedCategoryId('');
            setSelectedCategoryName('');
        }
    }, [open, config.tabs]);

    useEffect(() => {
        if (!open) return;

        if (mode === 'minimum_stocks') {
            const fetchMinStocks = async () => {
                setLoadingDirectRows(true);
                try {
                    const params = { per_page: 100 };
                    if (partnerId) params.supplier_id = partnerId;
                    const res = await listBackendResource('minimum-stocks', params);
                    const rows = res?.data ?? res ?? [];
                    setDirectRows(Array.isArray(rows) ? rows : []);
                } catch (e) {
                    setDirectRows([]);
                } finally {
                    setLoadingDirectRows(false);
                }
            };
            fetchMinStocks();
        } else if (mode === 'products_by_supplier') {
            const fetchProducts = async () => {
                setLoadingDirectRows(true);
                try {
                    const params = { per_page: 100 };
                    if (partnerId) params.supplier_id = partnerId;
                    if (selectedCategoryId) params.category_id = selectedCategoryId;
                    const res = await listBackendResource('products', params);
                    const rows = res?.data ?? res ?? [];
                    setDirectRows(Array.isArray(rows) ? rows : []);
                } catch (e) {
                    setDirectRows([]);
                } finally {
                    setLoadingDirectRows(false);
                }
            };
            fetchProducts();
        }
    }, [open, mode, partnerId, selectedCategoryId]);

    useEffect(() => {
        if (!open || mode !== 'document') return;

        const fetchAllDocs = async () => {
            setLoadingAllDocs(true);
            try {
                const params = { per_page: 50 };
                if (partnerId) params[partnerField] = partnerId;
                const response = await listBackendResource(config.resource, params);
                const rows = response?.data ?? response ?? [];
                setAllDocs(Array.isArray(rows) ? rows : []);
            } catch (err) {
                setAllDocs([]);
            } finally {
                setLoadingAllDocs(false);
            }
        };

        fetchAllDocs();
    }, [open, mode, config.resource, partnerId, partnerField]);

    useEffect(() => {
        if (!open || mode !== 'document' || !showSuggestions) return;

        const delayDebounce = setTimeout(async () => {
            setLoadingSuggestions(true);
            try {
                const params = { search: query.trim(), per_page: 15 };
                if (partnerId) params[partnerField] = partnerId;
                const response = await listBackendResource(config.resource, params);
                const rows = response?.data ?? response ?? [];
                setSuggestions(Array.isArray(rows) ? rows : []);
            } catch (err) {
                setSuggestions([]);
            } finally {
                setLoadingSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [query, open, mode, showSuggestions, config.resource, partnerId, partnerField]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const items = useMemo(() => {
        if (mode === 'minimum_stocks' || mode === 'products_by_supplier') {
            return directRows;
        }
        return extractDocumentItems(docDetails, allDocs);
    }, [mode, directRows, docDetails, allDocs]);

    const additionalCosts = useMemo(() => {
        if (mode !== 'document') return [];
        return extractDocumentCosts(docDetails, allDocs);
    }, [mode, docDetails, allDocs]);

    const advancePayments = useMemo(() => {
        if (mode !== 'document') return [];
        return extractDocumentAdvances(docDetails, allDocs);
    }, [mode, docDetails, allDocs]);

    useEffect(() => {
        const nextItems = new Set();
        items.forEach((item, index) => {
            nextItems.add(getItemKey(item, index));
        });
        setSelectedItems(nextItems);
    }, [items]);

    useEffect(() => {
        const nextCosts = new Set();
        additionalCosts.forEach((c, index) => {
            nextCosts.add(getCostKey(c, index));
        });
        setSelectedCosts(nextCosts);
    }, [additionalCosts]);

    useEffect(() => {
        const nextAdvances = new Set();
        advancePayments.forEach((a, index) => {
            nextAdvances.add(getAdvanceKey(a, index));
        });
        setSelectedAdvances(nextAdvances);
    }, [advancePayments]);

    async function handleSelectDoc(doc) {
        setSelectedDoc(doc);
        setShowSuggestions(false);
        setQuery(doc.document_number ?? '');
        setLoadingDetails(true);
        try {
            const data = await getBackendResource(config.resource, doc.id);
            setDocDetails(data);
        } catch (err) {
            setDocDetails(null);
        } finally {
            setLoadingDetails(false);
        }
    }

    function handleClearSelection() {
        setSelectedDoc(null);
        setDocDetails(null);
        setQuery('');
    }

    const filteredItems = useMemo(() => {
        if (!itemQuery.trim()) return items;
        const q = itemQuery.toLowerCase();
        return items.filter((line) => {
            const name = String(line.name ?? line.itemName ?? line.item_name ?? line.product_name ?? line.description ?? line.product?.name ?? '').toLowerCase();
            const code = String(line.code ?? line.item_code ?? line.itemCode ?? line.product_code ?? line.reference_code ?? line.product?.code ?? '').toLowerCase();
            return name.includes(q) || code.includes(q);
        });
    }, [items, itemQuery]);

    function toggleSelectAllItems() {
        const allSelected = filteredItems.every((item, i) => selectedItems.has(getItemKey(item, i)));
        const next = new Set(selectedItems);
        filteredItems.forEach((item, i) => {
            const key = getItemKey(item, i);
            if (allSelected) {
                next.delete(key);
            } else {
                next.add(key);
            }
        });
        setSelectedItems(next);
    }

    function toggleSelectItem(key) {
        const next = new Set(selectedItems);
        if (next.has(key)) {
            next.delete(key);
        } else {
            next.add(key);
        }
        setSelectedItems(next);
    }

    function toggleSelectAllCosts() {
        const allSelected = additionalCosts.every((c, i) => selectedCosts.has(getCostKey(c, i)));
        const next = new Set(selectedCosts);
        additionalCosts.forEach((c, i) => {
            const key = getCostKey(c, i);
            if (allSelected) {
                next.delete(key);
            } else {
                next.add(key);
            }
        });
        setSelectedCosts(next);
    }

    function toggleSelectCost(key) {
        const next = new Set(selectedCosts);
        if (next.has(key)) {
            next.delete(key);
        } else {
            next.add(key);
        }
        setSelectedCosts(next);
    }

    function toggleSelectAllAdvances() {
        const allSelected = advancePayments.every((a, i) => selectedAdvances.has(getAdvanceKey(a, i)));
        const next = new Set(selectedAdvances);
        advancePayments.forEach((a, i) => {
            const key = getAdvanceKey(a, i);
            if (allSelected) {
                next.delete(key);
            } else {
                next.add(key);
            }
        });
        setSelectedAdvances(next);
    }

    function toggleSelectAdvance(key) {
        const next = new Set(selectedAdvances);
        if (next.has(key)) {
            next.delete(key);
        } else {
            next.add(key);
        }
        setSelectedAdvances(next);
    }

    function handleLanjut() {
        if (!hasData || (selectedItems.size === 0 && selectedCosts.size === 0 && selectedAdvances.size === 0)) {
            onClose();
            return;
        }

        const finalItems = items
            .filter((item, index) => selectedItems.has(getItemKey(item, index)))
            .map((line, index) => {
                let unitPrice = Number(line.costPrice || line.cost_price || line.price || line.purchase_price || line.unit_price || 0);
                let minLimit = Number(line.raw_minimum_limit ?? line.minimum_limit ?? line.minimumLimit ?? line.minimumStock ?? 0);
                let currentStock = Number(line.raw_available_stock ?? line.available_stock ?? line.availableStock ?? 0);
                let qtyNeeded = line.qtyNeeded ?? Math.max(1, minLimit - currentStock);
                let qty = mode === 'minimum_stocks' ? qtyNeeded : Number(line.quantity ?? 1);
                let disc = Number(line.discount_amount ?? 0);
                let total = Math.max(0, qty * unitPrice - disc);
                let itemCode = line.code ?? line.item_code ?? line.itemCode ?? line.product_code ?? line.reference_code ?? line.product?.code ?? '-';
                let itemName = line.name ?? line.itemName ?? line.item_name ?? line.product_name ?? line.description ?? line.product?.name ?? '-';
                let itemNotes = line.notes ?? line.keterangan ?? line.memo ?? line.remarks ?? (line.item_name || line.name || line.product_name ? line.description : '') ?? '';

                return {
                    id: `copied-item-${Date.now()}-${index}-${Math.random()}`,
                    __lineId: null,
                    __productId: line.productId ?? line.product_id ?? line.product?.id ?? line.id ?? null,
                    name: itemName,
                    code: itemCode,
                    quantity: String(qty),
                    unit: typeof line.unit === 'object' ? (line.unit?.name ?? 'PCS') : (line.unit ?? 'PCS'),
                    price: unitPrice.toLocaleString('id-ID'),
                    discount: '0',
                    discountValue: String(disc),
                    total: total.toLocaleString('id-ID'),
                    notes: itemNotes,
                    description: itemNotes,
                };
            });

        const finalCosts = additionalCosts
            .filter((cost, index) => selectedCosts.has(getCostKey(cost, index)))
            .map((cost, index) => ({
                id: `copied-cost-${Date.now()}-${index}-${Math.random()}`,
                __lineId: null,
                __accountId: cost.__accountId ?? cost.account_id ?? null,
                name: cost.name,
                code: cost.code ?? '',
                amount: String(cost.amount ?? 0),
            }));

        const finalAdvances = advancePayments
            .filter((adv, index) => selectedAdvances.has(getAdvanceKey(adv, index)))
            .map((adv, index) => ({
                id: `copied-adv-${Date.now()}-${index}-${Math.random()}`,
                number: adv.number ?? adv.document_number ?? '',
                date: adv.date ?? adv.entry_date ?? '',
                amount: String(adv.amount ?? adv.total_amount ?? 0),
                notes: adv.notes ?? '',
            }));

        const firstSelectedRow = items.find((item, index) => selectedItems.has(getItemKey(item, index)));
        const resolvedSupplierName = firstSelectedRow?.supplier?.name ?? firstSelectedRow?.supplier?.full_name ?? firstSelectedRow?.supplier_name ?? (typeof firstSelectedRow?.supplier === 'string' ? firstSelectedRow.supplier : null);
        const resolvedSupplierId = firstSelectedRow?.supplier_id ?? firstSelectedRow?.supplier?.id ?? null;

        onApply?.({
            items: finalItems,
            additionalCosts: finalCosts,
            advancePayments: finalAdvances,
            sourceDocId: selectedDoc?.id ?? null,
            sourceDocType: config.resource ?? null,
            supplierName: resolvedSupplierName,
            supplierId: resolvedSupplierId,
        });

        onClose();
    }

    const isLoading = loadingAllDocs || loadingDetails || loadingDirectRows;
    const hasData = items.length > 0 || additionalCosts.length > 0 || advancePayments.length > 0;
    const hasTabs = (config.tabs ?? []).length > 0 && mode === 'document';

    const modalTitle =
        mode === 'minimum_stocks'
            ? 'Barang perlu dipesan'
            : mode === 'products_by_supplier'
            ? 'Barang per pemasok'
            : `Salin dari ${config.title}`;

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            title={modalTitle}
            maxWidthClassName="!max-w-[800px] w-full"
            contentClassName="bg-white px-5 py-4 sm:px-6 flex flex-col min-h-[380px]"
            footer={
                <div className="flex justify-end">
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleLanjut}
                        className="px-6 font-medium"
                    >
                        Lanjut
                    </Button>
                </div>
            }
        >
            {/* Header Search for Document Mode ONLY */}
            {mode === 'document' && (
                <div className="relative mb-2 max-w-[50%]" ref={suggestionsRef}>
                    <TextInput
                        value={query}
                        onChange={(e) => {
                            const val = e.target.value;
                            setQuery(val);
                            if (!val.trim()) {
                                handleClearSelection();
                            } else {
                                setShowSuggestions(true);
                            }
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder={config.placeholder}
                        trailing={
                            loadingSuggestions ? (
                                <LoadingIcon className="h-4 w-4 animate-spin text-slate-400" />
                            ) : (
                                <SearchIcon className="h-4 w-4 text-slate-400" />
                            )
                        }
                        className="h-[40px] rounded-[4px] border-ui-border w-full"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />

                    {showSuggestions && (
                        <LookupDropdownSurface
                            anchorRef={suggestionsRef}
                            onClose={() => setShowSuggestions(false)}
                            className="w-full"
                        >
                            <div className="max-h-[220px] overflow-y-auto bg-white flex-1 min-h-0 divide-y divide-slate-100">
                                {suggestions.length > 0 ? (
                                    suggestions.map((doc) => {
                                        const rawBranch = doc.branch?.name ?? doc.branch_name ?? (typeof doc.branch === 'string' ? doc.branch : 'Kantor Pusat');
                                        const branchName = String(rawBranch || 'Kantor Pusat')
                                            .toLowerCase()
                                            .replace(/\b\w/g, (c) => c.toUpperCase());

                                        return (
                                            <button
                                                key={doc.id}
                                                type="button"
                                                onClick={() => handleSelectDoc(doc)}
                                                className="flex w-full flex-col gap-2 px-4 py-3 text-left transition hover:bg-slate-50 border-t border-slate-100 first:border-t-0"
                                            >
                                                <span className="flex w-full items-center justify-between gap-4">
                                                    <span className="truncate text-xs sm:text-sm font-normal text-brand-dark">
                                                        <HighlightText text={doc.document_number} search={query} />
                                                    </span>
                                                </span>
                                                <span className="flex w-full items-center justify-between gap-4 text-xs sm:text-[13px] text-black">
                                                    <span className="truncate">{formatIsoDate(doc.entry_date ?? doc.document_date ?? doc.created_at)}</span>
                                                    <span className="shrink-0 italic capitalize">{branchName}</span>
                                                </span>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <LookupEmptyState
                                        title={loadingSuggestions ? 'Mencari...' : 'Tidak ada dokumen ditemukan.'}
                                    />
                                )}
                            </div>
                        </LookupDropdownSurface>
                    )}
                </div>
            )}

            {/* Split Top Controls for Products by Supplier Mode ONLY */}
            {mode === 'products_by_supplier' && (
                <div className="mb-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <AccountLookupTextInput
                            resource="product-categories"
                            value={selectedCategoryName}
                            placeholder="Cari/Pilih Kategori Barang..."
                            searchLabel="Cari kategori barang"
                            dialogTitle="Pilih Kategori Barang"
                            onSelectAccount={(item) => {
                                setSelectedCategoryId(item ? String(item.id) : '');
                                setSelectedCategoryName(item ? item.name : '');
                            }}
                            className="h-[40px] rounded-[4px] border-ui-border w-full"
                        />
                    </div>
                    <div>
                        <TextInput
                            value={itemQuery}
                            onChange={(e) => setItemQuery(e.target.value)}
                            placeholder="Cari Kode / Nama Barang..."
                            trailing={<SearchIcon className="h-4 w-4 text-slate-400" />}
                            className="h-[40px] rounded-[4px] border-ui-border w-full"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col min-h-0">
                {/* Tabs ONLY for document mode when config has tabs */}
                {hasTabs && (
                    <div className="flex border-b border-slate-200 mb-2">
                        {config.tabs.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-sm font-normal transition border-b-2 -mb-[2px] ${
                                    activeTab === tab
                                        ? 'border-brand-primary text-brand-primary'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                )}

                {/* Main Table Content */}
                {(activeTab === 'Rincian Barang' || activeTab === 'Informasi Pesanan' || !hasTabs) && (
                    <div className="flex-1 flex flex-col min-h-0">
                        {mode === 'document' && (
                            <div className="mb-1.5">
                                <TextInput
                                    value={itemQuery}
                                    onChange={(e) => setItemQuery(e.target.value)}
                                    placeholder="Cari..."
                                    trailing={<SearchIcon className="h-4 w-4 text-slate-400" />}
                                    className="h-[36px] rounded-[4px] border-ui-border max-w-[280px]"
                                    inputClassName="text-xs text-brand-dark"
                                />
                            </div>
                        )}

                        <div className="flex-1 overflow-auto rounded-[4px] max-h-[320px]">
                            <DataTable>
                                <DataTableHeader>
                                    <DataTableRow>
                                        <DataTableHead className="w-px px-3 text-center text-white">
                                            <CheckboxField
                                                id="select-all-items"
                                                checked={filteredItems.length > 0 && filteredItems.every((item, i) => selectedItems.has(getItemKey(item, i)))}
                                                onChange={toggleSelectAllItems}
                                                align="center"
                                                inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                                containerClassName="flex justify-center"
                                            />
                                        </DataTableHead>
                                        <DataTableHead className="w-[160px] text-white">Kode #</DataTableHead>
                                        <DataTableHead className="text-white">Nama Barang</DataTableHead>
                                        {mode === 'products_by_supplier' ? null : (
                                            <>
                                                <DataTableHead className="w-[100px] text-right text-white">Kuantitas</DataTableHead>
                                                <DataTableHead className="w-[80px] text-center text-white">Satuan</DataTableHead>
                                            </>
                                        )}
                                        <DataTableHead className="w-[180px] text-white">Keterangan</DataTableHead>
                                    </DataTableRow>
                                </DataTableHeader>
                                <DataTableBody>
                                    {isLoading ? (
                                        <DataTableRow className="bg-white">
                                            <DataTableCell colSpan={mode === 'products_by_supplier' ? 4 : 6} className="px-3 py-2.5 text-center text-sm text-text-workspace-dark bg-white">
                                                Memuat data...
                                            </DataTableCell>
                                        </DataTableRow>
                                    ) : filteredItems.length > 0 ? (
                                        filteredItems.map((item, index) => {
                                            const key = getItemKey(item, index);
                                            const isSelected = selectedItems.has(key);
                                            const minLimit = Number(item.raw_minimum_limit ?? item.minimum_limit ?? item.minimumLimit ?? item.minimumStock ?? 0);
                                            const currentStock = Number(item.raw_available_stock ?? item.available_stock ?? item.availableStock ?? 0);
                                            const qtyNeeded = item.qtyNeeded ?? Math.max(1, minLimit - currentStock);
                                            const itemCode = item.code ?? item.item_code ?? item.itemCode ?? item.product_code ?? item.reference_code ?? item.product?.code ?? '-';
                                            const itemName = item.name ?? item.itemName ?? item.item_name ?? item.product_name ?? item.description ?? item.product?.name ?? '-';
                                            const itemNotes = item.notes ?? item.keterangan ?? item.memo ?? item.remarks ?? (item.name || item.itemName || item.item_name || item.product_name ? item.description : '') ?? '-';

                                            return (
                                                <DataTableRow
                                                    key={key}
                                                    onClick={() => toggleSelectItem(key)}
                                                    className={`cursor-pointer transition hover:bg-slate-50 ${isSelected ? 'bg-blue-50/60' : ''}`}
                                                >
                                                    <DataTableCell className="w-px px-3 text-center">
                                                        <CheckboxField
                                                            id={`select-item-${key}`}
                                                            checked={isSelected}
                                                            onChange={() => toggleSelectItem(key)}
                                                            align="center"
                                                            inputClassName="h-3.5 w-3.5 rounded-[3px] pointer-events-none"
                                                            containerClassName="flex justify-center"
                                                        />
                                                    </DataTableCell>
                                                    <DataTableCell className="font-normal text-slate-700 truncate max-w-[160px]">
                                                        {itemCode}
                                                    </DataTableCell>
                                                    <DataTableCell className="text-slate-600 truncate">
                                                        {itemName}
                                                    </DataTableCell>
                                                    {mode === 'products_by_supplier' ? null : mode === 'minimum_stocks' ? (
                                                        <>
                                                            <DataTableCell className="text-slate-600 text-right font-medium text-amber-700">
                                                                {qtyNeeded}
                                                            </DataTableCell>
                                                            <DataTableCell className="text-slate-600 text-center">
                                                                {typeof item.unit === 'object' ? (item.unit?.name ?? 'PCS') : (item.unit ?? 'PCS')}
                                                            </DataTableCell>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <DataTableCell className="text-slate-600 text-right">
                                                                {Number(item.quantity ?? 0).toLocaleString('id-ID')}
                                                            </DataTableCell>
                                                            <DataTableCell className="text-slate-600 text-center">
                                                                {typeof item.unit === 'object' ? (item.unit?.name ?? '-') : (item.unit ?? '-')}
                                                            </DataTableCell>
                                                        </>
                                                    )}
                                                    <DataTableCell className="text-slate-600 truncate max-w-[180px]">
                                                        {itemNotes || '-'}
                                                    </DataTableCell>
                                                </DataTableRow>
                                            );
                                        })
                                    ) : (
                                        <DataTableRow className="bg-white">
                                            <DataTableCell colSpan={mode === 'products_by_supplier' ? 4 : 6} className="px-3 py-2.5 text-center text-sm text-text-workspace-dark bg-white">
                                                Tidak ada data
                                            </DataTableCell>
                                        </DataTableRow>
                                    )}
                                </DataTableBody>
                            </DataTable>
                        </div>
                    </div>
                )}

                {hasTabs && activeTab === 'Biaya Lainnya' && (
                    <div className="flex-1 overflow-auto rounded-[4px] max-h-[300px]">
                        <DataTable>
                            <DataTableHeader>
                                <DataTableRow>
                                    <DataTableHead className="w-px px-3 text-center text-white">
                                        <CheckboxField
                                            id="select-all-costs"
                                            checked={additionalCosts.length > 0 && additionalCosts.every((c, i) => selectedCosts.has(getCostKey(c, i)))}
                                            onChange={toggleSelectAllCosts}
                                            align="center"
                                            inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                            containerClassName="flex justify-center"
                                        />
                                    </DataTableHead>
                                    <DataTableHead className="w-[140px] text-white">Kode #</DataTableHead>
                                    <DataTableHead className="text-white">Nama Biaya</DataTableHead>
                                    <DataTableHead className="w-[140px] text-right text-white">Jumlah</DataTableHead>
                                </DataTableRow>
                            </DataTableHeader>
                            <DataTableBody>
                                {isLoading ? (
                                    <DataTableRow className="bg-white">
                                        <DataTableCell colSpan={4} className="px-3 py-6 text-center text-sm text-text-workspace-dark bg-white">
                                            Memuat data...
                                        </DataTableCell>
                                    </DataTableRow>
                                ) : additionalCosts.length > 0 ? (
                                    additionalCosts.map((cost, i) => {
                                        const key = getCostKey(cost, i);
                                        const isSelected = selectedCosts.has(key);
                                        return (
                                            <DataTableRow
                                                key={key}
                                                onClick={() => toggleSelectCost(key)}
                                                className={`cursor-pointer transition hover:bg-slate-50 ${isSelected ? 'bg-blue-50/60' : ''}`}
                                            >
                                                <DataTableCell className="w-px px-3 text-center">
                                                    <CheckboxField
                                                        id={`select-cost-${key}`}
                                                        checked={isSelected}
                                                        onChange={() => toggleSelectCost(key)}
                                                        align="center"
                                                        inputClassName="h-3.5 w-3.5 rounded-[3px] pointer-events-none"
                                                        containerClassName="flex justify-center"
                                                    />
                                                </DataTableCell>
                                                <DataTableCell className="font-normal text-slate-700 truncate max-w-[140px]">
                                                    {cost.code ?? '-'}
                                                </DataTableCell>
                                                <DataTableCell className="text-slate-600 truncate">
                                                    {cost.name ?? '-'}
                                                </DataTableCell>
                                                <DataTableCell className="text-slate-600 text-right">
                                                    Rp {Number(cost.amount ?? 0).toLocaleString('id-ID')}
                                                </DataTableCell>
                                            </DataTableRow>
                                        );
                                    })
                                ) : (
                                    <DataTableRow className="bg-white">
                                        <DataTableCell colSpan={4} className="px-3 py-2.5 text-center text-sm text-text-workspace-dark bg-white">
                                            Tidak ada data biaya lainnya.
                                        </DataTableCell>
                                    </DataTableRow>
                                )}
                            </DataTableBody>
                        </DataTable>
                    </div>
                )}

                {hasTabs && activeTab === 'Uang Muka' && (
                    <div className="flex-1 overflow-auto rounded-[4px] max-h-[300px]">
                        <DataTable>
                            <DataTableHeader>
                                <DataTableRow>
                                    <DataTableHead className="w-px px-3 text-center text-white">
                                        <CheckboxField
                                            id="select-all-advances"
                                            checked={advancePayments.length > 0 && advancePayments.every((a, i) => selectedAdvances.has(getAdvanceKey(a, i)))}
                                            onChange={toggleSelectAllAdvances}
                                            align="center"
                                            inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                            containerClassName="flex justify-center"
                                        />
                                    </DataTableHead>
                                    <DataTableHead className="w-[180px] text-white">No Faktur #</DataTableHead>
                                    <DataTableHead className="text-white">Tanggal</DataTableHead>
                                    <DataTableHead className="w-[140px] text-right text-white">Uang Muka</DataTableHead>
                                </DataTableRow>
                            </DataTableHeader>
                            <DataTableBody>
                                {isLoading ? (
                                    <DataTableRow className="bg-white">
                                        <DataTableCell colSpan={4} className="px-3 py-2.5 text-center text-sm text-text-workspace-dark bg-white">
                                            Memuat data...
                                        </DataTableCell>
                                    </DataTableRow>
                                ) : advancePayments.length > 0 ? (
                                    advancePayments.map((adv, i) => {
                                        const key = getAdvanceKey(adv, i);
                                        const isSelected = selectedAdvances.has(key);
                                        return (
                                            <DataTableRow
                                                key={key}
                                                onClick={() => toggleSelectAdvance(key)}
                                                className={`cursor-pointer transition hover:bg-slate-50 ${isSelected ? 'bg-blue-50/60' : ''}`}
                                            >
                                                <DataTableCell className="w-px px-3 text-center">
                                                    <CheckboxField
                                                        id={`select-adv-${key}`}
                                                        checked={isSelected}
                                                        onChange={() => toggleSelectAdvance(key)}
                                                        align="center"
                                                        inputClassName="h-3.5 w-3.5 rounded-[3px] pointer-events-none"
                                                        containerClassName="flex justify-center"
                                                    />
                                                </DataTableCell>
                                                <DataTableCell className="font-normal text-slate-700 truncate max-w-[180px]">
                                                    {adv.number ?? adv.document_number ?? '-'}
                                                </DataTableCell>
                                                <DataTableCell className="text-slate-600">
                                                    {formatIsoDate(adv.date ?? adv.entry_date)}
                                                </DataTableCell>
                                                <DataTableCell className="text-slate-600 text-right">
                                                    Rp {Number(adv.amount ?? adv.total_amount ?? 0).toLocaleString('id-ID')}
                                                </DataTableCell>
                                            </DataTableRow>
                                        );
                                    })
                                ) : (
                                    <DataTableRow className="bg-white">
                                        <DataTableCell colSpan={4} className="px-3 py-2.5 text-center text-sm text-text-workspace-dark bg-white">
                                            Tidak ada data uang muka.
                                        </DataTableCell>
                                    </DataTableRow>
                                )}
                            </DataTableBody>
                        </DataTable>
                    </div>
                )}
            </div>
        </WorkspaceDialog>
    );
}
