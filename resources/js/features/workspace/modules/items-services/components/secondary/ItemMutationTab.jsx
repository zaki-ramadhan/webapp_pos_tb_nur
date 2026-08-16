import { useEffect, useState } from 'react';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import TextInput from '@/components/ui/TextInput';
import { RefreshIcon } from '@/features/workspace/shared/Icons';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { extractBackendRows, listBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
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
    const [search, setSearch] = useState('');
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setDateFrom(getThirtyDaysAgoDate());
        setDateTo(getTodayDate());
        setSearch('');
    }, [productId]);

    const fetchMutations = async () => {
        if (!productId) return;
        setLoading(true);
        try {
            const res = await listBackendResource('product-mutations', {
                product_id: productId,
                date_from: dateFrom,
                date_to: dateTo,
                search: search.trim(),
                per_page: 200,
            });
            setRows(extractBackendRows(res));
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMutations();
    }, [productId, dateFrom, dateTo]);

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
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <TransactionDateInput
                        value={dateFrom}
                        onChange={(e) => {
                            const nextDateFrom = typeof e === 'string' ? e : e?.target?.value;
                            if (nextDateFrom) {
                                setDateFrom(nextDateFrom);
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
                            if (nextDateTo) setDateTo(nextDateTo);
                        }}
                        className="w-[140px]"
                    />
                    <button
                        type="button"
                        onClick={fetchMutations}
                        title="Muat ulang"
                        className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue hover:bg-brand-blue-lightest transition cursor-pointer"
                    >
                        <RefreshIcon className="h-4 w-4" />
                    </button>
                </div>

                <div className="w-full sm:w-[260px]">
                    <TextInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') fetchMutations(); }}
                        placeholder="Cari/Pilih..."
                        className="h-[34px] text-xs sm:text-sm"
                    />
                </div>
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
                                    <DataTableCell className="text-center text-sm text-text-workspace-dark px-3 py-2">{formatAmountInput(row.in_qty) || '0'}</DataTableCell>
                                    <DataTableCell className="text-center text-sm text-text-workspace-dark px-3 py-2">{formatAmountInput(row.out_qty) || '0'}</DataTableCell>
                                    <DataTableCell className="text-right text-sm font-normal text-text-workspace-dark px-3 py-2">{formatAmountInput(row.balance) || '0'}</DataTableCell>
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
        </div>
    );
}
