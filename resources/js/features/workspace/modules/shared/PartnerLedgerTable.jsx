import { openSourceDocument } from '@/features/workspace/backend/adapters/bankAdapters';
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';

export function formatPartnerLedgerAmount(value) {
    const numericValue = Number(value ?? 0);
    if (!Number.isFinite(numericValue) || numericValue === 0) {
        return <span className="text-slate-800">0</span>;
    }

    if (numericValue < 0) {
        const absFormatted = formatAmountInput(Math.abs(numericValue));
        return <span className="text-red-600 font-medium">({absFormatted})</span>;
    }

    return <span className="text-slate-800 font-medium">{formatAmountInput(numericValue)}</span>;
}

export default function PartnerLedgerTable({
    rows = [],
    loading = false,
    emptyLabel = 'Tidak ada data',
    onRowClick = openSourceDocument,
    className = 'w-full min-w-[800px]',
}) {
    return (
        <div className="overflow-x-auto rounded-md border border-table-wrapper-border bg-white">
            <DataTable className={className}>
                <DataTableHeader className="bg-[#476278]">
                    <DataTableRow>
                        <DataTableHead className="w-[120px] px-3 text-left text-base font-light text-white">Tanggal</DataTableHead>
                        <DataTableHead className="w-[200px] px-3 text-left text-base font-light text-white">No. Sumber</DataTableHead>
                        <DataTableHead className="w-[200px] px-3 text-left text-base font-light text-white">Tipe Transaksi</DataTableHead>
                        <DataTableHead className="px-3 text-left text-base font-light text-white">Keterangan</DataTableHead>
                        <DataTableHead className="w-[150px] px-3 text-right text-base font-light text-white">Nilai</DataTableHead>
                        <DataTableHead className="w-[150px] px-3 text-right text-base font-light text-white">Saldo</DataTableHead>
                    </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                    {loading ? (
                        <DataTableRow className="bg-white">
                            <DataTableCell colSpan={6} className="px-2.5 py-2 text-center text-base text-black">
                                Memuat data...
                            </DataTableCell>
                        </DataTableRow>
                    ) : rows.length === 0 ? (
                        <DataTableRow className="bg-white">
                            <DataTableCell colSpan={6} className="px-2.5 py-2 text-center text-base text-black">
                                {emptyLabel}
                            </DataTableCell>
                        </DataTableRow>
                    ) : (
                        rows.map((row, idx) => {
                            const isOpening = row.is_opening_balance;
                            const isClickable = !isOpening && row.document_id && row.document_type;

                            return (
                                <DataTableRow
                                    key={row.id || idx}
                                    className={`border-b border-slate-200 text-sm ${isClickable ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                                    onClick={isClickable && onRowClick ? () => onRowClick(row) : undefined}
                                >
                                    <DataTableCell className="px-3 py-2 text-slate-700">{row.date ?? ''}</DataTableCell>
                                    <DataTableCell className="px-3 py-2 font-medium text-slate-800">
                                        {isClickable ? (
                                            <span className="text-blue-600 hover:underline">{row.source_number}</span>
                                        ) : (
                                            row.source_number ?? ''
                                        )}
                                    </DataTableCell>
                                    <DataTableCell className="px-3 py-2 text-slate-700">{row.transaction_type}</DataTableCell>
                                    <DataTableCell className="px-3 py-2 text-slate-700">{row.description}</DataTableCell>
                                    <DataTableCell className="px-3 py-2 text-right">{formatPartnerLedgerAmount(row.amount)}</DataTableCell>
                                    <DataTableCell className="px-3 py-2 text-right">{formatPartnerLedgerAmount(row.balance)}</DataTableCell>
                                </DataTableRow>
                            );
                        })
                    )}
                </DataTableBody>
            </DataTable>
        </div>
    );
}
