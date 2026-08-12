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
import { extractBackendRows, listBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';

export default function ItemWarehouseTab({ productId }) {
    const today = new Date().toISOString().split('T')[0];
    const [asOfDate, setAsOfDate] = useState(today);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWarehouses = async () => {
        if (!productId) return;
        setLoading(true);
        try {
            const res = await listBackendResource('item-locations', {
                product_id: productId,
                as_of_date: asOfDate,
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
                    onClick={fetchWarehouses}
                    title="Muat ulang"
                    className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue hover:bg-brand-blue-lightest transition cursor-pointer"
                >
                    <RefreshIcon className="h-4 w-4" />
                </button>
            </div>

            <DataTable wrapperClassName="border-table-wrapper-border">
                <DataTableHeader className="bg-[#466986] text-white font-light">
                    <DataTableRow>
                        <DataTableHead className="text-left text-white font-light px-3 py-2">Gudang</DataTableHead>
                        <DataTableHead className="text-right text-white font-light px-3 py-2 w-[180px]">Saldo</DataTableHead>
                    </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                    {loading ? (
                        <DataTableRow className="border-ui-border-row bg-white">
                            <DataTableCell colSpan={2} className="px-3 py-2 text-center text-sm text-black">
                                Memuat data...
                            </DataTableCell>
                        </DataTableRow>
                    ) : rows.length > 0 ? (
                        rows.map((row, i) => (
                            <DataTableRow key={row.id ?? i} className="border-ui-border-row bg-white">
                                <DataTableCell className="text-left text-sm text-text-workspace-dark px-3 py-2">{row.warehouse ?? row.warehouse_name ?? '-'}</DataTableCell>
                                <DataTableCell className="text-right text-sm font-normal text-text-workspace-dark px-3 py-2 w-[180px]">{formatAmountInput(row.saleable_stock ?? row.stock_on_hand) || '0'}</DataTableCell>
                            </DataTableRow>
                        ))
                    ) : (
                        <DataTableRow className="border-ui-border-row bg-white">
                            <DataTableCell colSpan={2} className="px-3 py-2 text-center text-sm text-black">
                                Tidak ada data
                            </DataTableCell>
                        </DataTableRow>
                    )}
                </DataTableBody>
            </DataTable>
        </div>
    );
}
