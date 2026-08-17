import { useEffect, useState } from 'react';
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
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';

function getThirtyDaysAgoDate() {
    const d = new Date();
    d.setDate(d.getDate() - 30);
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

export default function ItemMutationTab({ productId }) {
    const [dateFrom, setDateFrom] = useState(getThirtyDaysAgoDate);
    const [dateTo, setDateTo] = useState(getTodayDate);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [paginationMeta, setPaginationMeta] = useState({
        total: 0,
        lastPage: 1,
        from: 0,
        to: 0,
    });

    useEffect(() => {
        setDateFrom(getThirtyDaysAgoDate());
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
    }, [productId, dateFrom, dateTo, page, perPage]);

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
                    className="w-[140px]"
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
                    className="w-[140px]"
                />
                <button
                    type="button"
                    onClick={() => {
                        setPage(1);
                        fetchMutations(true);
                    }}
                    disabled={loading}
                    title="Muat ulang"
                    className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue hover:bg-brand-blue-lightest transition cursor-pointer disabled:opacity-60"
                >
                    <RefreshIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <DataTable wrapperClassName="border-table-wrapper-border">
                <DataTableHeader className="bg-[#466986] text-white font-light">
                    <DataTableRow>
                        <DataTableHead className="text-left text-white font-light px-3 py-2">Tanggal</DataTableHead>
                        <DataTableHead className="text-left text-white font-light px-3 py-2">No. Sumber</DataTableHead>
                        <DataTableHead className="text-left text-white font-light px-3 py-2">Tipe Transaksi</DataTableHead>
                        <DataTableHead className="text-left text-white font-light px-3 py-2">Keterangan</DataTableHead>
                        <DataTableHead className="text-left text-white font-light px-3 py-2">Gudang</DataTableHead>
                        <DataTableHead className="text-right text-white font-light px-3 py-2">Nilai Satuan</DataTableHead>
                        <DataTableHead className="text-center text-white font-light px-3 py-2">Masuk</DataTableHead>
                        <DataTableHead className="text-center text-white font-light px-3 py-2">Keluar</DataTableHead>
                        <DataTableHead className="text-right text-white font-light px-3 py-2">Sisa Stok</DataTableHead>
                    </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                    {loading ? (
                        <DataTableRow className="border-ui-border-row bg-white">
                            <DataTableCell colSpan={9} className="px-3 py-2 text-center text-sm text-black">
                                Memuat data...
                            </DataTableCell>
                        </DataTableRow>
                    ) : rows.length > 0 ? (
                        rows.map((row, index) => {
                            const isClickable = Boolean(row.page_id && row.document_id);
                            const hasIn = Boolean(row.in_qty && row.in_qty !== '0');
                            const hasOut = Boolean(row.out_qty && row.out_qty !== '0');

                            return (
                                <DataTableRow
                                    key={row.id}
                                    onClick={isClickable ? () => handleOpenDocument(row) : undefined}
                                    className={`border-ui-border-row ${index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'} ${
                                        isClickable ? 'cursor-pointer transition hover:bg-workspace-hover-bg' : ''
                                    }`.trim()}
                                >
                                    <DataTableCell className="text-left text-sm text-text-workspace-dark px-3 py-2">{row.date || '-'}</DataTableCell>
                                    <DataTableCell className="text-left text-sm text-text-workspace-dark px-3 py-2">{row.document_number || '-'}</DataTableCell>
                                    <DataTableCell className="text-left text-sm text-text-workspace-dark px-3 py-2">{row.document_type || '-'}</DataTableCell>
                                    <DataTableCell className="text-left text-sm text-text-workspace-dark px-3 py-2">{row.description || '-'}</DataTableCell>
                                    <DataTableCell className="text-left text-sm text-text-workspace-dark px-3 py-2">{row.warehouse || '-'}</DataTableCell>
                                    <DataTableCell className="text-right text-sm text-text-workspace-dark px-3 py-2">{formatAmountInput(row.unit_cost) || '0'}</DataTableCell>
                                    <DataTableCell className={`text-center text-sm px-3 py-2 ${hasIn ? 'text-emerald-600' : 'text-text-workspace-dark'}`}>
                                        {formatAmountInput(row.in_qty) || '0'}
                                    </DataTableCell>
                                    <DataTableCell className={`text-center text-sm px-3 py-2 ${hasOut ? 'text-rose-600' : 'text-text-workspace-dark'}`}>
                                        {formatAmountInput(row.out_qty) || '0'}
                                    </DataTableCell>
                                    <DataTableCell className="text-right text-sm text-text-workspace-dark px-3 py-2">{formatAmountInput(row.balance) || '0'}</DataTableCell>
                                </DataTableRow>
                            );
                        })
                    ) : (
                        <DataTableRow className="border-ui-border-row bg-white">
                            <DataTableCell colSpan={9} className="px-3 py-2 text-center text-sm text-black">
                                Tidak ada data
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
                    perPageOptions={[10, 15, 25, 50, 100]}
                    className="mt-2 rounded-[4px] border border-ui-border-light shadow-none"
                />
            ) : null}
        </div>
    );
}
