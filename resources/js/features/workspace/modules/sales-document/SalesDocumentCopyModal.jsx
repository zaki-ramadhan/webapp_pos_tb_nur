import { useState, useEffect, useRef, useMemo } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import TextInput from '@/components/ui/TextInput';
import CheckboxField from '@/components/ui/CheckboxField';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
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
import { LookupDropdownSurface, LookupEmptyState } from '@/features/workspace/shared/LookupPrimitives';
import { SearchX } from 'lucide-react';

export default function SalesDocumentCopyModal({
    open,
    onClose,
    option,
    partnerId,
    partnerField = 'customer_id',
    onApply,
}) {
    const configMap = useMemo(() => ({
        'Penawaran': {
            resource: 'sales-quotes',
            title: 'Penawaran Penjualan',
            placeholder: 'Cari/Pilih Penawaran...',
            tabs: ['Rincian Barang', 'Biaya Lainnya'],
        },
        'Pesanan': {
            resource: 'sales-orders',
            title: 'Pesanan Penjualan',
            placeholder: 'Cari/Pilih Pesanan...',
            tabs: ['Rincian Barang', 'Biaya Lainnya', 'Uang Muka'],
        },
        'Pengiriman': {
            resource: 'sales-deliveries',
            title: 'Pengiriman Penjualan',
            placeholder: 'Cari/Pilih Pengiriman...',
            tabs: ['Rincian Barang', 'Biaya Lainnya', 'Uang Muka'],
        },
        'Pembelian': {
            resource: 'purchase-orders',
            title: 'Pesanan Pembelian',
            placeholder: 'Cari/Pilih Pesanan Pembelian...',
            tabs: ['Rincian Barang'],
        },
    }), []);

    const config = configMap[option] || configMap['Pesanan'];

    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // All available documents for the partner
    const [allDocs, setAllDocs] = useState([]);
    const [loadingAllDocs, setLoadingAllDocs] = useState(false);

    const [selectedDoc, setSelectedDoc] = useState(null);
    const [docDetails, setDocDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const isLoading = loadingAllDocs || loadingDetails;

    const [activeTab, setActiveTab] = useState('Rincian Barang');
    const [itemQuery, setItemQuery] = useState('');

    const [selectedItems, setSelectedItems] = useState(new Set());
    const [selectedCosts, setSelectedCosts] = useState(new Set());
    const [selectedAdvances, setSelectedAdvances] = useState(new Set());

    const suggestionsRef = useRef(null);

    // Initial resets
    useEffect(() => {
        if (!open) {
            setQuery('');
            setSuggestions([]);
            setShowSuggestions(false);
            setSelectedDoc(null);
            setDocDetails(null);
            setAllDocs([]);
            setActiveTab('Rincian Barang');
            setItemQuery('');
            setSelectedItems(new Set());
            setSelectedCosts(new Set());
            setSelectedAdvances(new Set());
        }
    }, [open]);

    // Fetch all documents for the partner immediately on open
    useEffect(() => {
        if (!open) return;

        const fetchAllDocs = async () => {
            setLoadingAllDocs(true);
            try {
                const params = {
                    per_page: 50,
                };
                if (partnerId) {
                    params[partnerField] = partnerId;
                }
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
    }, [open, config.resource, partnerId, partnerField]);

    // Query suggestions as user types
    useEffect(() => {
        if (!open || !showSuggestions) return;

        const delayDebounce = setTimeout(async () => {
            setLoadingSuggestions(true);
            try {
                const params = {
                    search: query.trim(),
                    per_page: 15,
                };
                if (partnerId) {
                    params[partnerField] = partnerId;
                }
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
    }, [query, open, showSuggestions, config.resource, partnerId, partnerField]);

    // Close suggestions on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get table items/costs/advances
    const items = useMemo(() => {
        if (docDetails) {
            return docDetails.lines ?? [];
        }
        return allDocs.flatMap(d => (d.lines ?? []).map(l => ({ ...l, __docNumber: d.document_number, __docId: d.id })));
    }, [docDetails, allDocs]);

    const additionalCosts = useMemo(() => {
        if (docDetails) {
            return docDetails.metadata?.additional_costs ?? [];
        }
        return allDocs.flatMap(d => (d.metadata?.additional_costs ?? []).map((c, i) => ({ ...c, id: c.id ?? i, __docNumber: d.document_number, __docId: d.id })));
    }, [docDetails, allDocs]);

    const advancePayments = useMemo(() => {
        if (docDetails) {
            return docDetails.metadata?.advance_payments ?? [];
        }
        return allDocs.flatMap(d => (d.metadata?.advance_payments ?? []).map((a, i) => ({ ...a, id: a.id ?? i, __docNumber: d.document_number, __docId: d.id })));
    }, [docDetails, allDocs]);

    // Unique keys builders to prevent clashes
    const getItemKey = (item, index) => String(item.id ?? `${item.__docId ?? 'doc'}_${index}`);
    const getCostKey = (c, index) => String(c.id ?? `${c.__docId ?? 'doc'}_${index}`);
    const getAdvanceKey = (a, index) => String(a.id ?? `${a.__docId ?? 'doc'}_${index}`);

    // Auto-select all items on loading/changing
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
        return items.filter(line => {
            const name = String(line.description ?? line.product?.name ?? '').toLowerCase();
            const code = String(line.reference_code ?? line.product?.code ?? '').toLowerCase();
            const q = itemQuery.toLowerCase();
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
                const unitPrice = Number(line.unit_price ?? 0);
                const qty = Number(line.quantity ?? 1);
                const disc = Number(line.discount_amount ?? 0);
                const total = Math.max(0, qty * unitPrice - disc);
                return {
                    id: `copied-item-${Date.now()}-${index}-${Math.random()}`,
                    __lineId: null,
                    __productId: line.product_id ?? line.product?.id ?? null,
                    name: line.description ?? line.product?.name ?? '',
                    code: line.reference_code ?? line.product?.code ?? '',
                    quantity: String(qty),
                    unit: line.unit?.name ?? 'PCS',
                    price: unitPrice.toLocaleString('id-ID'),
                    discount: '0',
                    discountValue: String(disc),
                    total: total.toLocaleString('id-ID'),
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

        onApply?.({
            items: finalItems,
            additionalCosts: finalCosts,
            advancePayments: finalAdvances,
        });

        onClose();
    }

    const hasData = items.length > 0 || additionalCosts.length > 0 || advancePayments.length > 0;

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            title={`Salin dari ${config.title}`}
            maxWidthClassName="!max-w-[800px] w-full"
            contentClassName="bg-white px-5 py-4 sm:px-6 flex flex-col min-h-[420px]"
            footer={
                <div className="flex justify-end">
                    <Button
                        variant="brand-blue"
                        onClick={handleLanjut}
                        className="px-6 py-1 !text-lg !font-normal"
                    >
                        Lanjut
                    </Button>
                </div>
            }
        >
            <div className="relative mb-4 max-w-[50%]" ref={suggestionsRef}>
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
                                suggestions.map((doc) => (
                                    <button
                                        key={doc.id}
                                        type="button"
                                        onClick={() => handleSelectDoc(doc)}
                                        className="flex w-full flex-col px-4 py-2.5 text-left transition hover:bg-slate-50"
                                    >
                                        <span className="text-xs sm:text-sm font-medium text-brand-dark">
                                            {doc.document_number}
                                        </span>
                                        <span className="mt-0.5 text-[11px] text-slate-500">
                                            Tanggal: {formatIsoDate(doc.entry_date)} • Total: Rp {Number(doc.total_amount ?? 0).toLocaleString('id-ID')}
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <LookupEmptyState
                                    title={loadingSuggestions ? 'Mencari...' : 'Tidak ada dokumen ditemukan.'}
                                />
                            )}
                        </div>
                    </LookupDropdownSurface>
                )}
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex border-b border-slate-200 mb-3">
                        {config.tabs.map(tab => (
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

                    {activeTab === 'Rincian Barang' && (
                        <div className="flex-1 flex flex-col min-h-0">
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

                            <div className="flex-1 overflow-auto rounded-[4px] max-h-[300px]">
                                <DataTable>
                                    <DataTableHeader>
                                        <DataTableRow>
                                            <DataTableHead className="w-[38px] text-center text-white">
                                                <CheckboxField
                                                    id="select-all-items"
                                                    checked={filteredItems.length > 0 && filteredItems.every((item, i) => selectedItems.has(getItemKey(item, i)))}
                                                    onChange={toggleSelectAllItems}
                                                    align="center"
                                                    inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                                    containerClassName="w-auto"
                                                />
                                            </DataTableHead>
                                            <DataTableHead className="w-[140px] text-white">Kode #</DataTableHead>
                                            <DataTableHead className="text-white">Nama Barang</DataTableHead>
                                            <DataTableHead className="w-[100px] text-right text-white">Kuantitas</DataTableHead>
                                            <DataTableHead className="w-[80px] text-center text-white">Satuan</DataTableHead>
                                        </DataTableRow>
                                    </DataTableHeader>
                                    <DataTableBody>
                                        {isLoading ? (
                                            <DataTableRow className="bg-white">
                                                <DataTableCell colSpan={5} className="px-3 py-6 text-center text-sm text-text-workspace-dark bg-white">
                                                    Memuat data...
                                                </DataTableCell>
                                            </DataTableRow>
                                        ) : filteredItems.length > 0 ? (
                                            filteredItems.map((item, index) => {
                                                const key = getItemKey(item, index);
                                                return (
                                                    <DataTableRow key={key}>
                                                        <DataTableCell className="text-center px-1">
                                                            <CheckboxField
                                                                id={`select-item-${key}`}
                                                                checked={selectedItems.has(key)}
                                                                onChange={() => toggleSelectItem(key)}
                                                                align="center"
                                                                inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                                                containerClassName="w-auto"
                                                            />
                                                        </DataTableCell>
                                                        <DataTableCell className="font-medium text-slate-700 truncate max-w-[140px]">
                                                            {item.code ?? item.reference_code ?? '-'}
                                                        </DataTableCell>
                                                        <DataTableCell className="text-slate-600 truncate">
                                                            {item.name ?? item.description ?? '-'}
                                                        </DataTableCell>
                                                        <DataTableCell className="text-slate-600 text-right font-mono">
                                                            {item.quantity}
                                                        </DataTableCell>
                                                        <DataTableCell className="text-slate-600 text-center">
                                                            {item.unit ?? item.unit?.name ?? '-'}
                                                        </DataTableCell>
                                                    </DataTableRow>
                                                );
                                            })
                                        ) : (
                                            <DataTableRow className="bg-white">
                                                <DataTableCell colSpan={5} className="px-3 py-6 text-center text-sm text-text-workspace-dark bg-white">
                                                    Belum ada data barang.
                                                </DataTableCell>
                                            </DataTableRow>
                                        )}
                                    </DataTableBody>
                                </DataTable>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Biaya Lainnya' && (
                        <div className="flex-1 overflow-auto rounded-[4px] max-h-[300px]">
                            <DataTable>
                                <DataTableHeader>
                                    <DataTableRow>
                                        <DataTableHead className="w-[38px] text-center text-white">
                                            <CheckboxField
                                                id="select-all-costs"
                                                checked={additionalCosts.length > 0 && additionalCosts.every((c, i) => selectedCosts.has(getCostKey(c, i)))}
                                                onChange={toggleSelectAllCosts}
                                                align="center"
                                                inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                                containerClassName="w-auto"
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
                                            return (
                                                <DataTableRow key={key}>
                                                    <DataTableCell className="text-center px-1">
                                                        <CheckboxField
                                                            id={`select-cost-${key}`}
                                                            checked={selectedCosts.has(key)}
                                                            onChange={() => toggleSelectCost(key)}
                                                            align="center"
                                                            inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                                            containerClassName="w-auto"
                                                        />
                                                    </DataTableCell>
                                                    <DataTableCell className="font-medium text-slate-700 truncate max-w-[140px]">
                                                        {cost.code ?? '-'}
                                                    </DataTableCell>
                                                    <DataTableCell className="text-slate-600 truncate">
                                                        {cost.name ?? '-'}
                                                    </DataTableCell>
                                                    <DataTableCell className="text-slate-600 text-right font-mono">
                                                        Rp {Number(cost.amount ?? 0).toLocaleString('id-ID')}
                                                    </DataTableCell>
                                                </DataTableRow>
                                            );
                                        })
                                    ) : (
                                        <DataTableRow className="bg-white">
                                            <DataTableCell colSpan={4} className="px-3 py-6 text-center text-sm text-text-workspace-dark bg-white">
                                                Belum ada data biaya lainnya.
                                            </DataTableCell>
                                        </DataTableRow>
                                    )}
                                </DataTableBody>
                            </DataTable>
                        </div>
                    )}

                    {activeTab === 'Uang Muka' && (
                        <div className="flex-1 overflow-auto rounded-[4px] max-h-[300px]">
                            <DataTable>
                                <DataTableHeader>
                                    <DataTableRow>
                                        <DataTableHead className="w-[38px] text-center text-white">
                                            <CheckboxField
                                                id="select-all-advances"
                                                checked={advancePayments.length > 0 && advancePayments.every((a, i) => selectedAdvances.has(getAdvanceKey(a, i)))}
                                                onChange={toggleSelectAllAdvances}
                                                align="center"
                                                inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                                containerClassName="w-auto"
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
                                            <DataTableCell colSpan={4} className="px-3 py-6 text-center text-sm text-text-workspace-dark bg-white">
                                                Memuat data...
                                            </DataTableCell>
                                        </DataTableRow>
                                    ) : advancePayments.length > 0 ? (
                                        advancePayments.map((adv, i) => {
                                            const key = getAdvanceKey(adv, i);
                                            return (
                                                <DataTableRow key={key}>
                                                    <DataTableCell className="text-center px-1">
                                                        <CheckboxField
                                                            id={`select-adv-${key}`}
                                                            checked={selectedAdvances.has(key)}
                                                            onChange={() => toggleSelectAdvance(key)}
                                                            align="center"
                                                            inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                                            containerClassName="w-auto"
                                                        />
                                                    </DataTableCell>
                                                    <DataTableCell className="font-medium text-slate-700 truncate max-w-[180px]">
                                                        {adv.number ?? adv.document_number ?? '-'}
                                                    </DataTableCell>
                                                    <DataTableCell className="text-slate-600">
                                                        {formatIsoDate(adv.date ?? adv.entry_date)}
                                                    </DataTableCell>
                                                    <DataTableCell className="text-slate-600 text-right font-mono">
                                                        Rp {Number(adv.amount ?? adv.total_amount ?? 0).toLocaleString('id-ID')}
                                                    </DataTableCell>
                                                </DataTableRow>
                                            );
                                        })
                                    ) : (
                                        <DataTableRow className="bg-white">
                                            <DataTableCell colSpan={4} className="px-3 py-6 text-center text-sm text-text-workspace-dark bg-white">
                                                Belum ada data uang muka.
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
