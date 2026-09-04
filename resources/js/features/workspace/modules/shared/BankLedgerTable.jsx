import { useMemo } from 'react';
import { openSourceDocument } from '@/features/workspace/backend/adapters/bankAdapters';
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';
import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';

function formatCurrencyValue(amount) {
    const val = Number(amount ?? 0);
    if (!Number.isFinite(val) || val === 0) return '0';
    return formatAmountInput(Math.abs(val));
}

function formatHistoryDate(dateVal) {
    if (!dateVal) return '-';
    if (typeof dateVal === 'string') {
        const parts = dateVal.trim().split(/[/.-]/);
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
            } else if (parts[2].length === 4) {
                return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
            }
        }
    }
    return String(dateVal);
}

function getOpeningDateLabel(startDateStr) {
    if (!startDateStr) return 'Saldo Awal';
    const parts = startDateStr.split('/');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        date.setDate(date.getDate() - 1);
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `Saldo per ${d}/${m}/${y}`;
    }
    return 'Saldo Awal';
}

export default function BankLedgerTable({
    rows = [],
    loading = false,
    startDate = '',
    initialOpeningBalance = 0,
    emptyLabel = 'Tidak ada data',
    onRowClick = openSourceDocument,
    hasCheckNumberColumn = true,
    className = 'min-w-[1200px]',
}) {
    const openingBalanceRow = useMemo(() => {
        return rows.find(
            (r) =>
                r.is_opening_balance ||
                (r.description && String(r.description).startsWith('Saldo Awal')) ||
                r.transaction_type === 'Saldo Awal'
        );
    }, [rows]);

    const openingBalValue = useMemo(() => {
        if (openingBalanceRow?.balance !== undefined) {
            return parseNumericInput(openingBalanceRow.balance);
        }
        return Number(initialOpeningBalance ?? 0);
    }, [openingBalanceRow, initialOpeningBalance]);

    const realRows = useMemo(() => {
        return rows.filter(
            (r) =>
                !r.is_opening_balance &&
                !(r.description && String(r.description).startsWith('Saldo Awal akun')) &&
                r.transaction_type !== 'Saldo Awal'
        );
    }, [rows]);

    const computedRows = useMemo(() => {
        let currentBal = openingBalValue;
        return realRows.map((r) => {
            const isCreditMutation =
                r.type === 'Kredit' ||
                r.type === 'Cr' ||
                r.type === 'Credit' ||
                Number(r.credit ?? 0) > 0;

            const debit = Number(r.debit ?? (isCreditMutation ? 0 : r.mutation) ?? 0);
            const credit = Number(r.credit ?? (isCreditMutation ? r.mutation : 0) ?? 0);
            const net = debit - credit;
            currentBal += net;

            return {
                ...r,
                computedBalance: currentBal,
                isCreditMutation,
            };
        });
    }, [realRows, openingBalValue]);

    const totalMutation = useMemo(() => {
        let debits = 0;
        let credits = 0;
        computedRows.forEach((r) => {
            const isCredit = r.isCreditMutation;
            const debit = Number(r.debit ?? (isCredit ? 0 : r.mutation) ?? 0);
            const credit = Number(r.credit ?? (isCredit ? r.mutation : 0) ?? 0);
            debits += debit;
            credits += credit;
        });
        const diff = debits - credits;
        return {
            amount: Math.abs(diff),
            type: diff < 0 ? 'Kredit' : 'Debit',
            isCredit: diff < 0,
        };
    }, [computedRows]);

    const finalEndingBalance = useMemo(() => {
        if (computedRows.length > 0) {
            return computedRows[computedRows.length - 1].computedBalance;
        }
        return openingBalValue;
    }, [computedRows, openingBalValue]);

    const isOpeningBalanceNegative = openingBalValue < 0;
    const formattedOpeningBalance = isOpeningBalanceNegative
        ? `-${formatCurrencyValue(Math.abs(openingBalValue))}`
        : formatCurrencyValue(openingBalValue);

    const isFinalBalanceNegative = finalEndingBalance < 0;
    const formattedFinalBalance = isFinalBalanceNegative
        ? `-${formatCurrencyValue(Math.abs(finalEndingBalance))}`
        : formatCurrencyValue(finalEndingBalance);

    const totalColSpan = hasCheckNumberColumn ? 5 : 4;
    const totalHeadColSpan = hasCheckNumberColumn ? 8 : 7;
    const hasData = rows.length > 0;

    return (
        <DataTable className={className} wrapperClassName="flex-1 min-h-0 overflow-auto border-table-wrapper-border">
            <DataTableHeader className="bg-[#476278]">
                <DataTableRow className="border-b-0">
                    <DataTableHead className="text-center w-[110px] whitespace-nowrap text-white">Tanggal</DataTableHead>
                    <DataTableHead className="w-[160px] text-white">No. Sumber</DataTableHead>
                    {hasCheckNumberColumn && (
                        <DataTableHead className="w-[130px] text-white">No Cek #</DataTableHead>
                    )}
                    <DataTableHead className="w-[180px] text-white">Tipe Transaksi</DataTableHead>
                    <DataTableHead className="min-w-[400px] text-white">Keterangan</DataTableHead>
                    <DataTableHead className="text-right w-[140px] text-white">Mutasi</DataTableHead>
                    <DataTableHead className="text-center w-[80px] text-white">Tipe</DataTableHead>
                    <DataTableHead className="text-right w-[150px] text-white">Saldo</DataTableHead>
                </DataTableRow>
            </DataTableHeader>

            <DataTableBody>
                {loading ? (
                    <DataTableRow className="bg-white table-row-empty" data-empty-row="true">
                        <DataTableCell colSpan={totalHeadColSpan} className="py-2 text-center text-sm text-black">
                            Memuat data...
                        </DataTableCell>
                    </DataTableRow>
                ) : !hasData ? (
                    <DataTableRow className="bg-white table-row-empty" data-empty-row="true">
                        <DataTableCell colSpan={totalHeadColSpan} className="py-2 text-center text-sm text-black">
                            {emptyLabel}
                        </DataTableCell>
                    </DataTableRow>
                ) : (
                    <>
                        {/* Baris Saldo Awal */}
                        <DataTableRow className="hover:bg-slate-50 transition-colors select-none bg-white">
                            <DataTableCell className="text-center text-text-workspace-dark">-</DataTableCell>
                            <DataTableCell className="text-center text-text-workspace-dark">-</DataTableCell>
                            {hasCheckNumberColumn && (
                                <DataTableCell className="text-center text-text-workspace-dark">-</DataTableCell>
                            )}
                            <DataTableCell className="text-text-workspace-dark">Saldo Awal</DataTableCell>
                            <DataTableCell className="text-text-workspace-dark">{getOpeningDateLabel(startDate)}</DataTableCell>
                            <DataTableCell className="text-right text-text-workspace-dark">0</DataTableCell>
                            <DataTableCell className="text-center text-text-workspace-dark">-</DataTableCell>
                            <DataTableCell className={`text-right ${isOpeningBalanceNegative ? 'text-red-600' : 'text-slate-700'}`}>
                                {formattedOpeningBalance}
                            </DataTableCell>
                        </DataTableRow>

                        {/* Baris Transaksi Riil */}
                        {computedRows.map((row, index) => {
                            const isCreditMutation = row.isCreditMutation;
                            const typeLabel = isCreditMutation ? 'Kredit' : 'Debit';
                            const balVal = Number(row.computedBalance ?? row.balance ?? 0);
                            const isNegativeBalance = balVal < 0;
                            const formattedBalance = isNegativeBalance
                                ? `-${formatCurrencyValue(Math.abs(balVal))}`
                                : formatCurrencyValue(balVal);
                            const isClickable = Boolean((row.document_id || row.id) && (row.document_type || row.documentType));

                            return (
                                <DataTableRow
                                    key={row.id ?? index}
                                    onClick={isClickable ? () => onRowClick?.(row) : undefined}
                                    className={`transition-colors ${isClickable ? 'cursor-pointer hover:bg-slate-100' : 'hover:bg-slate-50'} ${
                                        index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'
                                    }`}
                                >
                                    <DataTableCell className="text-center whitespace-nowrap text-text-workspace-dark">
                                        {formatHistoryDate(row.date)}
                                    </DataTableCell>
                                    <DataTableCell className="text-slate-900 font-normal">
                                        {row.source_number || row.sourceNumber || row.document_number || '-'}
                                    </DataTableCell>
                                    {hasCheckNumberColumn && (
                                        <DataTableCell className="text-text-workspace-dark">
                                            {row.check_number || row.checkNumber || '-'}
                                        </DataTableCell>
                                    )}
                                    <DataTableCell className="text-text-workspace-dark">
                                        {row.transaction_type || row.transactionType || '-'}
                                    </DataTableCell>
                                    <DataTableCell className="text-text-workspace-dark">
                                        {row.description || '-'}
                                    </DataTableCell>
                                    <DataTableCell className={`text-right ${isCreditMutation ? 'text-red-600' : 'text-slate-700'}`}>
                                        {formatCurrencyValue(row.mutation)}
                                    </DataTableCell>
                                    <DataTableCell className="text-center text-text-workspace-dark">
                                        {typeLabel}
                                    </DataTableCell>
                                    <DataTableCell className={`text-right ${isNegativeBalance ? 'text-red-600' : 'text-slate-700'}`}>
                                        {formattedBalance}
                                    </DataTableCell>
                                </DataTableRow>
                            );
                        })}

                        {/* Baris Total (Dengan merge colSpan & Saldo Akhir) */}
                        <DataTableRow className="hover:bg-slate-50 transition-colors select-none font-medium border-t-2 border-slate-300 bg-white">
                            <DataTableCell colSpan={totalColSpan} className="text-black font-normal">
                                Total
                            </DataTableCell>
                            <DataTableCell className={`text-right ${totalMutation.isCredit ? 'text-red-600' : 'text-slate-700'}`}>
                                {formatCurrencyValue(totalMutation.amount)}
                            </DataTableCell>
                            <DataTableCell className="text-center text-text-workspace-dark">
                                {totalMutation.type}
                            </DataTableCell>
                            <DataTableCell className={`text-right ${isFinalBalanceNegative ? 'text-red-600' : 'text-slate-700'}`}>
                                {formattedFinalBalance}
                            </DataTableCell>
                        </DataTableRow>
                    </>
                )}
            </DataTableBody>
        </DataTable>
    );
}
