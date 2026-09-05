import { useState, useRef } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import { parseBankStatementFile } from '../reconciliationExcelParser';
import { showWarningToast } from '@/components/feedback/toast';

export default function BankStatementImportModal({ open, onClose, onImportSuccess }) {
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

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

        try {
            const result = await parseBankStatementFile(selectedFile);
            if (!result.rows || result.rows.length === 0) {
                throw new Error('Tidak ada baris transaksi yang berhasil dibaca dari file ini.');
            }
            setParsedData(result);
        } catch (err) {
            setError(err.message || 'Gagal memproses file rekening koran.');
            setParsedData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleReset = () => {
        setFile(null);
        setParsedData(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleConfirm = () => {
        if (!parsedData || !parsedData.rows.length) return;
        onImportSuccess?.(parsedData);
        handleReset();
        onClose?.();
    };

    return (
        <WorkspaceDialog
            open={open}
            onClose={() => {
                handleReset();
                onClose?.();
            }}
            title="Impor Rekening Koran (Bank Statement)"
            maxWidthClassName="max-w-[700px]"
            contentClassName="bg-white p-5 sm:p-6"
            footer={
                <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
                    <button
                        type="button"
                        onClick={() => {
                            handleReset();
                            onClose?.();
                        }}
                        className="rounded-[4px] border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        disabled={!parsedData || !parsedData.rows.length || loading}
                        onClick={handleConfirm}
                        className="inline-flex items-center justify-center rounded-[4px] bg-[#1c558c] hover:bg-[#154370] px-4 py-2 text-xs font-semibold text-white shadow-xs transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                        Lanjutkan Rekonsiliasi ({parsedData?.rows?.length || 0} Mutasi)
                    </button>
                </div>
            }
        >
            <div className="flex flex-col gap-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                    Unggah berkas mutasi rekening koran dari internet banking (BCA, Mandiri, BRI, BNI, dll) dalam format <strong>.CSV</strong> atau <strong>.XLSX</strong> untuk dicocokkan otomatis dengan buku bank sistem.
                </p>

                {/* Upload Drag & Drop Zone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-[6px] cursor-pointer transition ${
                        file ? 'border-blue-400 bg-blue-50/40' : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
                    }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                handleFileSelect(e.target.files[0]);
                            }
                        }}
                    />

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 mb-2">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </div>

                    <div className="text-xs font-semibold text-slate-700">
                        {file ? file.name : 'Klik untuk memilih file atau seret file ke sini'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                        Mendukung format .CSV, .XLSX, .XLS (Maks. 10MB)
                    </div>
                </div>

                {loading && (
                    <div className="py-4 text-center text-xs text-slate-900 font-medium">
                        Sedang membaca dan memetakan baris mutasi bank...
                    </div>
                )}

                {error && (
                    <div className="rounded-[4px] border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                        {error}
                    </div>
                )}

                {parsedData && (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs text-slate-700 font-semibold pt-1">
                            <span>Pratinjau Data Rekening Koran ({parsedData.rows.length} mutasi ditemukan)</span>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="text-blue-600 hover:underline text-xs cursor-pointer"
                            >
                                Ganti Berkas
                            </button>
                        </div>

                        <div className="max-h-[220px] overflow-y-auto border border-slate-200 rounded-[4px]">
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
                                            <td className="px-2.5 py-1.5 whitespace-nowrap">{row.date}</td>
                                            <td className="px-2.5 py-1.5 truncate max-w-[280px]" title={row.description}>
                                                {row.description}
                                            </td>
                                            <td className="px-2.5 py-1.5 whitespace-nowrap text-right font-medium">
                                                Rp {new Intl.NumberFormat('id-ID').format(row.amount)}
                                            </td>
                                            <td className="px-2.5 py-1.5 whitespace-nowrap text-center">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                    row.type === 'CR' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                }`}>
                                                    {row.type === 'CR' ? 'Masuk' : 'Keluar'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {parsedData.rows.length > 5 && (
                            <p className="text-[11px] text-slate-600 italic text-right">
                                Menampilkan 5 dari {parsedData.rows.length} baris transaksi.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </WorkspaceDialog>
    );
}
