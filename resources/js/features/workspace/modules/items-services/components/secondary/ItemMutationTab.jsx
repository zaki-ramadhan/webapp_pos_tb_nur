import { useEffect, useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import SelectField from '@/components/ui/SelectField';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import { RefreshIcon } from '@/features/workspace/shared/Icons';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { extractBackendRows, listBackendResource, clearBackendCache } from '@/features/workspace/backend/workspaceBackendApi';
import { formatAmountInput, parseAmountInput } from '@/features/workspace/shared/amountFormatting';

function getDefaultDateFrom() {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getTodayDate() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function ItemMutationTab({ productId, product = null, values = null }) {
    const [dateFrom, setDateFrom] = useState(getDefaultDateFrom);
    const [dateTo, setDateTo] = useState(getTodayDate);
    const [search, setSearch] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(25);
    const [paginationMeta, setPaginationMeta] = useState({
        total: 0,
        lastPage: 1,
        from: 0,
        to: 0,
    });

    const baseUnit = values?.primaryUnit?.[0] ?? product?.base_unit ?? null;
    const baseUnitName = baseUnit?.name ?? (typeof baseUnit === 'string' ? baseUnit : (values?.unitName ?? 'PCS'));
    const conversions = Array.isArray(values?.unitConversions)
        ? values.unitConversions
        : (Array.isArray(product?.conversions) ? product.conversions : []);

    const unitOptions = useMemo(() => {
        const opts = [{ value: baseUnitName, label: baseUnitName, ratio: 1 }];
        conversions.forEach((c) => {
            const name = c.unitName ?? c.unit?.[0]?.name ?? c.name;
            const ratio = Number(c.quantity || 1);
            if (name && !opts.some((o) => o.value === name)) {
                opts.push({ value: name, label: name, ratio: ratio > 0 ? ratio : 1 });
            }
        });
        return opts;
    }, [baseUnitName, conversions]);

    const [selectedUnit, setSelectedUnit] = useState(baseUnitName);

    useEffect(() => {
        if (!unitOptions.some((o) => o.value === selectedUnit)) {
            setSelectedUnit(baseUnitName);
        }
    }, [unitOptions, baseUnitName, selectedUnit]);

    const selectedRatio = useMemo(() => {
        const opt = unitOptions.find((o) => o.value === selectedUnit);
        return opt?.ratio || 1;
    }, [unitOptions, selectedUnit]);

    useEffect(() => {
        setDateFrom(getDefaultDateFrom());
        setDateTo(getTodayDate());
        setPage(1);
    }, [productId]);

    const fetchMutations = async (force = false) => {
        if (!productId) return;
        setLoading(true);
        try {
            if (force) {
                clearBackendCache('product-mutations');
            }
            const res = await listBackendResource('product-mutations', {
                product_id: productId,
                date_from: dateFrom,
                date_to: dateTo,
                search: appliedSearch || undefined,
                page,
                per_page: perPage,
                ...(force ? { _refresh: Date.now() } : {}),
            });
            const extracted = extractBackendRows(res);
            setRows(extracted);
            setPaginationMeta({
                total: typeof res?.total === 'number' ? res.total : extracted.length,
                lastPage: typeof res?.last_page === 'number' ? res.last_page : 1,
                from: typeof res?.from === 'number' ? res.from : (extracted.length > 0 ? 1 : 0),
                to: typeof res?.to === 'number' ? res.to : extracted.length,
            });
        } catch {
            setRows([]);
            setPaginationMeta({ total: 0, lastPage: 1, from: 0, to: 0 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMutations();
    }, [productId, dateFrom, dateTo, appliedSearch, page, perPage]);

    const handleOpenDocument = (row) => {
        if (!row.page_id || !row.document_id) return;

        window.dispatchEvent(
            new CustomEvent('workspace:open-page', {
                detail: {
                    pageId: row.page_id,
                    recordId: row.document_id,
                    tabLabel: row.document_number || 'Dokumen',
                    label: row.document_number || 'Dokumen',
                },
            }),
        );
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
                <TransactionDateInput
                    value={dateFrom}
                    onChange={(e) => {
                        const nextDateFrom = typeof e === 'string' ? e : e?.target?.value;
                        if (nextDateFrom) {
                            setDateFrom(nextDateFrom);
                            setPage(1);
                            if (dateTo && nextDateFrom > dateTo) {
                                setDateTo(nextDateFrom);
                            }
                        }
                    }}
                    className="w-[130px] sm:w-[140px]"
                />
                <span className="text-sm text-slate-500 font-normal">s/d</span>
                <TransactionDateInput
                    value={dateTo}
                    minDate={dateFrom}
                    onChange={(e) => {
                        const nextDateTo = typeof e === 'string' ? e : e?.target?.value;
                        if (nextDateTo) {
                            setDateTo(nextDateTo);
                            setPage(1);
                        }
                    }}
                    className="w-[130px] sm:w-[140px]"
                />
                <button
                    type="button"
                    onClick={() => {
                        setPage(1);
                        fetchMutations(true);
                    }}
                    disabled={loading}
                    aria-label="Muat ulang"
                    className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue hover:bg-brand-blue-lightest transition cursor-pointer disabled:opacity-60"
                >
                    <RefreshIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>

                {/* Unit Dropdown */}
                <div className="w-[100px] sm:w-[120px]">
                    <SelectField
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        className="h-[34px] rounded-[4px] border-ui-border"
                        selectClassName="text-xs sm:text-sm text-brand-dark"
                        options={unitOptions}
                    />
                </div>

                {/* Search Input */}
                <div className="relative w-[180px] sm:w-[220px]">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setPage(1);
                                setAppliedSearch(search.trim());
                            }
                        }}
                        placeholder="Cari/Pilih..."
                        className="h-[34px] w-full rounded-[4px] border border-ui-border bg-white pl-3 pr-8 text-xs sm:text-sm text-brand-dark placeholder:text-slate-400 focus:border-[var(--color-input-focus)] focus:outline-none focus:shadow-[0_0_0_3px_var(--color-input-focus-ring)]"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setPage(1);
                            setAppliedSearch(search.trim());
                        }}
                        aria-label="Cari mutasi"
                        className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <DataTable wrapperClassName="border-table-wrapper-border">
                <DataTableHeader className="bg-[#466986] text-white font-normal">
                    <DataTableRow>
                        <DataTableHead className="text-left text-white font-normal px-3 py-2 text-xs sm:text-sm">Tanggal</DataTableHead>
                        <DataTableHead className="text-left text-white font-normal px-3 py-2 text-xs sm:text-sm">No. Sumber #</DataTableHead>
                        <DataTableHead className="text-left text-white font-normal px-3 py-2 text-xs sm:text-sm">Tipe Transaksi</DataTableHead>
                        <DataTableHead className="text-left text-white font-normal px-3 py-2 text-xs sm:text-sm">Keterangan</DataTableHead>
                        <DataTableHead className="text-left text-white font-normal px-3 py-2 text-xs sm:text-sm">Gudang</DataTableHead>
                        <DataTableHead className="text-right text-white font-normal px-3 py-2 text-xs sm:text-sm">Nilai Satuan</DataTableHead>
                        <DataTableHead className="text-center text-white font-normal px-3 py-2 text-xs sm:text-sm">Masuk</DataTableHead>
                        <DataTableHead className="text-center text-white font-normal px-3 py-2 text-xs sm:text-sm">Keluar</DataTableHead>
                        <DataTableHead className="text-right text-white font-normal px-3 py-2 text-xs sm:text-sm">Saldo</DataTableHead>
                    </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                    {loading ? (
                        <DataTableRow className="border-ui-border-row bg-white">
                            <DataTableCell colSpan={9} className="px-3 py-2 text-center text-xs sm:text-sm text-black font-normal">
                                Memuat data...
                            </DataTableCell>
                        </DataTableRow>
                    ) : rows.length > 0 ? (
                        rows.map((row, index) => {
                            const isClickable = Boolean(row.page_id && row.document_id);
                            const rawCost = parseAmountInput(row.unit_cost) || 0;
                            const rawIn = parseAmountInput(row.in_qty) || 0;
                            const rawOut = parseAmountInput(row.out_qty) || 0;
                            const rawBalance = parseAmountInput(row.balance) || 0;

                            const displayCost = selectedRatio > 0 ? (rawCost * selectedRatio) : rawCost;
                            const displayIn = selectedRatio > 0 ? (rawIn / selectedRatio) : rawIn;
                            const displayOut = selectedRatio > 0 ? (rawOut / selectedRatio) : rawOut;
                            const displayBalance = selectedRatio > 0 ? (rawBalance / selectedRatio) : rawBalance;

                            const hasIn = displayIn > 0;
                            const hasOut = displayOut > 0;

                            return (
                                <DataTableRow
                                    key={row.id}
                                    onClick={isClickable ? () => handleOpenDocument(row) : undefined}
                                    className={`border-ui-border-row ${index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'} ${
                                        isClickable ? 'cursor-pointer transition hover:bg-workspace-hover-bg' : ''
                                    }`.trim()}
                                >
                                    <DataTableCell className="text-left text-xs sm:text-sm text-text-workspace-dark px-3 py-2 font-normal">{row.date || ''}</DataTableCell>
                                    <DataTableCell className="text-left text-xs sm:text-sm text-text-workspace-dark px-3 py-2 font-normal">{row.document_number || ''}</DataTableCell>
                                    <DataTableCell className="text-left text-xs sm:text-sm text-text-workspace-dark px-3 py-2 font-normal">{row.document_type || ''}</DataTableCell>
                                    <DataTableCell className="text-left text-xs sm:text-sm text-text-workspace-dark px-3 py-2 font-normal">{row.description || ''}</DataTableCell>
                                    <DataTableCell className="text-left text-xs sm:text-sm text-text-workspace-dark px-3 py-2 font-normal">{row.warehouse || ''}</DataTableCell>
                                    <DataTableCell className="text-right text-xs sm:text-sm text-text-workspace-dark px-3 py-2 font-normal">{formatAmountInput(displayCost) || '0'}</DataTableCell>
                                    <DataTableCell className={`text-center text-xs sm:text-sm px-3 py-2 font-normal ${hasIn ? 'text-emerald-600' : 'text-text-workspace-dark'}`}>
                                        {hasIn ? formatAmountInput(displayIn) : '0'}
                                    </DataTableCell>
                                    <DataTableCell className={`text-center text-xs sm:text-sm px-3 py-2 font-normal ${hasOut ? 'text-rose-600' : 'text-text-workspace-dark'}`}>
                                        {hasOut ? formatAmountInput(displayOut) : '0'}
                                    </DataTableCell>
                                    <DataTableCell className="text-right text-xs sm:text-sm text-text-workspace-dark px-3 py-2 font-normal">{formatAmountInput(displayBalance) || '0'}</DataTableCell>
                                </DataTableRow>
                            );
                        })
                    ) : (
                        <DataTableRow className="border-ui-border-row bg-white">
                            <DataTableCell colSpan={9} className="px-3 py-2 text-center text-xs sm:text-sm text-black font-normal">
                                Belum ada data
                            </DataTableCell>
                        </DataTableRow>
                    )}
                </DataTableBody>
            </DataTable>

            {paginationMeta.total > 0 ? (
                <Pagination
                    page={page}
                    perPage={perPage}
                    total={paginationMeta.total}
                    lastPage={paginationMeta.lastPage}
                    from={paginationMeta.from}
                    to={paginationMeta.to}
                    onPageChange={(nextPage) => setPage(nextPage)}
                    onPerPageChange={(nextPerPage) => {
                        setPerPage(nextPerPage);
                        setPage(1);
                    }}
                    perPageOptions={[10, 25, 50, 100]}
                    className="mt-3"
                />
            ) : null}
        </div>
    );
}
