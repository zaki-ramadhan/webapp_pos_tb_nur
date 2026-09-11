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
    if (amount === undefined || amount === null || amount === '') return '0';
    const val = typeof amount === 'number' ? amount : parseNumericInput(amount);
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
    emptyLabel = 'Belum ada data',
    onRowClick = openSourceDocument,
    hasCheckNumberColumn = true,
    hasReconciliationColumn = false,
    className = 'min-w-[1200px]',
}) {
    const openingBalanceRow = useMemo(() => {
        return rows.find(
            (r) =>
                r.id === 'opening-balance' ||
                r.transaction_type === 'Saldo Awal' ||
                r.transactionType === 'Saldo Awal' ||
                (r.is_opening_balance && r.document_type !== 'general_journal' && r.documentType !== 'general_journal' && r.transaction_type !== 'Jurnal Umum' && r.transactionType !== 'Jurnal Umum')
        );
    }, [rows]);

    const realRows = useMemo(() => {
        return rows.filter((r) => {
            if (r.id === 'opening-balance') return false;
            if (r.transaction_type === 'Saldo Awal' || r.transactionType === 'Saldo Awal') return false;
            if (r.is_opening_balance && r.document_type !== 'general_journal' && r.documentType !== 'general_journal' && r.transaction_type !== 'Jurnal Umum' && r.transactionType !== 'Jurnal Umum') {
                return false;
            }
            const isLegacyOpeningJournal = Boolean(
                r.is_opening_balance ||
                r.isOpeningBalance ||
                (String(r.document_type || r.documentType) === 'general_journal' &&
                    String(r.description || '').trim().toLowerCase().startsWith('saldo awal'))
            );
            if (isLegacyOpeningJournal) return false;
            return true;
        });
    }, [rows]);

    const hasBalanceAdjustmentInRows = useMemo(() => {
        return Boolean(
            openingBalanceRow?.has_balance_adjustment ||
            realRows.some((r) =>
                Boolean(
                    r.is_balance_adjustment ||
                    r.isBalanceAdjustment ||
                    (String(r.document_type || r.documentType) === 'general_journal' &&
                        (String(r.description || '').trim().toLowerCase().startsWith('penyesuaian saldo') ||
                         String(r.description || '').trim().toLowerCase().startsWith('update saldo')))
                )
            )
        );
    }, [openingBalanceRow, realRows]);

    const openingBalValue = useMemo(() => {
        if (hasBalanceAdjustmentInRows) {
            return 0;
        }
        if (openingBalanceRow?.balance !== undefined) {
            return parseNumericInput(openingBalanceRow.balance);
        }
        return Number(initialOpeningBalance ?? 0);
    }, [hasBalanceAdjustmentInRows, openingBalanceRow, initialOpeningBalance]);

    const computedRows = useMemo(() => {
        let currentBal = openingBalValue;
        return realRows.map((r) => {
            const isCreditMutation =
                r.type === 'Cr' ||
                r.type === 'CR' ||
                r.type === 'Kredit' ||
                r.type === 'Credit' ||
                Number(r.credit ?? 0) > 0;

            const rawMutation = typeof r.mutation === 'number' ? r.mutation : parseNumericInput(r.mutation ?? 0);
            const debit = typeof r.debit === 'number' ? r.debit : (r.debit ? parseNumericInput(r.debit) : (isCreditMutation ? 0 : rawMutation));
            const credit = typeof r.credit === 'number' ? r.credit : (r.credit ? parseNumericInput(r.credit) : (isCreditMutation ? rawMutation : 0));
            const net = debit - credit;

            const isBalanceAdjustment = Boolean(
                r.is_balance_adjustment ||
                r.isBalanceAdjustment ||
                (String(r.document_type || r.documentType) === 'general_journal' &&
                    (String(r.description || '').trim().toLowerCase().startsWith('penyesuaian saldo') ||
                     String(r.description || '').trim().toLowerCase().startsWith('update saldo')))
            );

            if (isBalanceAdjustment) {
                currentBal = net;
            } else {
                currentBal += net;
            }

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
            const rawMutation = typeof r.mutation === 'number' ? r.mutation : parseNumericInput(r.mutation ?? 0);
            const debit = typeof r.debit === 'number' ? r.debit : (r.debit ? parseNumericInput(r.debit) : (isCredit ? 0 : rawMutation));
            const credit = typeof r.credit === 'number' ? r.credit : (r.credit ? parseNumericInput(r.credit) : (isCredit ? rawMutation : 0));
            debits += debit;
            credits += credit;
        });
        const diff = debits - credits;
        return {
            amount: Math.abs(diff),
            type: diff < 0 ? 'Cr' : 'Dr',
            isCredit: diff < 0,
        };
    }, [computedRows]);

    const isOpeningBalanceNegative = openingBalValue < 0;
    const formattedOpeningBalance = isOpeningBalanceNegative
        ? `-${formatCurrencyValue(Math.abs(openingBalValue))}`
        : formatCurrencyValue(openingBalValue);

    let totalHeadColSpan = hasCheckNumberColumn ? 8 : 7;
    if (hasReconciliationColumn) {
        totalHeadColSpan += 1;
    }
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
                    {hasReconciliationColumn && (
                        <DataTableHead className="w-[50px] text-center text-white font-light">#</DataTableHead>
                    )}
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
                            <DataTableCell className="text-center text-text-workspace-dark">
                                {openingBalanceRow?.date && openingBalanceRow.date !== '-'
                                    ? formatHistoryDate(openingBalanceRow.date)
                                    : '-'}
                            </DataTableCell>
                            <DataTableCell className="text-center text-text-workspace-dark">
                                {openingBalanceRow?.document_number && openingBalanceRow.document_number !== '-'
                                    ? openingBalanceRow.document_number
                                    : ''}
                            </DataTableCell>
                            {hasCheckNumberColumn && (
                                <DataTableCell className="text-center text-text-workspace-dark">
                                    {openingBalanceRow?.check_number && openingBalanceRow.check_number !== '-'
                                        ? openingBalanceRow.check_number
                                        : ''}
                                </DataTableCell>
                            )}
                            <DataTableCell className="text-text-workspace-dark">Saldo Awal</DataTableCell>
                            <DataTableCell className="text-text-workspace-dark">
                                {openingBalanceRow?.description || getOpeningDateLabel(startDate)}
                            </DataTableCell>
                            <DataTableCell className="text-right text-text-workspace-dark">
                                {hasBalanceAdjustmentInRows || openingBalanceRow?.description?.startsWith('Saldo per') || openingBalValue === 0
                                    ? '0'
                                    : formatCurrencyValue(openingBalValue)}
                            </DataTableCell>
                            <DataTableCell className="text-center text-text-workspace-dark">
                                {hasBalanceAdjustmentInRows
                                    ? ''
                                    : (openingBalanceRow?.description?.startsWith('Saldo per') || openingBalValue === 0
                                        ? '-'
                                        : (openingBalValue >= 0 ? 'Dr' : 'Cr'))}
                            </DataTableCell>
                            <DataTableCell className={`text-right ${!hasBalanceAdjustmentInRows && isOpeningBalanceNegative ? 'text-red-600' : 'text-slate-700'}`}>
                                {hasBalanceAdjustmentInRows ? '0' : formattedOpeningBalance}
                            </DataTableCell>
                            {hasReconciliationColumn && (
                                <DataTableCell className="text-center text-text-workspace-dark" />
                            )}
                        </DataTableRow>

                        {/* Baris Transaksi Riil */}
                        {computedRows.map((row, index) => {
                            const isCreditMutation = row.isCreditMutation;
                            const typeLabel = isCreditMutation ? 'Cr' : 'Dr';
                            const balVal = typeof row.computedBalance === 'number'
                                ? row.computedBalance
                                : parseNumericInput(row.balance ?? 0);
                            const isNegativeBalance = balVal < 0;
                            const formattedBalance = isNegativeBalance
                                ? `-${formatCurrencyValue(Math.abs(balVal))}`
                                : formatCurrencyValue(balVal);
                            const isClickable = Boolean((row.document_id || row.id) && (row.document_type || row.documentType));
                            const isOpening = Boolean(
                                row.is_opening_balance ||
                                row.id === 'opening-balance' ||
                                row.transaction_type === 'Saldo Awal' ||
                                row.transactionType === 'Saldo Awal'
                            );
                            const isReconciled = !isOpening && Boolean(row.is_reconciled || row.status === 'Reconciled');

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
                                    {hasReconciliationColumn && (
                                        <DataTableCell className="text-center">
                                            {isReconciled ? (
                                                <span className="inline-flex items-center justify-center text-emerald-600 font-bold" aria-label="Sudah direkonsiliasi">
                                                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </span>
                                            ) : null}
                                        </DataTableCell>
                                    )}
                                </DataTableRow>
                            );
                        })}

                        {/* Baris Total (Hanya tampil jika ada lebih dari 1 riwayat transaksi untuk diakumulasikan) */}
                        {computedRows.length > 1 && (
                            <DataTableRow className="hover:bg-slate-50 transition-colors select-none font-medium border-t-2 border-slate-300 bg-white">
                                <DataTableCell className="text-center text-text-workspace-dark" />
                                <DataTableCell className="text-text-workspace-dark" />
                                {hasCheckNumberColumn && (
                                    <DataTableCell className="text-text-workspace-dark" />
                                )}
                                <DataTableCell className="text-text-workspace-dark font-normal">
                                    Total
                                </DataTableCell>
                                <DataTableCell className="text-text-workspace-dark font-normal">
                                    Total
                                </DataTableCell>
                                <DataTableCell className={`text-right ${totalMutation.isCredit ? 'text-red-600' : 'text-slate-700'}`}>
                                    {formatCurrencyValue(totalMutation.amount)}
                                </DataTableCell>
                                <DataTableCell className="text-center text-text-workspace-dark">
                                    {totalMutation.type}
                                </DataTableCell>
                                <DataTableCell className="text-right text-slate-700" />
                                {hasReconciliationColumn && (
                                    <DataTableCell className="text-center" />
                                )}
                            </DataTableRow>
                        )}
                    </>
                )}
            </DataTableBody>
        </DataTable>
    );
}
