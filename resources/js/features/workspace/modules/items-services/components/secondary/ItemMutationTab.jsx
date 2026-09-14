import { useEffect, useState, useMemo } from 'react';
import TextInput from '@/components/ui/TextInput';
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
import RefreshButton from '@/features/workspace/shared/RefreshButton';
import { SearchIcon } from '@/features/workspace/shared/Icons';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { extractBackendRows, listBackendResource, clearBackendCache } from '@/features/workspace/backend/workspaceBackendApi';
import { formatAmountInput, parseAmountInput, formatMultiUnitQuantity } from '@/features/workspace/shared/amountFormatting';

function getDefaultDateFrom() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
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
        const opts = [{ value: 'base', label: baseUnitName }];
        if (conversions.length > 0) {
            opts.push({ value: 'multi', label: 'Multi Satuan' });
        }
        return opts;
    }, [baseUnitName, conversions]);

    const [selectedMode, setSelectedMode] = useState(() => (conversions.length > 0 ? 'multi' : 'base'));

    useEffect(() => {
        if (conversions.length > 0) {
            if (selectedMode !== 'multi' && selectedMode !== 'base') {
                setSelectedMode('multi');
            }
        } else {
            setSelectedMode('base');
        }
    }, [conversions.length]);

    useEffect(() => {
        setDateFrom(getDefaultDateFrom());
        setDateTo(getTodayDate());
        setPage(1);
    }, [productId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAppliedSearch(search.trim());
            setPage(1);
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 w-full py-1 items-center">
                {/* Parent 1: Tanggal 1, s/d, Tanggal 2, Refresh - jarak isinya space-around */}
                <div className="flex items-center justify-around gap-2 w-full">
                    <div className="flex-1 max-w-[140px] sm:max-w-[170px]">
                        <TransactionDateInput
                            value={dateFrom}
                            onChange={(nextVal) => {
                                const val = typeof nextVal === 'string' ? nextVal : nextVal?.target?.value;
                                if (val) {
                                    setDateFrom(val);
                                    setPage(1);
                                    if (dateTo && val > dateTo) {
                                        setDateTo(val);
                                    }
                                }
                            }}
                            className="h-[40px] rounded-[4px] border-ui-border w-full"
                            inputClassName="text-sm text-brand-dark py-1 h-full"
                            trailingClassName="w-[32px] shrink-0 justify-center px-0 h-full"
                        />
                    </div>
                    <span className="text-sm text-text-darkest font-normal shrink-0">s/d</span>
                    <div className="flex-1 max-w-[140px] sm:max-w-[170px]">
                        <TransactionDateInput
                            value={dateTo}
                            minDate={dateFrom}
                            onChange={(nextVal) => {
                                const val = typeof nextVal === 'string' ? nextVal : nextVal?.target?.value;
                                if (val) {
                                    setDateTo(val);
                                    setPage(1);
                                }
                            }}
                            className="h-[40px] rounded-[4px] border-ui-border w-full"
                            inputClassName="text-sm text-brand-dark py-1 h-full"
                            trailingClassName="w-[32px] shrink-0 justify-center px-0 h-full"
                        />
                    </div>
                    <RefreshButton
                        label="Muat ulang"
                        onClick={() => {
                            setPage(1);
                            fetchMutations(true);
                        }}
                        loading={loading}
                    />
                </div>

                {/* Parent 2: Dropdown Satuan & Input Pencarian - stretch search input */}
                <div className="flex items-center justify-between gap-3 w-full">
                    <div className="w-[140px] sm:w-[170px] shrink-0">
                        <SelectField
                            value={selectedMode}
                            onChange={(e) => setSelectedMode(e.target.value)}
                            className="h-[40px] rounded-[4px] border-ui-border w-full"
                            selectClassName="text-sm text-brand-dark"
                            options={unitOptions}
                        />
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                        <TextInput
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setAppliedSearch(search.trim());
                                    setPage(1);
                                }
                            }}
                            onClear={() => {
                                setSearch('');
                                setAppliedSearch('');
                                setPage(1);
                            }}
                            placeholder="Cari/Pilih..."
                            trailing={
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAppliedSearch(search.trim());
                                        setPage(1);
                                    }}
                                    className="flex items-center justify-center p-0 m-0 border-0 bg-transparent text-text-darkest hover:text-brand-blue cursor-pointer"
                                    aria-label="Cari data"
                                >
                                    <SearchIcon className="h-5 w-5" />
                                </button>
                            }
                            className="h-[40px] rounded-[4px] border-ui-border w-full"
                            inputClassName="text-sm text-brand-dark py-1 h-full"
                            trailingClassName="px-2.5"
                            containerClassName="w-full"
                        />
                    </div>
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
                        <DataTableHead className="text-right text-white font-normal px-3 py-2 text-xs sm:text-sm">Masuk</DataTableHead>
                        <DataTableHead className="text-right text-white font-normal px-3 py-2 text-xs sm:text-sm">Keluar</DataTableHead>
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

                            let displayIn = '';
                            let displayOut = '';
                            let displayBalance = '';

                            if (selectedMode === 'multi') {
                                displayIn = rawIn > 0 ? formatMultiUnitQuantity(rawIn, baseUnitName, conversions) : '';
                                displayOut = rawOut > 0 ? formatMultiUnitQuantity(rawOut, baseUnitName, conversions) : '';
                                displayBalance = formatMultiUnitQuantity(rawBalance, baseUnitName, conversions);
                            } else {
                                displayIn = rawIn > 0 ? (formatAmountInput(rawIn) || '0') : (row.raw_document_type === 'opening_stock' ? (formatAmountInput(rawIn) || '0') : '0');
                                displayOut = rawOut > 0 ? (formatAmountInput(rawOut) || '0') : '0';
                                displayBalance = formatAmountInput(rawBalance) || '0';
                            }

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
                                    <DataTableCell className="text-right text-xs sm:text-sm text-text-workspace-dark px-3 py-2 font-normal">{formatAmountInput(rawCost) || '0'}</DataTableCell>
                                    <DataTableCell className="text-right text-xs sm:text-sm text-text-workspace-dark px-3 py-2 font-normal">
                                        {displayIn}
                                    </DataTableCell>
                                    <DataTableCell className="text-right text-xs sm:text-sm text-text-workspace-dark px-3 py-2 font-normal">
                                        {displayOut}
                                    </DataTableCell>
                                    <DataTableCell className="text-right text-xs sm:text-sm text-text-workspace-dark px-3 py-2 font-normal">
                                        {displayBalance}
                                    </DataTableCell>
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
