import { useState, useRef, useEffect } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
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
        <WorkspaceDialog
            open={open}
            onClose={handleClose}
            title="Impor Rekening Koran (Bank Statement)"
            maxWidthClassName="max-w-[660px]"
            contentClassName="bg-white p-5 sm:p-6"
            footer={
                <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-[4px] border border-slate-300 bg-white px-4 py-2 text-xs font-normal text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        disabled={!parsedData || !parsedData.rows?.length || loading}
                        onClick={handleConfirm}
                        className="inline-flex items-center justify-center rounded-[4px] bg-brand-blue hover:bg-brand-blue-hover px-4 py-2 text-xs font-normal text-white shadow-xs transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                        Lanjutkan Rekonsiliasi ({parsedData?.rows?.length || 0} Mutasi)
                    </button>
                </div>
            }
        >
            <div className="flex flex-col gap-4">
                {bankName ? (
                    <div className="flex items-center gap-2 rounded-[4px] bg-blue-50 px-3 py-2 border border-blue-200 text-xs text-blue-900">
                        <span className="font-medium text-blue-800">Kas/Bank Sasaran:</span>
                        <span className="rounded bg-white px-2 py-0.5 font-normal border border-blue-200 text-blue-950">{bankName}</span>
                    </div>
                ) : null}

                <p className="text-xs text-slate-600 leading-relaxed">
                    Unggah berkas mutasi rekening koran dari internet banking (BCA, Mandiri, BRI, BNI, dll) dalam format <strong>.CSV</strong> atau <strong>.XLSX</strong> untuk dicocokkan otomatis dengan buku bank sistem.
                </p>

                {/* Dropzone Area */}
                <StatementDropzone onFileSelect={handleFileSelect} disabled={loading} />

                {/* File Progress Card (di bawah dropzone) */}
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

                {/* Pratinjau Mutasi jika sudah terbaca */}
                {parsedData && parsedData.rows?.length ? (
                    <div className="flex flex-col gap-2 rounded-[4px] border border-slate-200 bg-white p-3">
                        <button
                            type="button"
                            onClick={() => setShowPreview((prev) => !prev)}
                            className="flex items-center justify-between text-xs font-medium text-brand-blue hover:underline cursor-pointer"
                        >
                            <span>
                                {showPreview ? 'Sembunyikan Pratinjau Mutasi' : `Lihat Pratinjau Mutasi (${parsedData.rows.length} Baris)`}
                            </span>
                            <span className="text-[11px] text-slate-500">
                                {showPreview ? '▲ Tutup' : '▼ Buka'}
                            </span>
                        </button>

                        {showPreview ? (
                            <div className="max-h-[190px] overflow-y-auto border border-slate-200 rounded-[4px] mt-1">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-slate-100 text-slate-900 sticky top-0 border-b border-slate-200">
                                        <tr>
                                            <th className="px-2.5 py-1.5 font-semibold">Tgl</th>
                                            <th className="px-2.5 py-1.5 font-semibold">Keterangan</th>
                                            <th className="px-2.5 py-1.5 font-semibold text-right">Nominal</th>
                                            <th className="px-2.5 py-1.5 font-semibold text-center">Tipe</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-800">
                                        {parsedData.rows.slice(0, 5).map((row, idx) => (
                                            <tr key={row.id || idx} className="hover:bg-slate-50">
                                                <td className="px-2.5 py-1.5 whitespace-nowrap text-[11px]">{row.date}</td>
                                                <td className="px-2.5 py-1.5 truncate max-w-[260px] text-[11px]" title={row.description}>
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
            </div>
        </WorkspaceDialog>
    );
}
