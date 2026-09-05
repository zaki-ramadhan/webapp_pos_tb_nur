import { useState, useMemo } from 'react';
import RefreshButton from '@/features/workspace/shared/RefreshButton';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { showSuccessToast, showErrorToast, showLoadingToast, showWarningToast, dismissToast } from '@/components/feedback/toast';
import axios from 'axios';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Pagination from '@/components/ui/Pagination';

import JurnalCard from './components/JurnalCard';
import BankReconcileActionCard from './components/BankReconcileActionCard';
import BankReconciliationHeader from './components/BankReconciliationHeader';
import BankStatementImportModal from './components/BankStatementImportModal';
import BankReconciliationMatchedRow from './components/BankReconciliationMatchedRow';
import { runReconciliationMatching } from './reconciliationExcelParser';
import { Check } from 'lucide-react';
import { FileFormatBadgeIcon } from '@/components/ui/FileUpload';
import starterStateImg from './assets/rekonsiliasi_starter_state.webp';
import emptyStateImg from './assets/rekonsiliasi_empty_state.png';

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
    const [bankError, setBankError] = useState('');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const unreconciledRows = useMemo(() => {
        return rows.filter((row) => row.status !== 'Reconciled');
    }, [rows]);

    const unreconciledCount = unreconciledRows.length;

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

    const [statementData, setStatementData] = useState(null);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [activeMatchTab, setActiveMatchTab] = useState('all');

    const matchedResults = useMemo(() => {
        if (!statementData?.rows || !statementData.rows.length) return null;
        return runReconciliationMatching(statementData.rows, rows);
    }, [statementData, rows]);

    const matchedCount = useMemo(() => {
        if (!matchedResults) return 0;
        return matchedResults.filter((r) => r.status === 'matched').length;
    }, [matchedResults]);

    const excelOnlyCount = useMemo(() => {
        if (!matchedResults) return 0;
        return matchedResults.filter((r) => r.status === 'excel_only').length;
    }, [matchedResults]);

    const systemOnlyCount = useMemo(() => {
        if (!matchedResults) return 0;
        return matchedResults.filter((r) => r.status === 'system_only').length;
    }, [matchedResults]);

    const pendingMatchCount = useMemo(() => {
        if (!matchedResults) return 0;
        return matchedResults.filter((r) => r.status === 'matched' && r.system && r.system.status !== 'Reconciled').length;
    }, [matchedResults]);

    const filteredMatchedResults = useMemo(() => {
        if (!matchedResults) return [];
        if (activeMatchTab === 'matched') return matchedResults.filter((r) => r.status === 'matched');
        if (activeMatchTab === 'excel_only') return matchedResults.filter((r) => r.status === 'excel_only');
        if (activeMatchTab === 'system_only') return matchedResults.filter((r) => r.status === 'system_only');
        return matchedResults;
    }, [matchedResults, activeMatchTab]);

    const handleReconcileBatch = async () => {
        if (!matchedResults) return;
        const pendingMatched = matchedResults
            .filter((item) => item.status === 'matched' && item.system && item.system.status !== 'Reconciled')
            .map((item) => item.system.documentNumber || item.system.sourceNumber || item.system.document_number)
            .filter(Boolean);

        if (pendingMatched.length === 0) {
            showWarningToast({
                title: 'Tidak Ada Transaksi',
                message: 'Semua transaksi yang cocok sudah direkonsiliasi.',
            });
            return;
        }

        const toastId = showLoadingToast({ message: `Merekonsiliasikan ${pendingMatched.length} transaksi...` });
        try {
            await axios.post('/api/backend/bank-reconciliations/reconcile', {
                document_numbers: pendingMatched,
                is_closed: true,
                account_id: filters.account_id || null,
            });
            showSuccessToast({
                title: 'Berhasil',
                message: `${pendingMatched.length} transaksi berhasil direkonsiliasikan secara otomatis.`,
            });
            onRefresh?.();
        } catch (err) {
            showErrorToast({
                title: 'Gagal',
                message: err.response?.data?.message || 'Terjadi kesalahan saat rekonsiliasi massal.',
            });
        } finally {
            dismissToast(toastId);
        }
    };

    const handleReconcileSingle = async (docNumber, isClosed, accountId = null) => {
        setReconcilingIds(prev => ({ ...prev, [docNumber]: true }));
        const toastId = showLoadingToast({ message: isClosed ? 'Merekonsiliasikan...' : 'Membatalkan rekonsiliasi...' });

        try {
            await axios.post('/api/backend/bank-reconciliations/reconcile', {
                document_numbers: [docNumber],
                is_closed: isClosed,
                account_id: accountId || filters.account_id || null,
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

    const hasBankSelected = Boolean(keyword?.trim() || filters.search?.trim() || filters.account_id);

    return (
        <div className="flex min-h-full flex-col text-slate-900">
            {/* Filter & Upload Toolbar */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-wrap items-start gap-2.5">
                    <div className="w-full sm:w-[280px] md:w-[320px] shrink-0">
                        <AccountLookupTextInput
                            id="keyword"
                            value={keyword}
                            placeholder="Cari/Pilih Bank..."
                            searchLabel="Cari kas/bank"
                            dialogTitle="Pilih Kas/Bank"
                            queryParams={{ account_type: 'Cash/Bank' }}
                            error={bankError}
                            message={bankError}
                            onFocus={() => setBankError('')}
                            onChange={() => setBankError('')}
                            className={`h-[40px] rounded-[4px] w-full ${bankError ? '!border-danger focus-within:!border-danger' : 'border-ui-border'}`}
                            inputClassName="text-sm text-slate-900 py-1 h-full"
                            trailingClassName="w-[32px] shrink-0 justify-center px-0 h-full"
                            onSelectAccount={(record, label) => {
                                setBankError('');
                                setKeyword(label);
                                onFiltersChange?.((prev) => ({ ...prev, search: label }));
                            }}
                            onClear={() => {
                                setBankError('');
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

                    <button
                        type="button"
                        onClick={() => {
                            if (!hasBankSelected) {
                                setBankError('Bank harus dipilih terlebih dahulu');
                                showWarningToast({
                                    title: 'Pilih Bank Terlebih Dahulu',
                                    message: 'Silakan cari dan pilih kas/bank terlebih dahulu sebelum mengimpor rekening koran.',
                                });
                                return;
                            }
                            setBankError('');
                            setImportModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 h-[40px] px-3.5 rounded-[4px] text-xs sm:text-sm font-normal text-white bg-brand-blue hover:bg-brand-blue-hover border border-transparent shadow-button-primary cursor-pointer active:scale-[0.98] transition shrink-0"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Impor Mutasi</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col flex-1 min-h-0 mt-3">
                {/* Statement Summary Banner */}
                {statementData && (
                    <div className="mb-3 rounded-[4px] border border-slate-200 bg-white p-3.5 shadow-2xs">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <FileFormatBadgeIcon
                                    ext={statementData.fileName?.split('.').pop() || 'CSV'}
                                    className="shrink-0"
                                />
                                <div>
                                    <span className="text-sm font-normal text-slate-800">
                                        {statementData.fileName}
                                    </span>
                                    <div className="text-xs text-slate-500 mt-0.5 font-normal">
                                        {statementData.rows.length} Mutasi
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={pendingMatchCount === 0}
                                    onClick={handleReconcileBatch}
                                    className="inline-flex items-center gap-1.5 rounded-[4px] bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-normal shadow-button-primary transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <Check className="h-4 w-4 stroke-[2]" />
                                    <span>Rekonsiliasi Semua Cocok ({pendingMatchCount})</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatementData(null);
                                        setActiveMatchTab('all');
                                    }}
                                    className="inline-flex items-center justify-center rounded-[4px] border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-sm font-normal text-slate-700 shadow-2xs transition active:scale-[0.98] cursor-pointer"
                                >
                                    Tutup Impor
                                </button>
                            </div>
                        </div>

                        {/* Filter Sub-Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 text-sm">
                            <span className="text-slate-500 text-sm font-normal mr-1">Filter:</span>
                            {[
                                { id: 'all', label: `Semua (${matchedResults.length})` },
                                { id: 'matched', label: `Cocok (${matchedCount})` },
                                { id: 'excel_only', label: `Hanya di Bank (${excelOnlyCount})` },
                                { id: 'system_only', label: `Hanya di Sistem (${systemOnlyCount})` },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveMatchTab(tab.id)}
                                    className={`px-3 py-1 rounded-[4px] text-sm font-normal transition cursor-pointer ${
                                        activeMatchTab === tab.id
                                            ? 'bg-brand-blue text-white shadow-2xs'
                                            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Column Headers */}
                <BankReconciliationHeader
                    lastKnownBalance={lastKnownBalance}
                    rawBalanceNum={rawBalanceNum}
                    unreconciledCount={unreconciledCount}
                    hasData={hasBankSelected}
                />

                {/* Body Section */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center p-8 text-slate-900 font-normal">
                        Memuat data...
                    </div>
                ) : !hasBankSelected ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[360px]">
                        <img
                            src={starterStateImg}
                            alt="Pilih bank yang akan direkonsiliasi"
                            className="w-48 h-auto max-h-48 object-contain mb-6 opacity-60 saturate-[0.3]"
                            style={{ filter: 'saturate(0.3)' }}
                        />
                        <div className="text-base sm:text-lg font-normal tracking-normal text-slate-500">
                            Pilih bank yang akan direkonsiliasi
                        </div>
                    </div>
                ) : statementData ? (
                    <>
                        {filteredMatchedResults.length > 0 ? (
                            <div className="overflow-y-auto py-3 flex flex-col gap-3 min-h-0 flex-1">
                                {filteredMatchedResults.map((item) => {
                                    const key = item.id;
                                    const docNum = item.system?.documentNumber || item.system?.sourceNumber || item.system?.document_number;
                                    return (
                                        <BankReconciliationMatchedRow
                                            key={key}
                                            item={item}
                                            isReconciling={Boolean(docNum && reconcilingIds[docNum])}
                                            onReconcile={(doc, isClosed, acctId) => handleReconcileSingle(doc, isClosed, acctId)}
                                            onUnreconcile={(doc, isClosed, acctId) => handleReconcileSingle(doc, isClosed, acctId)}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[250px]">
                                <p className="text-sm text-slate-500 font-medium">
                                    Tidak ada mutasi yang sesuai dengan filter ini.
                                </p>
                            </div>
                        )}
                    </>
                ) : unreconciledRows.length > 0 ? (
                    <>
                        <div className="overflow-y-auto py-3 flex flex-col gap-3 min-h-0 flex-1">
                            {unreconciledRows.map((row, index) => {
                                const isReconciled = row.status === 'Reconciled';
                                const key = row.documentNumber || row.sourceNumber || row.document_number;

                                return (
                                    <div key={key || index} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-stretch">
                                        {/* Left Column Card: Jurnal Sistem */}
                                        <JurnalCard row={row} />

                                        {/* Right Column Card: Rekening Bank */}
                                        <BankReconcileActionCard
                                            isReconciled={isReconciled}
                                            isReconciling={Boolean(reconcilingIds[key])}
                                            onReconcile={() => {
                                                setSelectedRow(row);
                                                setConfirmOpen(true);
                                            }}
                                            onUnreconcile={() => handleReconcileSingle(key, false, row.account_id)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        {pagination && (
                            <div>
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
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
                        <img
                            src={emptyStateImg}
                            alt="Tidak ada data mutasi kas/bank yang tersedia."
                            className="w-48 h-auto max-h-48 object-contain mb-6 opacity-60 saturate-[0.3]"
                            style={{ filter: 'saturate(0.3)' }}
                        />
                        <div className="text-base sm:text-lg font-normal tracking-normal text-slate-500">
                            Tidak ada data mutasi kas/bank yang tersedia.
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
                        onClick={() => setConfirmOpen(false)}
                        className="inline-flex items-center justify-center rounded-[4px] border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition active:scale-[0.98] cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={async () => {
                            if (selectedRow) {
                                setConfirmOpen(false);
                                await handleReconcileSingle(
                                    selectedRow.documentNumber || selectedRow.sourceNumber || selectedRow.document_number,
                                    true,
                                    selectedRow.account_id
                                );
                            }
                        }}
                        className="inline-flex items-center justify-center rounded-[4px] bg-[#1c558c] hover:bg-[#154370] px-4 py-2 text-xs font-semibold text-white shadow-sm transition active:scale-[0.98] cursor-pointer"
                    >
                        Ya
                    </button>
                </div>
            </WorkspaceDialog>

            {/* Bank Statement Import Modal */}
            <BankStatementImportModal
                open={importModalOpen}
                bankName={keyword}
                onClose={() => setImportModalOpen(false)}
                onImportSuccess={(data) => {
                    setStatementData(data);
                    setActiveMatchTab('all');
                    showSuccessToast({
                        title: 'Impor Berhasil',
                        message: `${data.rows.length} baris mutasi bank berhasil dimuat dan dicocokkan.`,
                    });
                }}
            />
        </div>
    );
}
