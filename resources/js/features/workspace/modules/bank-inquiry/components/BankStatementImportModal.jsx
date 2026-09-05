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
            title="Impor Rekening Koran"
            maxWidthClassName="max-w-[720px]"
            contentClassName="bg-white p-5 sm:p-6"
            footer={
                <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3.5 pb-1">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] shadow-2xs cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        disabled={!parsedData || !parsedData.rows?.length || loading}
                        onClick={handleConfirm}
                        className="inline-flex h-[40px] items-center justify-center rounded-[4px] bg-brand-blue hover:bg-brand-blue-hover px-6 text-sm font-medium text-white shadow-button-primary transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        Lanjutkan Rekonsiliasi {parsedData?.rows?.length ? `(${parsedData.rows.length} Mutasi)` : ''}
                    </button>
                </div>
            }
        >
            <div className="flex flex-col gap-4">
                {/* Dropzone Area */}
                <StatementDropzone onFileSelect={handleFileSelect} disabled={loading} />

                {/* File Progress & Detail Card (di bawah dropzone) */}
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

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Unggah berkas mutasi rekening koran dari internet banking (BCA, Mandiri, BRI, BNI, dll) dalam format <strong>.CSV</strong> atau <strong>.XLSX</strong> untuk dicocokkan otomatis dengan buku bank sistem.
                </p>

                {/* Pratinjau Mutasi jika sudah terbaca */}
                {parsedData && parsedData.rows?.length ? (
                    <div className="flex flex-col gap-2.5 rounded-[6px] border border-slate-200 bg-white p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
                            <span>Pratinjau Data Transaksi Mutasi ({parsedData.rows.length} Ditemukan)</span>
                            <span className="text-xs font-normal text-slate-500">
                                5 Baris Teratas
                            </span>
                        </div>

                        <div className="max-h-[200px] overflow-y-auto border border-slate-200 rounded-[4px]">
                            <table className="w-full text-left text-xs sm:text-sm border-collapse">
                                <thead className="bg-slate-100 text-slate-900 sticky top-0 border-b border-slate-200">
                                    <tr>
                                        <th className="px-3 py-2 font-semibold">Tanggal</th>
                                        <th className="px-3 py-2 font-semibold">Keterangan</th>
                                        <th className="px-3 py-2 font-semibold text-right">Nominal</th>
                                        <th className="px-3 py-2 font-semibold text-center">Tipe</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-800">
                                    {parsedData.rows.slice(0, 5).map((row, idx) => (
                                        <tr key={row.id || idx} className="hover:bg-slate-50">
                                            <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-slate-700 font-medium">
                                                {row.date}
                                            </td>
                                            <td className="px-3 py-2 truncate max-w-[280px] text-xs sm:text-sm text-slate-900" title={row.description}>
                                                {row.description}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-right font-bold text-xs sm:text-sm text-slate-900">
                                                Rp {new Intl.NumberFormat('id-ID').format(row.amount)}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-center">
                                                <span
                                                    className={`px-2 py-0.5 rounded-[4px] text-xs font-bold ${
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
                        {parsedData.rows.length > 5 && (
                            <p className="text-xs text-slate-500 italic text-right">
                                Menampilkan 5 dari total {parsedData.rows.length} baris transaksi mutasi.
                            </p>
                        )}
                    </div>
                ) : null}
            </div>
        </WorkspaceDialog>
    );
}
