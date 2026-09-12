import { useEffect, useState } from 'react';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import { RefreshIcon } from '@/features/workspace/shared/Icons';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { extractBackendRows, listBackendResource, clearBackendCache } from '@/features/workspace/backend/workspaceBackendApi';
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';

export default function ItemWarehouseTab({ productId }) {
    const today = new Date().toISOString().split('T')[0];
    const [asOfDate, setAsOfDate] = useState(today);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWarehouses = async (force = false) => {
        if (!productId) return;
        setLoading(true);
        try {
            if (force) {
                clearBackendCache('item-locations');
            }
            const res = await listBackendResource('item-locations', {
                product_id: productId,
                as_of_date: asOfDate,
                per_page: 200,
                ...(force ? { _refresh: Date.now() } : {}),
            });
            setRows(extractBackendRows(res));
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, [productId, asOfDate]);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <TransactionDateInput
                    value={asOfDate}
                    onChange={(e) => {
                        const nextDate = typeof e === 'string' ? e : e?.target?.value;
                        if (nextDate) setAsOfDate(nextDate);
                    }}
                    className="w-[140px]"
                />
                <button
                    type="button"
                    onClick={() => fetchWarehouses(true)}
                    disabled={loading}
                    aria-label="Muat ulang"
                    className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue hover:bg-brand-blue-lightest transition cursor-pointer disabled:opacity-60"
                >
                    <RefreshIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <DataTable wrapperClassName="border-table-wrapper-border">
                <DataTableHeader className="bg-[#466986] text-white font-normal">
                    <DataTableRow>
                        <DataTableHead className="text-left text-white font-normal px-3 py-2 text-xs sm:text-sm">Gudang</DataTableHead>
                        <DataTableHead className="text-right text-white font-normal px-3 py-2 text-xs sm:text-sm w-[140px] sm:w-[180px]">Saldo</DataTableHead>
                        <DataTableHead className="text-right text-white font-normal px-3 py-2 text-xs sm:text-sm w-[160px] sm:w-[220px]">Saldo (Unit)</DataTableHead>
                    </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                    {loading ? (
                        <DataTableRow className="border-ui-border-row bg-white">
                            <DataTableCell colSpan={3} className="px-3 py-2 text-center text-xs sm:text-sm text-black font-normal">
                                Memuat data...
                            </DataTableCell>
                        </DataTableRow>
                    ) : rows.length > 0 ? (
                        rows.map((row, i) => (
                            <DataTableRow key={row.id ?? i} className={`border-ui-border-row ${i % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'}`}>
                                <DataTableCell className="text-left text-xs sm:text-sm text-text-workspace-dark px-3 py-2 font-normal">{row.warehouse ?? row.warehouse_name ?? ''}</DataTableCell>
                                <DataTableCell className="text-right text-xs sm:text-sm font-normal text-text-workspace-dark px-3 py-2 w-[140px] sm:w-[180px]">{formatAmountInput(row.saleable_stock ?? row.stock_on_hand) || '0'}</DataTableCell>
                                <DataTableCell className="text-right text-xs sm:text-sm font-normal text-text-workspace-dark px-3 py-2 w-[160px] sm:w-[220px]">
                                    {row.multi_unit_quantity || (row.unit ? `${formatAmountInput(row.saleable_stock ?? row.stock_on_hand)} ${row.unit}` : '0')}
                                </DataTableCell>
                            </DataTableRow>
                        ))
                    ) : (
                        <DataTableRow className="border-ui-border-row bg-white">
                            <DataTableCell colSpan={3} className="px-3 py-2 text-center text-xs sm:text-sm text-black font-normal">
                                Belum ada data
                            </DataTableCell>
                        </DataTableRow>
                    )}
                </DataTableBody>
            </DataTable>
        </div>
    );
}
