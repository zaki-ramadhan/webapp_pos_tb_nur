import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';
import { TransactionDateInput, TransactionToolbarIconButton } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { SearchIcon, RefreshIcon } from '@/features/workspace/shared/Icons';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '@/components/feedback/toast';
import axios from 'axios';

// Components
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import useTableSort from '@/features/workspace/shared/useTableSort';

// Imports
import { defaultColumns, matchColumns, excelColumns, systemColumns } from './reconciliationColumns';
import { parseExcelRows, runReconciliationMatching } from './reconciliationExcelParser';

function resolveAlignClassName(align) {
    if (align === 'right') return 'text-left';
    if (align === 'center') return 'text-center';
    return 'text-left';
}

function JurnalCard({ row }) {
    const isDebit = row.type === 'Debit' || (row.debit && row.debit !== '0,00' && row.debit !== '0');
    const amountVal = isDebit ? row.debit : row.credit;
    
    // Parse amount to number to format
    let num = 0;
    if (amountVal) {
        const cleanStr = String(amountVal).replace(/\./g, '').replace(/,/g, '.');
        num = parseFloat(cleanStr) || 0;
    }
    const formattedAmount = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(num);

    return (
        <div className="border border-[#a5d2e6] rounded-[4px] bg-white overflow-hidden flex flex-col min-h-[110px] shadow-sm">
            <div className="p-3 flex-1 flex flex-col gap-1">
                <div className="flex justify-between items-start text-xs text-slate-500">
                    <span>{row.date}</span>
                    <span className="font-bold text-slate-800 text-sm">
                        {isDebit ? '(Dr)' : '(Cr)'} {formattedAmount}
                    </span>
                </div>
                <div className="text-sm font-semibold text-slate-700 mt-1.5 leading-tight text-left">
                    {row.transaction_type || row.transactionType}
                </div>
                {row.description && (
                    <div className="text-xs text-slate-500 line-clamp-1 mt-0.5 text-left" title={row.description}>
                        {row.description}
                    </div>
                )}
            </div>
            <div className="bg-[#e6f4fa] px-3 py-1.5 text-xs text-[#2b6885] font-mono border-t border-[#c5e4f2] text-left">
                {row.document_number || row.sourceNumber}
            </div>
        </div>
    );
}

function RekeningSlot({ row, match, reconciling, onReconcile }) {
    const isReconciled = row.status === 'Reconciled' || (match && match.status === 'matched');

    return (
        <div className="border border-slate-200 rounded-[4px] bg-slate-50 p-4 flex items-center min-h-[110px]">
            {isReconciled ? (
                <button
                    type="button"
                    onClick={onReconcile}
                    disabled={reconciling}
                    className="inline-flex items-center gap-1.5 bg-[#487a95] hover:bg-[#39637b] text-white text-xs font-semibold py-1.5 px-3 rounded-[3px] shadow-sm transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                    <svg viewBox="0 0 10 8" fill="none" className="h-3.5 w-3.5">
                        <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Ada di Rekening Koran</span>
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onReconcile}
                    disabled={reconciling}
                    className="inline-flex items-center gap-1.5 border border-[#487a95] text-[#487a95] hover:bg-slate-100 bg-white text-xs font-semibold py-1.5 px-3 rounded-[3px] transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                    <span>+ Cocokkan dengan Rekening Koran</span>
                </button>
            )}
        </div>
    );
}

export default function BankReconciliationWorkspace({
    rows = [],
    loading = false,
    onRefresh = null,
    filters = {},
    onFiltersChange = null,
}) {
    const [excelRows, setExcelRows] = useState(null);
    const [activeTab, setActiveTab] = useState('match');
    const [statusFilter, setStatusFilter] = useState(null);
    const [reconcilingIds, setReconcilingIds] = useState({});

    const [keyword, setKeyword] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    // Excel upload handler
    const handleExcelUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const toastId = showLoadingToast({ message: 'Membaca file Excel...' });
        const reader = new FileReader();

        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
                
                const parsed = parseExcelRows(rawData);

                setExcelRows(parsed);
                setStatusFilter(null);
                setActiveTab('match');
                dismissToast(toastId);
                showSuccessToast({ title: 'Berhasil', message: `Berhasil mengimpor ${parsed.length} baris rekening koran.` });
            } catch (err) {
                dismissToast(toastId);
                showErrorToast({ title: 'Gagal membaca Excel', message: err.message });
            }
        };

        reader.readAsBinaryString(file);
    };

    const handleClearExcel = () => {
        setExcelRows(null);
        setStatusFilter(null);
        setActiveTab('match');
    };

    // Matching Algorithm
    const matchResults = useMemo(() => {
        return runReconciliationMatching(excelRows, rows);
    }, [excelRows, rows]);

    const displayedMatchResults = useMemo(() => {
        if (!statusFilter) return matchResults;
        return matchResults.filter(r => r.status === statusFilter);
    }, [matchResults, statusFilter]);

    const summary = useMemo(() => {
        if (!excelRows) return { matched: 0, discrepancy: 0, excelOnly: 0, systemOnly: 0 };
        return {
            matched: matchResults.filter(r => r.status === 'matched').length,
            discrepancy: matchResults.filter(r => r.status === 'discrepancy').length,
            excelOnly: matchResults.filter(r => r.status === 'excel_only').length,
            systemOnly: matchResults.filter(r => r.status === 'system_only').length,
        };
    }, [matchResults, excelRows]);

    const handleReconcileSingle = async (docNumber, isClosed) => {
        setReconcilingIds(prev => ({ ...prev, [docNumber]: true }));
        const toastId = showLoadingToast({ message: isClosed ? 'Merekonsiliasikan...' : 'Membuka rekonsiliasi...' });
        
        try {
            await axios.post('/api/backend/bank-reconciliations/reconcile', {
                document_numbers: [docNumber],
                is_closed: isClosed,
            });
            showSuccessToast({ title: 'Berhasil', message: `Dokumen ${docNumber} berhasil diperbarui.` });
            onRefresh?.();
        } catch (err) {
            showErrorToast({ title: 'Gagal', message: err.response?.data?.message || 'Terjadi kesalahan sistem.' });
        } finally {
            dismissToast(toastId);
            setReconcilingIds(prev => ({ ...prev, [docNumber]: false }));
        }
    };

    const handleBulkReconcile = async () => {
        const openMatchedDocs = matchResults
            .filter(r => r.status === 'matched' && r.system && r.system.status !== 'Reconciled')
            .map(r => r.system.document_number || r.system.sourceNumber)
            .filter(Boolean);

        if (openMatchedDocs.length === 0) {
            showSuccessToast({ title: 'Informasi', message: 'Tidak ada transaksi cocok berstatus Open yang perlu direkonsiliasi.' });
            return;
        }

        const toastId = showLoadingToast({ message: `Merekonsiliasikan ${openMatchedDocs.length} transaksi...` });
        
        try {
            await axios.post('/api/backend/bank-reconciliations/reconcile', {
                document_numbers: openMatchedDocs,
                is_closed: true,
            });
            showSuccessToast({ title: 'Berhasil', message: `${openMatchedDocs.length} transaksi berhasil direkonsiliasikan.` });
            onRefresh?.();
        } catch (err) {
            showErrorToast({ title: 'Gagal', message: err.response?.data?.message || 'Gagal merekonsiliasi massal.' });
        } finally {
            dismissToast(toastId);
        }
    };

    const formatCurrency = (val) => {
        const num = typeof val === 'number' ? val : parseAmount(val);
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
    };

    const isAccountSelected = keyword.trim().length > 0;

    const [lastKnownBalance, setLastKnownBalance] = useState('Rp 0');

    useEffect(() => {
        if (rows && rows.length > 0) {
            const finalRow = rows[rows.length - 1];
            if (finalRow && finalRow.balance) {
                let num = 0;
                const cleanStr = String(finalRow.balance).replace(/\./g, '').replace(/,/g, '.');
                num = parseFloat(cleanStr) || 0;
                setLastKnownBalance(new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num));
            }
        }
    }, [rows]);

    const displayedItems = useMemo(() => {
        if (excelRows) return displayedMatchResults;
        return rows.map((row) => ({
            id: `system-${row.id}`,
            system: row,
            excel: null,
            status: row.status === 'Reconciled' ? 'matched' : 'system_only',
            reason: row.status === 'Reconciled' ? 'Ada di Rekening Koran' : 'Hanya di sistem POS/ERP',
        }));
    }, [excelRows, displayedMatchResults, rows]);

    const { sortedRows: sortedExcelRows, sortKey: excelSortKey, sortDir: excelSortDir, handleSort: handleExcelSort } = useTableSort(excelRows ?? []);
    const { sortedRows: sortedSystemRows, sortKey: systemSortKey, sortDir: systemSortDir, handleSort: handleSystemSort } = useTableSort(rows);

    const unreconciledCount = useMemo(() => {
        return rows.filter((row) => row.status !== 'Reconciled').length;
    }, [rows]);

    return (
        <div className="flex min-h-full flex-col gap-2.5 pt-1.5 text-slate-800">
            
            {/* Filter & Upload Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
                    <div className="w-full sm:w-[280px] md:w-[320px] shrink-0">
                        <AccountLookupTextInput
                            id="keyword"
                            value={keyword}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari kas/bank"
                            dialogTitle="Pilih Kas/Bank"
                            queryParams={{ account_type: 'Cash/Bank' }}
                            className="h-[34px] rounded-[4px] border-ui-border w-full"
                            inputClassName="text-sm text-brand-dark py-1 h-full"
                            trailingClassName="w-[32px] shrink-0 justify-center px-0 h-full"
                            onSelectAccount={(record, label) => {
                                setKeyword(label);
                                onFiltersChange?.((prev) => ({ ...prev, search: label }));
                            }}
                            onClear={() => {
                                setKeyword('');
                                onFiltersChange?.((prev) => ({ ...prev, search: '' }));
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        <div className="w-[140px] sm:w-[155px] shrink-0">
                            <TransactionDateInput
                                value={startDate}
                                onChange={(val) => {
                                    setStartDate(val);
                                    onFiltersChange?.((prev) => ({ ...prev, start_date: val }));
                                }}
                                className="h-[34px] rounded-[4px]"
                                inputClassName="text-xs sm:text-sm py-1"
                            />
                        </div>
                        <span className="text-text-darkest text-sm px-0.5 shrink-0">s/d</span>
                        <div className="w-[140px] sm:w-[155px] shrink-0">
                            <TransactionDateInput
                                value={endDate}
                                onChange={(val) => {
                                    setEndDate(val);
                                    onFiltersChange?.((prev) => ({ ...prev, end_date: val }));
                                }}
                                className="h-[34px] rounded-[4px]"
                                inputClassName="text-xs sm:text-sm py-1"
                            />
                        </div>
                    </div>

                    {onRefresh ? (
                        <TransactionToolbarIconButton
                            label="Muat ulang rekonsiliasi bank"
                            onClick={onRefresh}
                        >
                            <RefreshIcon className="h-4 w-4" />
                        </TransactionToolbarIconButton>
                    ) : null}
                </div>

                <div className="flex items-center gap-2">
                    {!excelRows ? (
                        <label className="inline-flex h-[34px] px-3.5 shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue transition hover:bg-brand-blue-light text-xs font-normal cursor-pointer active:scale-[0.98] shadow-sm">
                            <svg className="mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>Unggah Rekening Koran</span>
                            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelUpload} />
                        </label>
                    ) : (
                        <>
                            <Button
                                variant="primary"
                                disabled={summary.matched === 0}
                                onClick={handleBulkReconcile}
                                className="h-[34px] px-3.5 text-xs font-medium"
                            >
                                Rekonsiliasi Massal ({summary.matched})
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleClearExcel}
                                className="h-[34px] px-3.5 text-xs font-normal border-brand-blue-border text-brand-blue hover:bg-brand-blue-light"
                            >
                                Bersihkan
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {!isAccountSelected ? (
                <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-[6px] shadow-sm p-12 text-center mt-1.5 flex-1 min-h-[300px]">
                    <svg className="h-16 w-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="text-lg font-semibold text-slate-700">Mulai Rekonsiliasi Bank</h3>
                    <p className="text-slate-500 text-sm mt-1 max-w-sm">
                        Silakan pilih akun kas / bank terlebih dahulu pada pilihan filter di atas untuk memulai rekonsiliasi.
                    </p>
                </div>
            ) : (
                <>
                    {/* Clickable Summary Filter Cards */}
                    {excelRows && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <button
                                type="button"
                                onClick={() => setStatusFilter(statusFilter === 'matched' ? null : 'matched')}
                                className={`text-left rounded-[6px] p-3.5 transition border shadow-sm cursor-pointer hover:translate-y-[-1px] ${
                                    statusFilter === 'matched'
                                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-100'
                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="text-[10px] font-bold text-slate-500">Cocok</div>
                                <div className="text-lg font-bold text-emerald-600 mt-1 flex items-center justify-between">
                                    <span>{summary.matched}</span>
                                    <span className="text-[10px] font-normal text-slate-400">Klik filter</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter(statusFilter === 'discrepancy' ? null : 'discrepancy')}
                                className={`text-left rounded-[6px] p-3.5 transition border shadow-sm cursor-pointer hover:translate-y-[-1px] ${
                                    statusFilter === 'discrepancy'
                                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-100'
                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="text-[10px] font-bold text-slate-500">Selisih Nominal</div>
                                <div className="text-xl font-bold text-amber-600 mt-1 flex items-center justify-between">
                                    <span>{summary.discrepancy}</span>
                                    <span className="text-[10px] font-normal text-slate-400">Klik filter</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter(statusFilter === 'excel_only' ? null : 'excel_only')}
                                className={`text-left rounded-[6px] p-3.5 transition border shadow-sm cursor-pointer hover:translate-y-[-1px] ${
                                    statusFilter === 'excel_only'
                                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-100'
                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="text-[10px] font-bold text-slate-500">Hanya di Excel</div>
                                <div className="text-xl font-bold text-sky-600 mt-1 flex items-center justify-between">
                                    <span>{summary.excelOnly}</span>
                                    <span className="text-[10px] font-normal text-slate-400">Klik filter</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter(statusFilter === 'system_only' ? null : 'system_only')}
                                className={`text-left rounded-[6px] p-3.5 transition border shadow-sm cursor-pointer hover:translate-y-[-1px] ${
                                    statusFilter === 'system_only'
                                        ? 'bg-slate-50 border-slate-500 ring-2 ring-slate-100'
                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="text-[10px] font-bold text-slate-500">Hanya di Sistem</div>
                                <div className="text-xl font-bold text-slate-600 mt-1 flex items-center justify-between">
                                    <span>{summary.systemOnly}</span>
                                    <span className="text-[10px] font-normal text-slate-400">Klik filter</span>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Tabs selection (Only if excel loaded) */}
                    {excelRows && (
                        <div className="flex border-b border-slate-200 gap-4 mt-1">
                            <button
                                type="button"
                                onClick={() => setActiveTab('match')}
                                className={`pb-2 text-sm font-semibold border-b-2 transition cursor-pointer select-none ${activeTab === 'match' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Pencocokan Rekening Koran ({displayedMatchResults.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('excel')}
                                className={`pb-2 text-sm font-semibold border-b-2 transition cursor-pointer select-none ${activeTab === 'excel' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Isi Rekening Koran Excel ({excelRows.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('system')}
                                className={`pb-2 text-sm font-semibold border-b-2 transition cursor-pointer select-none ${activeTab === 'system' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Buku Besar Sistem ({rows.length})
                            </button>
                        </div>
                    )}

                    {/* Main Content Area */}
                    {activeTab === 'match' ? (
                        <div className="flex flex-col flex-1 min-h-0 bg-white rounded-[6px] border border-slate-200 shadow-sm overflow-hidden">
                            {/* Column Headers */}
                            <div className="grid grid-cols-2">
                                {/* Left Header: Jurnal Sistem */}
                                <div className="flex flex-col border-r border-slate-200">
                                    <div className="border-t-[3px] border-[#0c6b96] bg-white px-4 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                                            <svg className="h-4 w-4 text-[#0c6b96]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span>JURNAL SISTEM</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#f2f5f7] border-y border-slate-200 px-4 py-2 flex items-center justify-between text-xs min-h-[34px]">
                                        <span className="font-semibold text-slate-700">
                                            Saldo &nbsp;<span className="text-slate-900 font-bold">{lastKnownBalance}</span>
                                        </span>
                                        {unreconciledCount > 0 && rows.length > 0 && (
                                            <span className="text-rose-600 font-medium flex items-center gap-1">
                                                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                                                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                                                </svg>
                                                {unreconciledCount} data belum cocok
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Right Header: Rekening Bank */}
                                <div className="flex flex-col">
                                    <div className="border-t-[3px] border-[#0c6b96] bg-white px-4 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                                            <svg className="h-4 w-4 text-[#0c6b96]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                            <span>REKENING BANK</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#f2f5f7] border-y border-slate-200 px-4 py-2 min-h-[34px] flex items-center justify-between text-xs text-slate-500">
                                        {/* Spacer */}
                                    </div>
                                </div>
                            </div>

                            {/* Body Section */}
                            {loading ? (
                                <div className="flex-1 flex items-center justify-center p-8 text-slate-500">
                                    Memuat data...
                                </div>
                            ) : rows.length > 0 ? (
                                <div className="grid grid-cols-2 flex-1 min-h-0 divide-x divide-slate-200">
                                    {/* Left Pane List */}
                                    <div className="overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
                                        {displayedItems.map((item, index) => (
                                            item.system ? (
                                                <JurnalCard key={item.id || index} row={item.system} />
                                            ) : (
                                                <div key={item.id || index} className="border border-dashed border-slate-200 rounded-[4px] bg-slate-50 flex flex-col justify-center items-center p-4 min-h-[110px]">
                                                    <span className="text-xs text-slate-400 italic">Tidak tertera di Buku Besar</span>
                                                </div>
                                            )
                                        ))}
                                    </div>

                                    {/* Right Pane List */}
                                    <div className="overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
                                        {displayedItems.map((item, index) => {
                                            if (item.system) {
                                                return (
                                                    <RekeningSlot
                                                        key={item.id || index}
                                                        row={item.system}
                                                        match={item}
                                                        reconciling={reconcilingIds[item.system.document_number || item.system.sourceNumber]}
                                                        onReconcile={() => handleReconcileSingle(
                                                            item.system.document_number || item.system.sourceNumber,
                                                            item.system.status !== 'Reconciled'
                                                        )}
                                                    />
                                                );
                                            } else {
                                                return (
                                                    <div key={item.id || index} className="border border-slate-200 rounded-[4px] bg-sky-50/40 p-3 flex flex-col gap-1 min-h-[110px] w-full text-left">
                                                        <div className="flex justify-between items-start text-xs text-slate-500">
                                                            <span>{item.excel.date}</span>
                                                            <span className="font-bold text-slate-800 text-sm">
                                                                {item.excel.type === 'DB' ? '(Dr)' : '(Cr)'} {formatCurrency(item.excel.amount)}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-slate-700 font-medium truncate mt-1 leading-tight" title={item.excel.description}>
                                                            {item.excel.description}
                                                        </div>
                                                        <div className="text-[10px] text-sky-700 italic font-semibold mt-1">
                                                            Hanya di Rekening Koran (Belum Dicatat)
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
                                    <svg className="h-24 w-24 text-slate-300 mb-4 animate-pulse-subtle" viewBox="0 0 100 100" fill="none">
                                        <path d="M15 25v50h70V35H50L40 25H15z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M15 35h70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="55" cy="55" r="15" fill="white" stroke="currentColor" strokeWidth="3" />
                                        <line x1="65" y1="65" x2="80" y2="80" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                        <text x="55" y="60" textAnchor="middle" className="font-bold text-slate-400 text-base" fill="currentColor">?</text>
                                    </svg>
                                    <div className="text-slate-500 text-sm font-medium mt-2">
                                        Tidak ada data mutasi kas/bank yang tersedia
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'excel' ? (
                        <div className="overflow-hidden rounded-[6px] border border-slate-200 bg-white shadow-sm flex flex-col flex-1 min-h-0">
                            <div className="min-h-0 overflow-x-auto">
                                <DataTable className="w-full border-0" wrapperClassName="rounded-none border-0">
                                    <DataTableHeader className="bg-table-header-bg">
                                        <tr>
                                            {excelColumns.map((col) => (
                                                <SortableTableHeaderCell
                                                    key={col.id}
                                                    label={col.label}
                                                    align={col.align}
                                                    widthClassName={col.widthClassName}
                                                    sortable={col.sortable !== false}
                                                    sortDirection={excelSortKey === col.id ? excelSortDir : null}
                                                    onSort={() => handleExcelSort(col.id)}
                                                />
                                            ))}
                                        </tr>
                                    </DataTableHeader>
                                    <DataTableBody>
                                        {sortedExcelRows.length > 0 ? (
                                            sortedExcelRows.map((row, index) => (
                                                <DataTableRow
                                                    key={row.id}
                                                    className={`border-slate-100 ${index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}
                                                >
                                                    <DataTableCell className="text-left px-2.5 text-slate-700 font-normal">{row.date}</DataTableCell>
                                                    <DataTableCell className="px-2.5 text-slate-700 font-normal">{row.description}</DataTableCell>
                                                    <DataTableCell className="text-left px-2.5 font-bold text-slate-900">{formatCurrency(row.amount)}</DataTableCell>
                                                    <DataTableCell className="text-center px-2.5">
                                                        <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-normal ${row.type === 'DB' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                                            {row.type === 'DB' ? 'Debit' : 'Kredit'}
                                                        </span>
                                                    </DataTableCell>
                                                </DataTableRow>
                                            ))
                                        ) : (
                                            <DataTableRow className="bg-white">
                                                <DataTableCell
                                                    colSpan={excelColumns.length}
                                                    className="px-2.5 py-3 text-center text-base text-text-workspace-dark"
                                                >
                                                    Belum ada data.
                                                </DataTableCell>
                                            </DataTableRow>
                                        )}
                                    </DataTableBody>
                                </DataTable>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-[6px] border border-slate-200 bg-white shadow-sm flex flex-col flex-1 min-h-0">
                            <div className="min-h-0 overflow-x-auto">
                                <DataTable className="w-full border-0" wrapperClassName="rounded-none border-0">
                                    <DataTableHeader className="bg-table-header-bg">
                                        <tr>
                                            {systemColumns.map((col) => (
                                                <SortableTableHeaderCell
                                                    key={col.id}
                                                    label={col.label}
                                                    align={col.align}
                                                    widthClassName={col.widthClassName}
                                                    sortable={col.sortable !== false}
                                                    sortDirection={systemSortKey === col.id ? systemSortDir : null}
                                                    onSort={() => handleSystemSort(col.id)}
                                                />
                                            ))}
                                        </tr>
                                    </DataTableHeader>
                                    <DataTableBody>
                                        {sortedSystemRows.length > 0 ? (
                                            sortedSystemRows.map((row, index) => (
                                                <DataTableRow
                                                    key={row.id || index}
                                                    className={`border-slate-100 ${index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}
                                                >
                                                    <DataTableCell className="text-left px-2.5 text-slate-700 font-normal">{row.date}</DataTableCell>
                                                    <DataTableCell className="text-left px-2.5 font-mono font-normal text-slate-700">{row.document_number || row.sourceNumber}</DataTableCell>
                                                    <DataTableCell className="px-2.5 text-slate-700 font-normal">[{row.transaction_type}] {row.description}</DataTableCell>
                                                    <DataTableCell className="text-left px-2.5 text-emerald-600 font-normal">{row.debit && row.debit !== '0,00' ? formatCurrency(row.debit) : '-'}</DataTableCell>
                                                    <DataTableCell className="text-left px-2.5 text-rose-600 font-normal">{row.credit && row.credit !== '0,00' ? formatCurrency(row.credit) : '-'}</DataTableCell>
                                                    <DataTableCell className="text-center px-2.5">
                                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-normal ${row.status === 'Reconciled' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                                            {row.status}
                                                        </span>
                                                    </DataTableCell>
                                                </DataTableRow>
                                            ))
                                        ) : (
                                            <DataTableRow className="bg-white">
                                                <DataTableCell
                                                    colSpan={systemColumns.length}
                                                    className="px-2.5 py-3 text-center text-base text-text-workspace-dark"
                                                >
                                                    Belum ada data.
                                                </DataTableCell>
                                            </DataTableRow>
                                        )}
                                    </DataTableBody>
                                </DataTable>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
