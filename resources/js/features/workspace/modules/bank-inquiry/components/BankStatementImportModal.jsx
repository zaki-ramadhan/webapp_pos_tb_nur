import { useState, useRef, useEffect } from 'react';
import ModalBase from '@/components/ui/ModalBase';
import { CloseIcon } from '@/features/workspace/shared/Icons';
import StatementDropzone from './StatementDropzone';
import StatementFileProgressCard from './StatementFileProgressCard';
import { parseBankStatementFile } from '../reconciliationExcelParser';
import { showWarningToast } from '@/components/feedback/toast';

export default function BankStatementImportModal({ open, onClose, onImportSuccess, bankName = '' }) {
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const progressTimerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (progressTimerRef.current) {
                clearInterval(progressTimerRef.current);
            }
        };
    }, []);

    const handleReset = () => {
        if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
        }
        setFile(null);
        setParsedData(null);
        setLoading(false);
        setError('');
        setProgress(0);
        setShowPreview(false);
    };

    const handleFileSelect = async (selectedFile) => {
        if (!selectedFile) return;

        const ext = selectedFile.name.split('.').pop().toLowerCase();
        if (!['csv', 'xlsx', 'xls'].includes(ext)) {
            showWarningToast({
                title: 'Format Tidak Didukung',
                message: 'Silakan pilih berkas file berformat .CSV, .XLSX, atau .XLS.',
            });
            return;
        }

        setFile(selectedFile);
        setLoading(true);
        setError('');
        setProgress(20);

        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        progressTimerRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 85) {
                    clearInterval(progressTimerRef.current);
                    return 85;
                }
                return prev + 15;
            });
        }, 70);

        try {
            const result = await parseBankStatementFile(selectedFile);
            if (!result.rows || result.rows.length === 0) {
                throw new Error('Tidak ada baris transaksi yang berhasil dibaca dari file ini.');
            }
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
            setProgress(100);
            setParsedData(result);
        } catch (err) {
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
            setError(err.message || 'Gagal memproses file rekening koran.');
            setParsedData(null);
            setProgress(100);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (!parsedData || !parsedData.rows?.length) return;
        onImportSuccess?.(parsedData);
        handleReset();
        onClose?.();
    };

    const handleClose = () => {
        handleReset();
        onClose?.();
    };

    return (
        <ModalBase
            open={open}
            onBackdropClick={handleClose}
            className="bg-slate-900/40 backdrop-blur-xs p-3 sm:p-5"
            panelClassName="max-w-[560px] rounded-[24px] sm:rounded-[28px] bg-[#F8F7FF] border border-[#EBEBF8] p-5 sm:p-7 shadow-2xl overflow-hidden"
        >
            <div className="flex flex-col gap-5 sm:gap-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <h2 className="text-lg sm:text-xl font-medium text-slate-800 truncate">
                            Unggah Rekening Koran
                        </h2>
                        {bankName ? (
                            <span
                                className="hidden sm:inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-xs font-normal text-indigo-700 border border-[#ECEBFA] truncate max-w-[200px]"
                                title={bankName}
                            >
                                {bankName}
                            </span>
                        ) : null}
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#9B99DA] hover:bg-white hover:text-slate-700 transition cursor-pointer"
                        title="Tutup dialog"
                    >
                        <CloseIcon className="h-4 w-4" strokeWidth={2.2} />
                    </button>
                </div>

                {/* Dropzone */}
                <StatementDropzone onFileSelect={handleFileSelect} disabled={loading} />

                {/* File Progress Card */}
                {file ? (
                    <StatementFileProgressCard
                        file={file}
                        progress={progress}
                        parsedData={parsedData}
                        loading={loading}
                        error={error}
                        onRemove={handleReset}
                    />
                ) : null}

                {/* Optional Expandable Preview Table */}
                {parsedData && parsedData.rows?.length ? (
                    <div className="flex flex-col gap-2 rounded-[16px] bg-white p-3.5 border border-[#ECEBFA]">
                        <button
                            type="button"
                            onClick={() => setShowPreview((prev) => !prev)}
                            className="flex items-center justify-between text-xs font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer"
                        >
                            <span>
                                {showPreview ? 'Sembunyikan Pratinjau Mutasi' : `Lihat Pratinjau Mutasi (${parsedData.rows.length} Baris)`}
                            </span>
                            <span className="text-[11px] text-slate-500">
                                {showPreview ? '▲ Tutup' : '▼ Buka'}
                            </span>
                        </button>

                        {showPreview ? (
                            <div className="max-h-[190px] overflow-y-auto border border-slate-100 rounded-lg mt-1">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-slate-50 text-slate-700 sticky top-0 border-b border-slate-200">
                                        <tr>
                                            <th className="px-2.5 py-1.5 font-medium">Tanggal</th>
                                            <th className="px-2.5 py-1.5 font-medium">Keterangan</th>
                                            <th className="px-2.5 py-1.5 font-medium text-right">Nominal</th>
                                            <th className="px-2.5 py-1.5 font-medium text-center">Tipe</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {parsedData.rows.slice(0, 5).map((row, idx) => (
                                            <tr key={row.id || idx} className="hover:bg-slate-50/70">
                                                <td className="px-2.5 py-1.5 whitespace-nowrap text-[11px]">{row.date}</td>
                                                <td className="px-2.5 py-1.5 truncate max-w-[200px] text-[11px]" title={row.description}>
                                                    {row.description}
                                                </td>
                                                <td className="px-2.5 py-1.5 whitespace-nowrap text-right font-medium text-[11px]">
                                                    Rp {new Intl.NumberFormat('id-ID').format(row.amount)}
                                                </td>
                                                <td className="px-2.5 py-1.5 whitespace-nowrap text-center">
                                                    <span
                                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                            row.type === 'CR'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-rose-100 text-rose-800'
                                                        }`}
                                                    >
                                                        {row.type === 'CR' ? 'Masuk' : 'Keluar'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : null}
                    </div>
                ) : null}

                {/* Help tip popover / box */}
                {showHelp ? (
                    <div className="rounded-[16px] bg-white p-3.5 border border-indigo-100 text-xs text-slate-700 space-y-1.5 animate-fadeIn">
                        <div className="font-semibold text-indigo-900">Format Rekening Koran yang Didukung:</div>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                            <li><strong>e-Statement BRImo</strong> (.csv/.xlsx) - otomatis mengenali format transaksi BRI.</li>
                            <li><strong>BCA KlikBCA Bisnis / Individu</strong> (.csv/.xlsx) dengan kolom Tanggal, Keterangan, Mutasi, Saldo.</li>
                            <li><strong>Mandiri Kopra / Livin</strong> &amp; <strong>BNI Direct</strong>.</li>
                            <li>Format standar dengan kolom Tanggal, Deskripsi, Debet / Kredit.</li>
                        </ul>
                    </div>
                ) : null}

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                        type="button"
                        onClick={() => setShowHelp((prev) => !prev)}
                        className={`h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-[14px] bg-white border border-[#E7E6F8] shadow-2xs flex items-center justify-center text-[#736AE9] hover:bg-slate-50 transition cursor-pointer ${
                            showHelp ? 'bg-indigo-50 border-indigo-300' : ''
                        }`}
                        title="Panduan format file rekening koran"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <path d="M12 17h.01" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-[14px] bg-white border border-[#E7E6F8] text-[#655CE5] hover:bg-indigo-50/40 px-5 sm:px-6 py-2.5 text-sm font-medium transition cursor-pointer shadow-2xs"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            disabled={!parsedData || !parsedData.rows?.length || loading}
                            onClick={handleConfirm}
                            className="rounded-[14px] bg-gradient-to-r from-[#7B75F7] to-[#645CEB] hover:from-[#726BF5] hover:to-[#5B53E3] text-white px-6 sm:px-7 py-2.5 text-sm font-medium shadow-md shadow-indigo-400/25 active:scale-[0.98] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {parsedData?.rows?.length ? `Lanjutkan (${parsedData.rows.length} Mutasi)` : 'Lanjutkan'}
                        </button>
                    </div>
                </div>
            </div>
        </ModalBase>
    );
}
