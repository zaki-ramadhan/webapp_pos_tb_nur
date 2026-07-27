import { useEffect, useState, useMemo } from 'react';
import { listBackendResource, getBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { buildFirstDayOfMonthDisplayDate, buildTodayDisplayDate, formatDisplayDate } from '@/features/workspace/shared/dateDefaults';
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';
import RefreshButton from '@/features/workspace/shared/RefreshButton';
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
        return `Saldo per ${formatDisplayDate(date)}`;
    }
    return 'Saldo Awal';
}

export function AccountsHistoryTab({ recordId, openingBalanceValue = 0, openingBalanceDate = '' }) {
    const [startDate, setStartDate] = useState(() => buildFirstDayOfMonthDisplayDate());
    const [endDate, setEndDate] = useState(() => buildTodayDisplayDate());
    const [rows, setRows] = useState([]);
    const [accountInfo, setAccountInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const initialOpeningBalance = useMemo(() => {
        if (accountInfo && accountInfo.opening_balance !== undefined && accountInfo.opening_balance !== null) {
            return Number(accountInfo.opening_balance ?? 0);
        }
        return Number(openingBalanceValue ?? 0);
    }, [accountInfo, openingBalanceValue]);

    const loadHistory = async () => {
        if (!recordId) return;
        setLoading(true);
        try {
            const [historyRes, accountRes] = await Promise.all([
                listBackendResource('bank-histories', {
                    account_id: recordId,
                    start_date: startDate,
                    end_date: endDate,
                    per_page: 200,
                }),
                getBackendResource('accounts', recordId).catch(() => null),
            ]);

            setRows(Array.isArray(historyRes?.data) ? historyRes.data : []);
            if (accountRes) {
                setAccountInfo(accountRes);
            }
        } catch (error) {
            console.error('Failed to load account history', error);
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();

        const handleAutoRefresh = () => {
            loadHistory();
        };

        window.addEventListener('workspace:resource-updated', handleAutoRefresh);
        window.addEventListener('workspace:page-activated', handleAutoRefresh);

        return () => {
            window.removeEventListener('workspace:resource-updated', handleAutoRefresh);
            window.removeEventListener('workspace:page-activated', handleAutoRefresh);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recordId, startDate, endDate]);

    // Akumulasi saldo riil secara progresif dari Saldo Awal (deduplikasi jurnal saldo awal)
    const computedRows = useMemo(() => {
        const realRows = rows.filter((r) => {
            const isOpBal = Boolean(
                r.is_opening_balance ||
                (r.description && String(r.description).startsWith('Saldo Awal akun'))
            );
            return !isOpBal;
        });

        let currentBal = initialOpeningBalance;
        return realRows.map((r) => {
            const isCreditMutation = r.type === 'Kredit' || r.type === 'Cr' || r.type === 'Credit' || Number(r.credit ?? 0) > 0;
            const debit = Number(r.debit ?? (isCreditMutation ? 0 : r.mutation) ?? 0);
            const credit = Number(r.credit ?? (isCreditMutation ? r.mutation : 0) ?? 0);
            const net = debit - credit;
            currentBal += net;
            return {
                ...r,
                computedBalance: currentBal,
            };
        });
    }, [rows, initialOpeningBalance]);

    const totalMutation = useMemo(() => {
        let debits = 0;
        let credits = 0;
        computedRows.forEach((r) => {
            const isCreditMutation = r.type === 'Kredit' || r.type === 'Cr' || r.type === 'Credit' || Number(r.credit ?? 0) > 0;
            const debit = Number(r.debit ?? (isCreditMutation ? 0 : r.mutation) ?? 0);
            const credit = Number(r.credit ?? (isCreditMutation ? r.mutation : 0) ?? 0);
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
        return initialOpeningBalance;
    }, [computedRows, initialOpeningBalance]);

    const isFinalBalanceNegative = Number(finalEndingBalance ?? 0) < 0;
    const formattedFinalBalance = isFinalBalanceNegative
        ? `-${formatCurrencyValue(Math.abs(finalEndingBalance))}`
        : formatCurrencyValue(finalEndingBalance);

    const handleRowClick = (row) => {
        if (!row || !row.document_id || !row.document_type) return;

        const docTypeToPageId = {
            general_journal: 'general-journal',
            bank_transfer: 'bank-transfer',
            cash_receipt: 'cash-receipt',
            sales_receipt: 'sales-receipt',
            cash_payment: 'cash-payment',
            purchase_payment: 'purchase-payment',
            expense_entry: 'expense-entry',
            payroll_entry: 'payroll-entry',
            sales_invoice: 'sales-invoice',
            purchase_invoice: 'purchase-invoice',
            sales_deposit: 'sales-deposit',
        };

        const pageId = docTypeToPageId[row.document_type] || String(row.document_type).replace(/_/g, '-');
        const targetRecordId = String(row.document_id);
        const label = row.source_number || `Dokumen #${targetRecordId}`;

        window.dispatchEvent(
            new CustomEvent('workspace:open-page', {
                detail: {
                    pageId,
                    recordId: targetRecordId,
                    label,
                    tabLabel: label,
                },
            }),
        );
    };

    const isOpeningBalanceNegative = Number(initialOpeningBalance ?? 0) < 0;
    const formattedOpeningBalance = isOpeningBalanceNegative
        ? `-${formatCurrencyValue(Math.abs(initialOpeningBalance))}`
        : formatCurrencyValue(initialOpeningBalance);

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
                <div className="w-[160px]">
                    <TransactionDateInput
                        value={startDate}
                        onChange={(val) => setStartDate(val)}
                        className="w-full"
                    />
                </div>
                <span className="text-xs text-slate-500 font-normal">s/d</span>
                <div className="w-[160px]">
                    <TransactionDateInput
                        value={endDate}
                        onChange={(val) => setEndDate(val)}
                        className="w-full"
                    />
                </div>
                <RefreshButton
                    onClick={loadHistory}
                    loading={loading}
                    label="Perbarui"
                />
            </div>

            <DataTable>
                <DataTableHeader className="bg-[#476278]">
                    <DataTableRow className="border-b-0">
                        <DataTableHead className="text-center w-[120px] whitespace-nowrap text-white">Tanggal</DataTableHead>
                        <DataTableHead className="w-[160px] text-white">No. Sumber #</DataTableHead>
                        <DataTableHead className="w-[160px] text-white">Tipe Transaksi</DataTableHead>
                        <DataTableHead className="w-[240px] text-white">Keterangan</DataTableHead>
                        <DataTableHead className="text-right w-[140px] text-white">Mutasi</DataTableHead>
                        <DataTableHead className="text-center w-[80px] text-white">Tipe</DataTableHead>
                        <DataTableHead className="text-right w-[140px] text-white">Saldo</DataTableHead>
                    </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                    {loading ? (
                        <DataTableRow className="bg-white">
                            <DataTableCell colSpan={7} className="py-6 text-center text-sm text-text-workspace-dark">
                                Memuat data...
                            </DataTableCell>
                        </DataTableRow>
                    ) : (
                        <>
                            {/* Baris Saldo Awal */}
                            <DataTableRow className="hover:bg-slate-50 transition-colors select-none">
                                <DataTableCell className="text-center text-text-workspace-dark">-</DataTableCell>
                                <DataTableCell className="text-center text-text-workspace-dark">-</DataTableCell>
                                <DataTableCell>Saldo Awal</DataTableCell>
                                <DataTableCell>{getOpeningDateLabel(startDate)}</DataTableCell>
                                <DataTableCell className="text-right">0</DataTableCell>
                                <DataTableCell className="text-center">-</DataTableCell>
                                <DataTableCell className={`text-right ${isOpeningBalanceNegative ? 'text-red-600' : 'text-slate-700'}`}>
                                    {formattedOpeningBalance}
                                </DataTableCell>
                            </DataTableRow>

                            {/* Baris Transaksi Riil */}
                            {computedRows.map((row, index) => {
                                const isCreditMutation = row.type === 'Kredit' || row.type === 'Cr' || row.type === 'Credit' || Number(row.credit ?? 0) > 0;
                                const typeLabel = isCreditMutation ? 'Kredit' : 'Debit';
                                const balVal = Number(row.computedBalance ?? row.balance ?? 0);
                                const isNegativeBalance = balVal < 0;
                                const formattedBalance = isNegativeBalance
                                    ? `-${formatCurrencyValue(Math.abs(balVal))}`
                                    : formatCurrencyValue(balVal);
                                const isClickable = Boolean(row.document_id && row.document_type);

                                return (
                                    <DataTableRow
                                        key={row.id ?? index}
                                        onClick={() => handleRowClick(row)}
                                        className={`transition-colors ${isClickable ? 'cursor-pointer hover:bg-slate-100' : 'hover:bg-slate-50'}`}
                                    >
                                        <DataTableCell className="text-center whitespace-nowrap text-text-workspace-dark">{formatHistoryDate(row.date)}</DataTableCell>
                                        <DataTableCell className="text-text-workspace-dark">{row.source_number || '-'}</DataTableCell>
                                        <DataTableCell>{row.transaction_type || '-'}</DataTableCell>
                                        <DataTableCell>{row.description || '-'}</DataTableCell>
                                        <DataTableCell className={`text-right ${isCreditMutation ? 'text-red-600' : ''}`}>
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

                            {/* Baris Total (Dengan merge colSpan={4} & Saldo Akhir) */}
                            <DataTableRow className="hover:bg-slate-50 transition-colors select-none">
                                <DataTableCell colSpan={4} className="text-text-workspace-dark font-normal">
                                    Total
                                </DataTableCell>
                                <DataTableCell className={`text-right ${totalMutation.isCredit ? 'text-red-600' : ''}`}>
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
        </div>
    );
}

export default AccountsHistoryTab;
