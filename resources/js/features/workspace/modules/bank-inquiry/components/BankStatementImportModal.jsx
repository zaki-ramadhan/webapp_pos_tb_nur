import { useState, useRef, useEffect } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import { FileUpload } from '@/components/ui/FileUpload';
import { parseBankStatementFile } from '../reconciliationExcelParser';
import { Check } from 'lucide-react';

function formatDisplayDate(dateStr) {
    if (!dateStr) return '-';
    const parts = String(dateStr).split('-');
    if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const dmyMatch = String(dateStr).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (dmyMatch) {
        return `${dmyMatch[1].padStart(2, '0')}/${dmyMatch[2].padStart(2, '0')}/${dmyMatch[3]}`;
    }
    return dateStr;
}

export default function BankStatementImportModal({ open, onClose, onImportSuccess, bankName = '' }) {
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
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
    };

    const uploadAndParseFile = (selectedFile) => {
        if (!selectedFile) return;

        const ext = selectedFile.name.split('.').pop().toLowerCase();
        if (!['csv', 'xlsx', 'xls'].includes(ext)) {
            setFile(selectedFile);
            setError('Format berkas tidak didukung. Silakan pilih berkas .CSV, .XLSX, atau .XLS.');
            setParsedData(null);
            setProgress(0);
            return;
        }

        if (progressTimerRef.current) clearInterval(progressTimerRef.current);

        setFile(selectedFile);
        setLoading(true);
        setError('');
        setProgress(15);

        progressTimerRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 85) {
                    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
                    return 85;
                }
                return prev + 25;
            });
        }, 70);

        parseBankStatementFile(selectedFile)
            .then((result) => {
                if (progressTimerRef.current) clearInterval(progressTimerRef.current);
                if (!result.rows || result.rows.length === 0) {
                    throw new Error('Tidak ada baris transaksi yang berhasil dibaca dari berkas ini.');
                }
                setProgress(100);
                setParsedData(result);
            })
            .catch((err) => {
                if (progressTimerRef.current) clearInterval(progressTimerRef.current);
                setError(err.message || 'Gagal memproses berkas rekening koran.');
                setParsedData(null);
                setProgress(0);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleDropFiles = (files) => {
        if (!files || files.length === 0) return;
        uploadAndParseFile(files[0]);
    };

    const handleRetry = () => {
        if (file) {
            uploadAndParseFile(file);
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
                        Mulai Rekonsiliasi
                    </button>
                </div>
            }
        >
            <div className="flex flex-col gap-4">
                <FileUpload.Root>
                    {!file ? (
                        <FileUpload.DropZone
                            isDisabled={loading}
                            onDropFiles={handleDropFiles}
                            accept=".csv,.xlsx,.xls"
                            maxSizeText="CSV, XLSX, atau XLS (maks. 10MB)"
                        />
                    ) : (
                        <FileUpload.List>
                            <FileUpload.ListItemProgressBar
                                name={file.name}
                                size={file.size}
                                type={file.name.split('.').pop()}
                                progress={progress}
                                failed={Boolean(error)}
                                errorMessage={error}
                                onDelete={handleReset}
                                onRetry={handleRetry}
                            />
                        </FileUpload.List>
                    )}
                </FileUpload.Root>

                {/* Pratinjau Mutasi jika sudah terbaca */}
                {parsedData && parsedData.rows?.length ? (
                    <div className="flex flex-col gap-2.5 pt-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-800">Pratinjau Hasil Ekstraksi</span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white shadow-2xs leading-tight">
                                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                                    <span>{parsedData.rows.length} Mutasi Ditemukan</span>
                                </span>
                            </div>
                            {parsedData.summary ? (
                                <div className="flex items-center gap-2 text-xs font-normal">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-emerald-800">
                                        Kredit: {parsedData.summary.inCount || 0}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 text-rose-800">
                                        Debit: {parsedData.summary.outCount || 0}
                                    </span>
                                </div>
                            ) : null}
                        </div>

                        <div className="max-h-[260px] overflow-y-auto rounded-lg border border-slate-200">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-slate-50 text-slate-700 sticky top-0 border-b border-slate-200">
                                    <tr>
                                        <th className="px-3.5 py-2.5 font-medium w-[120px]">Tanggal</th>
                                        <th className="px-3.5 py-2.5 font-medium">Keterangan</th>
                                        <th className="px-3.5 py-2.5 font-medium text-right w-[140px]">Nominal (Rp)</th>
                                        <th className="px-3.5 py-2.5 font-medium text-center w-[90px]">Tipe</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-800">
                                    {parsedData.rows.slice(0, 10).map((row, idx) => (
                                        <tr key={row.id || idx} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-3.5 py-2 whitespace-nowrap text-sm font-normal text-slate-800">
                                                {formatDisplayDate(row.date)}
                                            </td>
                                            <td className="px-3.5 py-2 truncate max-w-[280px] text-sm font-normal text-slate-800" title={row.description}>
                                                {row.description}
                                            </td>
                                            <td className="px-3.5 py-2 whitespace-nowrap text-right text-sm font-normal text-slate-900">
                                                {new Intl.NumberFormat('id-ID').format(row.amount)}
                                            </td>
                                            <td className="px-3.5 py-2 whitespace-nowrap text-center">
                                                <span
                                                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        row.type === 'CR'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                    }`}
                                                >
                                                    {row.type === 'CR' ? 'Kredit' : 'Debit'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {parsedData.rows.length > 10 && (
                            <p className="text-sm font-normal text-slate-600 text-right pt-0.5">
                                Menampilkan 10 baris teratas dari total {parsedData.rows.length} baris transaksi mutasi
                            </p>
                        )}
                    </div>
                ) : null}
            </div>
        </WorkspaceDialog>
    );
}
