import { useState } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import {
    DataTable,
    DataTableHeader,
    DataTableHead,
    DataTableBody,
    DataTableRow,
    DataTableCell,
} from '@/components/ui/DataTable';
import StatementDropzone from './StatementDropzone';
import StatementFileProgressCard from './StatementFileProgressCard';
import { parseBankStatementFile } from '../reconciliationExcelParser';
import { showWarningToast } from '@/components/feedback/toast';

export default function BankStatementImportModal({ open, onClose, onImportSuccess, bankName = '' }) {
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleReset = () => {
        setFile(null);
        setParsedData(null);
        setLoading(false);
        setError('');
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
                        <div className="flex items-center justify-between text-sm font-medium text-slate-800 border-b border-slate-100 pb-2">
                            <span>Pratinjau Data Transaksi Mutasi ({parsedData.rows.length} Ditemukan)</span>
                            <span className="text-sm font-normal text-slate-500">
                                5 Baris Teratas
                            </span>
                        </div>

                        <DataTable wrapperClassName="max-h-[200px] overflow-y-auto border-table-border">
                            <DataTableHeader>
                                <DataTableRow>
                                    <DataTableHead className="w-[120px] px-3 py-2 text-left">Tanggal</DataTableHead>
                                    <DataTableHead className="px-3 py-2 text-left">Keterangan</DataTableHead>
                                    <DataTableHead className="w-[140px] px-3 py-2 text-right">Nominal</DataTableHead>
                                    <DataTableHead className="w-[90px] px-3 py-2 text-center">Tipe</DataTableHead>
                                </DataTableRow>
                            </DataTableHeader>
                            <DataTableBody>
                                {parsedData.rows.slice(0, 5).map((row, idx) => (
                                    <DataTableRow key={row.id || idx} className="hover:bg-slate-50">
                                        <DataTableCell className="w-[120px] px-3 py-2 text-left text-sm font-normal text-slate-700 whitespace-nowrap">
                                            {row.date}
                                        </DataTableCell>
                                        <DataTableCell className="px-3 py-2 text-left text-sm font-normal text-slate-800" title={row.description}>
                                            {row.description}
                                        </DataTableCell>
                                        <DataTableCell className="w-[140px] px-3 py-2 text-right text-sm font-normal text-slate-800 whitespace-nowrap">
                                            Rp {new Intl.NumberFormat('id-ID').format(row.amount)}
                                        </DataTableCell>
                                        <DataTableCell className="w-[90px] px-3 py-2 text-center whitespace-nowrap">
                                            <span
                                                className={`inline-block px-2 py-0.5 rounded-[4px] text-xs font-medium ${
                                                    row.type === 'CR'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                }`}
                                            >
                                                {row.type === 'CR' ? 'Masuk' : 'Keluar'}
                                            </span>
                                        </DataTableCell>
                                    </DataTableRow>
                                ))}
                            </DataTableBody>
                        </DataTable>
                        {parsedData.rows.length > 5 && (
                            <p className="text-sm font-normal text-slate-600 text-right pt-0.5">
                                Menampilkan 5 dari total {parsedData.rows.length} baris transaksi mutasi
                            </p>
                        )}
                    </div>
                ) : null}
            </div>
        </WorkspaceDialog>
    );
}
