import { useState, useMemo } from 'react';
import RefreshButton from '@/features/workspace/shared/RefreshButton';
import { TransactionDateInput, TransactionToolbarIconButton } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { RefreshIcon } from '@/features/workspace/shared/Icons';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '@/components/feedback/toast';
import axios from 'axios';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Pagination from '@/components/ui/Pagination';

function JurnalCard({ row }) {
    const debitNum = row.debit ? (parseFloat(String(row.debit).replace(/\./g, '').replace(/,/g, '.')) || 0) : 0;
    const creditNum = row.credit ? (parseFloat(String(row.credit).replace(/\./g, '').replace(/,/g, '.')) || 0) : 0;
    
    const isDebit = debitNum > 0;
    const num = isDebit ? debitNum : creditNum;
    const formattedAmount = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(num);

    return (
        <div className="border border-[#a5d2e6] rounded-[4px] bg-[#e6f4fc]/30 overflow-hidden flex flex-col min-h-[110px] shadow-sm">
            <div className="p-3 flex-1 flex flex-col gap-1">
                <div className="flex justify-between items-start text-xs text-slate-500">
                    <span>{row.date}</span>
                    <span className="font-semibold text-slate-800 text-sm">
                        {isDebit ? '(Dr)' : '(Cr)'} {formattedAmount}
                    </span>
                </div>
                <div className="text-sm font-semibold text-slate-700 mt-1.5 leading-tight text-left">
                    {row.transactionType || row.transaction_type}
                </div>
                {row.description && (
                    <div className="text-xs text-slate-500 line-clamp-1 mt-0.5 text-left" title={row.description}>
                        {row.description}
                    </div>
                )}
            </div>
            <div className="bg-[#e6f4fa] px-3 py-1.5 text-xs text-[#2b6885] font-mono border-t border-[#c5e4f2] text-left">
                {row.documentNumber || row.sourceNumber || row.document_number}
            </div>
        </div>
    );
}

export default function BankReconciliationWorkspace({
    rows = [],
    loading = false,
    onRefresh = null,
    filters = {},
    onFiltersChange = null,
    pagination = null,
}) {
    const [reconcilingIds, setReconcilingIds] = useState({});
    const [keyword, setKeyword] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    
    // Confirmation dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const isAccountSelected = keyword.trim().length > 0;

    const unreconciledCount = useMemo(() => {
        return rows.filter((row) => row.status !== 'Reconciled').length;
    }, [rows]);

    const lastKnownBalance = useMemo(() => {
        if (rows && rows.length > 0) {
            const finalRow = rows[rows.length - 1];
            if (finalRow && finalRow.balance) {
                const cleanStr = String(finalRow.balance).replace(/\./g, '').replace(/,/g, '.');
                const num = parseFloat(cleanStr) || 0;
                return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(num);
            }
        }
        return '0';
    }, [rows]);

    const handleReconcileSingle = async (docNumber, isClosed) => {
        setReconcilingIds(prev => ({ ...prev, [docNumber]: true }));
        const toastId = showLoadingToast({ message: isClosed ? 'Merekonsiliasikan...' : 'Membatalkan rekonsiliasi...' });
        
        try {
            await axios.post('/api/backend/bank-reconciliations/reconcile', {
                document_numbers: [docNumber],
                is_closed: isClosed,
            });
            showSuccessToast({ 
                title: 'Berhasil', 
                message: isClosed 
                    ? `Dokumen ${docNumber} berhasil direkonsiliasikan.` 
                    : `Rekonsiliasi dokumen ${docNumber} berhasil dibatalkan.` 
            });
            onRefresh?.();
        } catch (err) {
            showErrorToast({ title: 'Gagal', message: err.response?.data?.message || 'Terjadi kesalahan sistem.' });
        } finally {
            dismissToast(toastId);
            setReconcilingIds(prev => ({ ...prev, [docNumber]: false }));
        }
    };

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light text-slate-800">
            {/* Filter & Upload Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
                    <div className="w-full sm:w-[280px] md:w-[320px] shrink-0">
                        <AccountLookupTextInput
                            id="keyword"
                            value={keyword}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari kas/bank"
                            dialogTitle="Pilih Kas/Bank"
                            queryParams={{ account_type: 'Cash/Bank' }}
                            className="h-[40px] rounded-[4px] border-ui-border w-full"
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
                                className="h-[40px] rounded-[4px] border-ui-border w-full"
                                inputClassName="text-sm text-brand-dark py-1 h-full"
                                trailingClassName="w-[32px] shrink-0 justify-center px-0 h-full"
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
                                className="h-[40px] rounded-[4px] border-ui-border w-full"
                                inputClassName="text-sm text-brand-dark py-1 h-full"
                                trailingClassName="w-[32px] shrink-0 justify-center px-0 h-full"
                            />
                        </div>
                    </div>

                    {onRefresh ? (
                        <RefreshButton
                            label="Muat ulang"
                            onClick={onRefresh}
                            loading={loading}
                        />
                    ) : null}
                </div>
            </div>

            {!isAccountSelected ? (
                <div className="flex flex-col items-center justify-center p-12 text-center mt-3 flex-1 min-h-[300px] border border-slate-200 rounded-[4px]">
                    <svg className="h-16 w-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="text-lg font-semibold text-slate-700">Mulai Rekonsiliasi Bank</h3>
                    <p className="text-slate-500 text-sm mt-1 max-w-sm">
                        Silakan pilih akun kas / bank terlebih dahulu pada pilihan filter di atas untuk memulai rekonsiliasi.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col flex-1 min-h-0 border border-slate-200 rounded-[4px] mt-3 overflow-hidden">
                    {/* Column Headers */}
                    <div className="grid grid-cols-2">
                        {/* Left Header: JURNAL SISTEM */}
                        <div className="flex flex-col border-r border-slate-200">
                            <div className="border-t-[3px] border-[#0c6b96] bg-white px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
                                    <svg className="h-4 w-4 text-[#0c6b96]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>JURNAL SISTEM</span>
                                </div>
                            </div>
                            <div className="bg-[#f2f5f7] border-y border-slate-200 px-4 py-2 flex items-center justify-between text-xs min-h-[34px]">
                                <span className="font-semibold text-slate-700">
                                    Saldo &nbsp;<span className="text-slate-900 font-semibold">Rp {lastKnownBalance}</span>
                                </span>
                                {unreconciledCount > 0 && (
                                    <span className="text-rose-600 font-medium flex items-center gap-1">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                                            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                                        </svg>
                                        {unreconciledCount} data belum cocok
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Right Header: REKENING BANK */}
                        <div className="flex flex-col">
                            <div className="border-t-[3px] border-[#0c6b96] bg-white px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
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
                        <>
                            <div className="overflow-y-auto p-4 flex flex-col gap-3 min-h-0 flex-1 bg-[#f2f5f7]/30">
                                {rows.map((row, index) => {
                                    const isReconciled = row.status === 'Reconciled';
                                    const key = row.documentNumber || row.sourceNumber || row.document_number;

                                    return (
                                        <div key={key || index} className="grid grid-cols-2 gap-4 items-center bg-white border border-slate-200 rounded-[4px] p-3 hover:shadow-sm transition">
                                            {/* Left Card: Jurnal Sistem */}
                                            <JurnalCard row={row} />

                                            {/* Right Column: Reconcile Action Button / Status */}
                                            {isReconciled ? (
                                                <div className="flex flex-col items-center justify-center p-3 h-full">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
                                                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.74-5.25z" clipRule="evenodd" />
                                                        </svg>
                                                        Cocok
                                                    </span>
                                                    <button
                                                        type="button"
                                                        disabled={reconcilingIds[key]}
                                                        onClick={() => handleReconcileSingle(key, false)}
                                                        className="text-xs text-rose-600 hover:text-rose-800 hover:underline mt-2.5 font-semibold disabled:opacity-50 cursor-pointer"
                                                    >
                                                        {reconcilingIds[key] ? 'Membatalkan...' : 'Batalkan kecocokan'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <button
                                                        type="button"
                                                        disabled={reconcilingIds[key]}
                                                        onClick={() => {
                                                            setSelectedRow(row);
                                                            setConfirmOpen(true);
                                                        }}
                                                        className="inline-flex items-center justify-center gap-1.5 rounded-[4px] border border-brand-blue-border bg-white text-brand-blue hover:bg-brand-blue-light px-4 py-2 text-xs font-semibold transition shadow-sm active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                                                    >
                                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        <span>Ada di Rekening Koran</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {pagination && (
                                <div className="bg-white border-t border-slate-200 p-2.5">
                                    <Pagination
                                        page={pagination.page}
                                        perPage={pagination.perPage}
                                        total={pagination.total}
                                        lastPage={pagination.lastPage}
                                        from={pagination.from}
                                        to={pagination.to}
                                        onPageChange={pagination.onPageChange}
                                        onPerPageChange={pagination.onPerPageChange}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
                            <svg className="h-16 w-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-slate-500 text-sm font-medium mt-2">
                                Tidak ada data mutasi kas/bank yang tersedia
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Confirmation Dialog */}
            <WorkspaceDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                title="Konfirmasi"
                maxWidthClassName="max-w-[440px]"
                contentClassName="bg-white p-6"
            >
                <div className="flex items-start gap-4">
                    {/* Yellow Exclamation Warning Icon */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                        </svg>
                    </div>

                    {/* Message */}
                    <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-rose-800 mt-1 leading-relaxed">
                            Apakah histori ini ada tercetak dalam rekening koran?
                        </p>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-6 flex justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={async () => {
                            if (selectedRow) {
                                setConfirmOpen(false);
                                await handleReconcileSingle(
                                    selectedRow.documentNumber || selectedRow.sourceNumber || selectedRow.document_number,
                                    true
                                );
                            }
                        }}
                        className="inline-flex items-center justify-center rounded-[4px] bg-[#1c558c] hover:bg-[#154370] px-4 py-2 text-xs font-semibold text-white shadow-sm transition active:scale-[0.98] cursor-pointer"
                    >
                        Ya
                    </button>
                    <button
                        type="button"
                        onClick={() => setConfirmOpen(false)}
                        className="inline-flex items-center justify-center rounded-[4px] border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition active:scale-[0.98] cursor-pointer"
                    >
                        Batal
                    </button>
                </div>
            </WorkspaceDialog>
        </div>
    );
}
