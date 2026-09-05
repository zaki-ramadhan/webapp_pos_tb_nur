import { useState, useRef, useEffect, useMemo } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import {
    DataTable,
    DataTableHeader,
    DataTableBody,
    DataTableRow,
    DataTableCell,
} from '@/components/ui/DataTable';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
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
    const [sortKey, setSortKey] = useState('date');
    const [sortDir, setSortDir] = useState('asc');
    const progressTimerRef = useRef(null);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const sortedRows = useMemo(() => {
        if (!parsedData?.rows) return [];
        const list = [...parsedData.rows];
        list.sort((a, b) => {
            if (sortKey === 'amount') {
                const numA = a.type === 'DB' ? -a.amount : a.amount;
                const numB = b.type === 'DB' ? -b.amount : b.amount;
                return sortDir === 'asc' ? numA - numB : numB - numA;
            }
            if (sortKey === 'date') {
                return sortDir === 'asc'
                    ? String(a.date).localeCompare(String(b.date))
                    : String(b.date).localeCompare(String(a.date));
            }
            return sortDir === 'asc'
                ? String(a[sortKey] || '').localeCompare(String(b[sortKey] || ''))
                : String(b[sortKey] || '').localeCompare(String(a[sortKey] || ''));
        });
        return list;
    }, [parsedData?.rows, sortKey, sortDir]);

    const summary = useMemo(() => {
        if (!parsedData?.rows) return null;
        const inCount = parsedData.rows.filter((r) => r.type === 'CR').length;
        const outCount = parsedData.rows.filter((r) => r.type === 'DB').length;
        return { inCount, outCount };
    }, [parsedData?.rows]);

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
            contentClassName="bg-white px-5 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-3"
            footerClassName="bg-white px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200"
            footer={
                <div className="flex items-center justify-between gap-3 w-full">
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
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 pl-2 pr-3 py-1 text-xs font-medium text-white shadow-2xs leading-tight">
                                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                                    <span>{parsedData.rows.length} Mutasi Ditemukan</span>
                                </span>
                            </div>
                            {summary ? (
                                <div className="flex items-center gap-2 text-xs font-normal">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-emerald-800">
                                        Kredit: {summary.inCount || 0}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 text-rose-800">
                                        Debit: {summary.outCount || 0}
                                    </span>
                                </div>
                            ) : null}
                        </div>

                        <DataTable wrapperClassName="max-h-[280px] overflow-auto">
                            <DataTableHeader>
                                <DataTableRow>
                                    <SortableTableHeaderCell
                                        label="Tanggal"
                                        align="left"
                                        widthClassName="w-[120px]"
                                        sortable={true}
                                        sortDirection={sortKey === 'date' ? sortDir : null}
                                        onSort={() => handleSort('date')}
                                    />
                                    <SortableTableHeaderCell
                                        label="Keterangan"
                                        align="left"
                                        sortable={true}
                                        sortDirection={sortKey === 'description' ? sortDir : null}
                                        onSort={() => handleSort('description')}
                                    />
                                    <SortableTableHeaderCell
                                        label="Nominal (Rp)"
                                        align="right"
                                        widthClassName="w-[140px]"
                                        sortable={true}
                                        sortDirection={sortKey === 'amount' ? sortDir : null}
                                        onSort={() => handleSort('amount')}
                                    />
                                    <SortableTableHeaderCell
                                        label="Tipe"
                                        align="center"
                                        widthClassName="w-[90px]"
                                        sortable={true}
                                        sortDirection={sortKey === 'type' ? sortDir : null}
                                        onSort={() => handleSort('type')}
                                    />
                                </DataTableRow>
                            </DataTableHeader>
                            <DataTableBody>
                                {sortedRows.slice(0, 10).map((row, idx) => (
                                    <DataTableRow key={row.id || idx} className="hover:bg-slate-50">
                                        <DataTableCell className="w-[120px] px-3 py-2 text-left text-sm font-normal text-slate-800 whitespace-nowrap">
                                            {formatDisplayDate(row.date)}
                                        </DataTableCell>
                                        <DataTableCell className="px-3 py-2 text-left text-sm font-normal text-slate-800" title={row.description}>
                                            {row.description}
                                        </DataTableCell>
                                        <DataTableCell className="w-[140px] px-3 py-2 text-right text-sm whitespace-nowrap font-normal">
                                            {row.type === 'DB' ? (
                                                <span className="font-normal text-red-600">
                                                    -{new Intl.NumberFormat('id-ID').format(row.amount)}
                                                </span>
                                            ) : (
                                                <span className="font-normal text-slate-800">
                                                    {new Intl.NumberFormat('id-ID').format(row.amount)}
                                                </span>
                                            )}
                                        </DataTableCell>
                                        <DataTableCell className="w-[90px] px-3 py-2 text-center whitespace-nowrap">
                                            <span
                                                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    row.type === 'CR'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                }`}
                                            >
                                                {row.type === 'CR' ? 'Kredit' : 'Debit'}
                                            </span>
                                        </DataTableCell>
                                    </DataTableRow>
                                ))}
                            </DataTableBody>
                        </DataTable>

                        <p className="text-sm font-normal text-slate-600 text-right pt-0.5">
                            Menampilkan {Math.min(10, parsedData.rows.length)}/{parsedData.rows.length} transaksi mutasi
                        </p>
                    </div>
                ) : null}
            </div>
        </WorkspaceDialog>
    );
}
