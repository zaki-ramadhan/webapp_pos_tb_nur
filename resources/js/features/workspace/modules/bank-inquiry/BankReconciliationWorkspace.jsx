import { useState, useMemo } from 'react';
import RefreshButton from '@/features/workspace/shared/RefreshButton';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '@/components/feedback/toast';
import axios from 'axios';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Pagination from '@/components/ui/Pagination';

import JurnalCard from './components/JurnalCard';
import BankReconcileActionCard from './components/BankReconcileActionCard';
import BankReconciliationHeader from './components/BankReconciliationHeader';

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

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const unreconciledCount = useMemo(() => {
        return rows.filter((row) => row.status !== 'Reconciled').length;
    }, [rows]);

    const rawBalanceNum = useMemo(() => {
        if (rows && rows.length > 0) {
            const finalRow = rows[rows.length - 1];
            if (finalRow && finalRow.balance !== undefined && finalRow.balance !== null) {
                const strVal = String(finalRow.balance);
                const cleanStr = strVal.replace(/\./g, '').replace(/,/g, '.');
                const num = parseFloat(cleanStr);
                if (!isNaN(num)) return num;
            }
        }
        return 0;
    }, [rows]);

    const lastKnownBalance = useMemo(() => {
        return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(rawBalanceNum);
    }, [rawBalanceNum]);

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
        <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light text-slate-900">
            {/* Filter & Upload Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
                    <div className="w-full sm:w-[280px] md:w-[320px] shrink-0">
                        <AccountLookupTextInput
                            id="keyword"
                            value={keyword}
                            placeholder="Cari/Pilih Bank..."
                            searchLabel="Cari kas/bank"
                            dialogTitle="Pilih Kas/Bank"
                            queryParams={{ account_type: 'Cash/Bank' }}
                            className="h-[40px] rounded-[4px] border-ui-border w-full"
                            inputClassName="text-sm text-slate-900 py-1 h-full"
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
                                inputClassName="text-sm text-slate-900 py-1 h-full"
                                trailingClassName="w-[32px] shrink-0 justify-center px-0 h-full"
                            />
                        </div>
                        <span className="text-slate-900 text-sm px-0.5 shrink-0">s/d</span>
                        <div className="w-[140px] sm:w-[155px] shrink-0">
                            <TransactionDateInput
                                value={endDate}
                                onChange={(val) => {
                                    setEndDate(val);
                                    onFiltersChange?.((prev) => ({ ...prev, end_date: val }));
                                }}
                                minDate={startDate}
                                className="h-[40px] rounded-[4px] border-ui-border w-full"
                                inputClassName="text-sm text-slate-900 py-1 h-full"
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

            <div className="flex flex-col flex-1 min-h-0 border border-slate-200 rounded-[4px] mt-3 overflow-hidden">
                {/* Column Headers */}
                <BankReconciliationHeader
                    lastKnownBalance={lastKnownBalance}
                    rawBalanceNum={rawBalanceNum}
                    unreconciledCount={unreconciledCount}
                />

                {/* Body Section */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center p-8 text-slate-900 font-normal">
                        Memuat data...
                    </div>
                ) : rows.length > 0 ? (
                    <>
                        <div className="overflow-y-auto p-3 flex flex-col gap-3 min-h-0 flex-1 bg-[#f8fafc]">
                            {rows.map((row, index) => {
                                const isReconciled = row.status === 'Reconciled';
                                const key = row.documentNumber || row.sourceNumber || row.document_number;

                                return (
                                    <div key={key || index} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-stretch">
                                        {/* Left Card: Jurnal Sistem */}
                                        <JurnalCard row={row} />

                                        {/* Right Column Card: Reconcile Action Button / Status */}
                                        <BankReconcileActionCard
                                            isReconciled={isReconciled}
                                            isReconciling={Boolean(reconcilingIds[key])}
                                            onReconcile={() => {
                                                setSelectedRow(row);
                                                setConfirmOpen(true);
                                            }}
                                            onUnreconcile={() => handleReconcileSingle(key, false)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                            {pagination && (
                                <div className="bg-white p-2.5">
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
