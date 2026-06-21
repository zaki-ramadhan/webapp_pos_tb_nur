import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { SearchIcon } from '@/features/workspace/shared/Icons';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '@/components/feedback/toast';
import axios from 'axios';

// Reusing standard components from the workspace to prevent code bloat
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';

function resolveAlignClassName(align) {
    if (align === 'right') return 'text-left';
    if (align === 'center') return 'text-center';
    return 'text-left';
}

export default function BankReconciliationWorkspace({
    rows = [],
    loading = false,
    onRefresh = null,
    filters = {},
    onFiltersChange = null,
}) {
    const [excelRows, setExcelRows] = useState(null);
    const [activeTab, setActiveTab] = useState('match');
    const [statusFilter, setStatusFilter] = useState(null);
    const [reconcilingIds, setReconcilingIds] = useState({});

    const [keyword, setKeyword] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    // Column Definitions using existing workspace templates
    const defaultColumns = [
        { id: 'date', label: 'Tanggal', widthClassName: 'w-[110px]', align: 'center' },
        { id: 'document_number', label: 'No. Bukti #', widthClassName: 'w-[180px]', align: 'center' },
        { id: 'transaction_type', label: 'Tipe Transaksi', widthClassName: 'w-[180px]', align: 'center' },
        { id: 'description', label: 'Keterangan', widthClassName: 'min-w-[400px]', align: 'left' },
        { id: 'debit', label: 'Debit', widthClassName: 'w-[140px]', align: 'left' },
        { id: 'credit', label: 'Kredit', widthClassName: 'w-[140px]', align: 'left' },
        { id: 'status', label: 'Status', widthClassName: 'w-[120px]', align: 'center' },
        { id: 'action', label: 'Aksi', widthClassName: 'w-[120px]', align: 'center' },
    ];

    const matchColumns = [
        { id: 'excel', label: 'Mutasi Rekening Koran (Excel)', widthClassName: 'w-[33%]', align: 'left' },
        { id: 'status', label: 'Status Cocok', widthClassName: 'w-[14%]', align: 'center' },
        { id: 'system', label: 'Data Transaksi Sistem (POS/ERP)', widthClassName: 'w-[38%]', align: 'left' },
        { id: 'action', label: 'Aksi Rekonsiliasi', widthClassName: 'w-[15%]', align: 'center' },
    ];

    const excelColumns = [
        { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'center' },
        { id: 'description', label: 'Keterangan Mutasi', widthClassName: 'min-w-[400px]', align: 'left' },
        { id: 'amount', label: 'Nominal', widthClassName: 'w-[180px]', align: 'left' },
        { id: 'type', label: 'Tipe', widthClassName: 'w-[100px]', align: 'center' },
    ];

    const systemColumns = [
        { id: 'date', label: 'Tanggal', widthClassName: 'w-[110px]', align: 'center' },
        { id: 'document_number', label: 'No. Bukti #', widthClassName: 'w-[180px]', align: 'center' },
        { id: 'description', label: 'Keterangan', widthClassName: 'min-w-[400px]', align: 'left' },
        { id: 'debit', label: 'Debit', widthClassName: 'w-[150px]', align: 'left' },
        { id: 'credit', label: 'Kredit', widthClassName: 'w-[150px]', align: 'left' },
        { id: 'status', label: 'Status', widthClassName: 'w-[120px]', align: 'center' },
    ];

    // Handle excel file upload & parsing via SheetJS
    const handleExcelUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const toastId = showLoadingToast({ message: 'Membaca file Excel...' });
        const reader = new FileReader();

        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
                
                if (rawData.length < 2) {
                    throw new Error('File Excel kosong atau tidak memiliki data.');
                }

                const headers = rawData[0];
                const dataRows = rawData.slice(1);
                
                let dateIdx = 0, descIdx = 1, amountIdx = 2, typeIdx = -1;

                headers.forEach((h, idx) => {
                    const name = String(h || '').toLowerCase().trim();
                    if (name.includes('tanggal') || name.includes('date') || name.includes('tgl')) dateIdx = idx;
                    else if (name.includes('keterangan') || name.includes('description') || name.includes('narasi')) descIdx = idx;
                    else if (name.includes('jumlah') || name.includes('amount') || name.includes('nominal')) amountIdx = idx;
                    else if (name.includes('tipe') || name.includes('type') || name.includes('d/k')) typeIdx = idx;
                });

                const parsed = dataRows
                    .filter(row => row.length > 0 && row[dateIdx] !== undefined)
                    .map((row, idx) => {
                        let rawDate = row[dateIdx];
                        let formattedDate = '';
                        if (typeof rawDate === 'number') {
                            const dateObj = new Date((rawDate - 25569) * 86400 * 1000);
                            formattedDate = dateObj.toISOString().split('T')[0];
                        } else {
                            try {
                                const parsedDate = new Date(rawDate);
                                formattedDate = !isNaN(parsedDate.getTime()) ? parsedDate.toISOString().split('T')[0] : String(rawDate);
                            } catch {
                                formattedDate = String(rawDate);
                            }
                        }

                        let rawAmt = row[amountIdx];
                        let numericAmt = typeof rawAmt === 'number' ? rawAmt : parseFloat(String(rawAmt || '').replace(/[^0-9.-]+/g, '')) || 0;

                        return {
                            id: `excel-${idx}`,
                            date: formattedDate,
                            description: String(row[descIdx] || '').trim(),
                            amount: numericAmt,
                            type: typeIdx !== -1 ? String(row[typeIdx] || '').trim() : (numericAmt >= 0 ? 'CR' : 'DB'),
                        };
                    });

                setExcelRows(parsed);
                setStatusFilter(null);
                setActiveTab('match');
                dismissToast(toastId);
                showSuccessToast({ title: 'Berhasil', message: `Berhasil mengimpor ${parsed.length} baris rekening koran.` });
            } catch (err) {
                dismissToast(toastId);
                showErrorToast({ title: 'Gagal membaca Excel', message: err.message });
            }
        };

        reader.readAsBinaryString(file);
    };

    const handleClearExcel = () => {
        setExcelRows(null);
        setStatusFilter(null);
        setActiveTab('match');
    };

    const parseAmount = (val) => {
        if (!val) return 0;
        if (typeof val === 'number') return val;
        return parseFloat(String(val).replace(/[^0-9.-]+/g, '')) || 0;
    };

    // Matching Algorithm
    const matchResults = useMemo(() => {
        if (!excelRows) return [];

        let unmatchedSystem = [...rows];
        let results = [];

        excelRows.forEach((excelRow) => {
            const excelAmt = Math.abs(excelRow.amount);
            const excelDate = new Date(excelRow.date);
            const excelDesc = excelRow.description.toLowerCase();

            let matchedSysRow = null;
            let matchReason = '';
            let matchScore = 0;

            for (let i = 0; i < unmatchedSystem.length; i++) {
                const sysRow = unmatchedSystem[i];
                const sysDocNum = String(sysRow.document_number || sysRow.sourceNumber || '').toLowerCase();
                const sysAmt = sysRow.type === 'Debit' ? parseAmount(sysRow.debit) : parseAmount(sysRow.credit);

                if (sysDocNum && excelDesc.includes(sysDocNum)) {
                    if (Math.abs(excelAmt - sysAmt) < 0.01) {
                        matchedSysRow = sysRow;
                        matchReason = 'Nomor Bukti & Nominal Cocok';
                        matchScore = 3;
                        break;
                    } else {
                        matchedSysRow = sysRow;
                        matchReason = 'Nomor Bukti Cocok, Nominal Berbeda';
                        matchScore = 1;
                    }
                }
            }

            if (!matchedSysRow || matchScore < 3) {
                let bestDateMatch = null;
                let bestDaysDiff = 999;

                for (let i = 0; i < unmatchedSystem.length; i++) {
                    const sysRow = unmatchedSystem[i];
                    const sysAmt = sysRow.type === 'Debit' ? parseAmount(sysRow.debit) : parseAmount(sysRow.credit);

                    if (Math.abs(excelAmt - sysAmt) < 0.01) {
                        const sysDate = new Date(sysRow.date);
                        const diffTime = Math.abs(sysDate - excelDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays <= 3 && diffDays < bestDaysDiff) {
                            bestDateMatch = sysRow;
                            bestDaysDiff = diffDays;
                        }
                    }
                }

                if (bestDateMatch) {
                    matchedSysRow = bestDateMatch;
                    matchReason = `Nominal & Tanggal Cocok (Selisih ${bestDaysDiff} hari)`;
                    matchScore = 2;
                }
            }

            if (matchedSysRow) {
                unmatchedSystem = unmatchedSystem.filter(item => item.id !== matchedSysRow.id);
                results.push({
                    id: `match-${excelRow.id}`,
                    excel: excelRow,
                    system: matchedSysRow,
                    status: matchScore >= 2 ? 'matched' : 'discrepancy',
                    reason: matchReason,
                });
            } else {
                results.push({
                    id: `excel-only-${excelRow.id}`,
                    excel: excelRow,
                    system: null,
                    status: 'excel_only',
                    reason: 'Hanya di Rekening Koran',
                });
            }
        });

        unmatchedSystem.forEach((sysRow) => {
            results.push({
                id: `system-only-${sysRow.id}`,
                excel: null,
                system: sysRow,
                status: 'system_only',
                reason: 'Hanya di sistem POS/ERP',
            });
        });

        return results;
    }, [excelRows, rows]);

    const displayedMatchResults = useMemo(() => {
        if (!statusFilter) return matchResults;
        return matchResults.filter(r => r.status === statusFilter);
    }, [matchResults, statusFilter]);

    const summary = useMemo(() => {
        if (!excelRows) return { matched: 0, discrepancy: 0, excelOnly: 0, systemOnly: 0 };
        return {
            matched: matchResults.filter(r => r.status === 'matched').length,
            discrepancy: matchResults.filter(r => r.status === 'discrepancy').length,
            excelOnly: matchResults.filter(r => r.status === 'excel_only').length,
            systemOnly: matchResults.filter(r => r.status === 'system_only').length,
        };
    }, [matchResults, excelRows]);

    const handleReconcileSingle = async (docNumber, isClosed) => {
        setReconcilingIds(prev => ({ ...prev, [docNumber]: true }));
        const toastId = showLoadingToast({ message: isClosed ? 'Merekonsiliasikan...' : 'Membuka rekonsiliasi...' });
        
        try {
            await axios.post('/api/backend/bank-reconciliations/reconcile', {
                document_numbers: [docNumber],
                is_closed: isClosed,
            });
            showSuccessToast({ title: 'Berhasil', message: `Dokumen ${docNumber} berhasil diperbarui.` });
            onRefresh?.();
        } catch (err) {
            showErrorToast({ title: 'Gagal', message: err.response?.data?.message || 'Terjadi kesalahan sistem.' });
        } finally {
            dismissToast(toastId);
            setReconcilingIds(prev => ({ ...prev, [docNumber]: false }));
        }
    };

    const handleBulkReconcile = async () => {
        const openMatchedDocs = matchResults
            .filter(r => r.status === 'matched' && r.system && r.system.status !== 'Reconciled')
            .map(r => r.system.document_number || r.system.sourceNumber)
            .filter(Boolean);

        if (openMatchedDocs.length === 0) {
            showSuccessToast({ title: 'Informasi', message: 'Tidak ada transaksi cocok berstatus Open yang perlu direkonsiliasi.' });
            return;
        }

        const toastId = showLoadingToast({ message: `Merekonsiliasikan ${openMatchedDocs.length} transaksi...` });
        
        try {
            await axios.post('/api/backend/bank-reconciliations/reconcile', {
                document_numbers: openMatchedDocs,
                is_closed: true,
            });
            showSuccessToast({ title: 'Berhasil', message: `${openMatchedDocs.length} transaksi berhasil direkonsiliasikan.` });
            onRefresh?.();
        } catch (err) {
            showErrorToast({ title: 'Gagal', message: err.response?.data?.message || 'Gagal merekonsiliasi massal.' });
        } finally {
            dismissToast(toastId);
        }
    };

    const formatCurrency = (val) => {
        const num = typeof val === 'number' ? val : parseAmount(val);
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
    };

    return (
        <div className="flex min-h-full flex-col gap-3 pt-3 text-slate-800">
            
            {/* Filter & Upload Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-[6px] border border-slate-200 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="w-[200px] sm:w-[220px]">
                        <TextInput
                            value={keyword}
                            onChange={(e) => {
                                setKeyword(e.target.value);
                                onFiltersChange?.(prev => ({ ...prev, search: e.target.value }));
                            }}
                            placeholder="Cari transaksi..."
                            trailing={<SearchIcon className="h-4 w-4 text-slate-400" />}
                            className="h-[34px] rounded-[4px] border-slate-300"
                            inputClassName="text-sm"
                        />
                    </div>
                    <div className="w-[140px] sm:w-[150px]">
                        <TransactionDateInput
                            value={startDate}
                            onChange={(val) => {
                                setStartDate(val);
                                onFiltersChange?.(prev => ({ ...prev, start_date: val }));
                            }}
                            className="h-[34px] rounded-[4px] border-slate-300"
                            inputClassName="text-xs sm:text-sm"
                        />
                    </div>
                    <span className="text-slate-400 text-xs px-1">s/d</span>
                    <div className="w-[140px] sm:w-[150px]">
                        <TransactionDateInput
                            value={endDate}
                            onChange={(val) => {
                                setEndDate(val);
                                onFiltersChange?.(prev => ({ ...prev, end_date: val }));
                            }}
                            className="h-[34px] rounded-[4px] border-slate-300"
                            inputClassName="text-xs sm:text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!excelRows ? (
                        <label className="inline-flex items-center justify-center gap-2 rounded-[4px] font-medium border border-slate-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50 active:scale-[0.98] h-[34px] px-3.5 text-xs cursor-pointer">
                            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>Unggah Rekening Koran</span>
                            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelUpload} />
                        </label>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleBulkReconcile}
                                disabled={summary.matched === 0}
                                className="inline-flex items-center justify-center gap-2 rounded-[4px] font-medium border border-transparent bg-brand-primary text-white shadow-sm hover:bg-brand-primary-hover active:scale-[0.98] h-[34px] px-3.5 text-xs cursor-pointer disabled:opacity-55 disabled:pointer-events-none"
                            >
                                Rekonsiliasi Massal ({summary.matched})
                            </button>
                            <button
                                type="button"
                                onClick={handleClearExcel}
                                className="inline-flex items-center justify-center gap-2 rounded-[4px] font-medium border border-slate-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50 active:scale-[0.98] h-[34px] px-3.5 text-xs cursor-pointer"
                            >
                                Bersihkan
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Clickable Summary Filter Cards */}
            {excelRows && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <button
                        type="button"
                        onClick={() => setStatusFilter(statusFilter === 'matched' ? null : 'matched')}
                        className={`text-left rounded-[6px] p-3.5 transition border shadow-sm cursor-pointer hover:translate-y-[-1px] ${
                            statusFilter === 'matched'
                                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-100'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <div className="text-[10px] font-bold text-slate-500">Cocok</div>
                        <div className="text-lg font-bold text-emerald-600 mt-1 flex items-center justify-between">
                            <span>{summary.matched}</span>
                            <span className="text-[10px] font-normal text-slate-400">Klik filter</span>
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter(statusFilter === 'discrepancy' ? null : 'discrepancy')}
                        className={`text-left rounded-[6px] p-3.5 transition border shadow-sm cursor-pointer hover:translate-y-[-1px] ${
                            statusFilter === 'discrepancy'
                                ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-100'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <div className="text-[10px] font-bold text-slate-500">Selisih Nominal</div>
                        <div className="text-xl font-bold text-amber-600 mt-1 flex items-center justify-between">
                            <span>{summary.discrepancy}</span>
                            <span className="text-[10px] font-normal text-slate-400">Klik filter</span>
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter(statusFilter === 'excel_only' ? null : 'excel_only')}
                        className={`text-left rounded-[6px] p-3.5 transition border shadow-sm cursor-pointer hover:translate-y-[-1px] ${
                            statusFilter === 'excel_only'
                                ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-100'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <div className="text-[10px] font-bold text-slate-500">Hanya di Excel</div>
                        <div className="text-xl font-bold text-sky-600 mt-1 flex items-center justify-between">
                            <span>{summary.excelOnly}</span>
                            <span className="text-[10px] font-normal text-slate-400">Klik filter</span>
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter(statusFilter === 'system_only' ? null : 'system_only')}
                        className={`text-left rounded-[6px] p-3.5 transition border shadow-sm cursor-pointer hover:translate-y-[-1px] ${
                            statusFilter === 'system_only'
                                ? 'bg-slate-50 border-slate-500 ring-2 ring-slate-100'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <div className="text-[10px] font-bold text-slate-500">Hanya di Sistem</div>
                        <div className="text-xl font-bold text-slate-600 mt-1 flex items-center justify-between">
                            <span>{summary.systemOnly}</span>
                            <span className="text-[10px] font-normal text-slate-400">Klik filter</span>
                        </div>
                    </button>
                </div>
            )}

            {/* Tabs selection (Only if excel loaded) */}
            {excelRows && (
                <div className="flex border-b border-slate-200 gap-4 mt-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('match')}
                        className={`pb-2 text-sm font-semibold border-b-2 transition cursor-pointer select-none ${activeTab === 'match' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Pencocokan Rekening Koran ({displayedMatchResults.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('excel')}
                        className={`pb-2 text-sm font-semibold border-b-2 transition cursor-pointer select-none ${activeTab === 'excel' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Isi Rekening Koran Excel ({excelRows.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('system')}
                        className={`pb-2 text-sm font-semibold border-b-2 transition cursor-pointer select-none ${activeTab === 'system' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Buku Besar Sistem ({rows.length})
                    </button>
                </div>
            )}

            {/* Main Data Table Wrapper utilizing template layout */}
            <div className="overflow-hidden rounded-[6px] border border-slate-200 bg-white shadow-sm flex flex-col flex-1 min-h-0">
                <div className="min-h-0 overflow-x-auto">
                    
                    {/* 1. Default View Table (Before excel upload) */}
                    {!excelRows && (
                        <>
                            <DataTable className="min-w-[1000px] border-0" wrapperClassName="rounded-none border-0">
                                <DataTableHeader className="bg-[#5f7690]">
                                    <tr>
                                        {defaultColumns.map((col) => (
                                            <SortableTableHeaderCell
                                                key={col.id}
                                                label={col.label}
                                                align={col.align}
                                                widthClassName={col.widthClassName}
                                                sortable={false}
                                            />
                                        ))}
                                    </tr>
                                </DataTableHeader>
                                <DataTableBody>
                                    {loading ? (
                                        <DataTableRow className="bg-white">
                                            <DataTableCell
                                                colSpan={defaultColumns.length}
                                                className="px-2.5 py-3 text-center text-base text-[#131a28]"
                                            >
                                                Memuat data...
                                            </DataTableCell>
                                        </DataTableRow>
                                    ) : rows.length > 0 ? (
                                        rows.map((row, index) => (
                                            <DataTableRow
                                                key={row.id || index}
                                                className={`border-slate-100 ${index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}
                                            >
                                                <DataTableCell className="text-left px-2.5 text-slate-700 font-normal">{row.date}</DataTableCell>
                                                <DataTableCell className="text-left px-2.5 font-mono font-normal text-slate-700">{row.document_number || row.sourceNumber}</DataTableCell>
                                                <DataTableCell className="text-left px-2.5 text-slate-700 font-normal">{row.transaction_type}</DataTableCell>
                                                <DataTableCell className="px-2.5 text-slate-700 font-normal">{row.description}</DataTableCell>
                                                <DataTableCell className="text-left px-2.5 text-emerald-600 font-normal">{row.debit && row.debit !== '0,00' && row.debit !== '0' ? formatCurrency(row.debit) : '-'}</DataTableCell>
                                                <DataTableCell className="text-left px-2.5 text-rose-600 font-normal">{row.credit && row.credit !== '0,00' && row.credit !== '0' ? formatCurrency(row.credit) : '-'}</DataTableCell>
                                                <DataTableCell className="text-left px-2.5">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-normal ${row.status === 'Reconciled' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                                        {row.status}
                                                    </span>
                                                </DataTableCell>
                                                <DataTableCell className="text-center px-2.5">
                                                    <Button
                                                        variant={row.status === 'Reconciled' ? 'secondary' : 'primary'}
                                                        size="sm"
                                                        className="h-7 text-xs font-medium"
                                                        loading={reconcilingIds[row.document_number || row.sourceNumber]}
                                                        onClick={() => handleReconcileSingle(row.document_number || row.sourceNumber, row.status !== 'Reconciled')}
                                                    >
                                                        {row.status === 'Reconciled' ? 'Buka' : 'Cocokkan'}
                                                    </Button>
                                                </DataTableCell>
                                            </DataTableRow>
                                        ))
                                    ) : (
                                        <DataTableRow className="bg-white">
                                            <DataTableCell
                                                colSpan={defaultColumns.length}
                                                className="px-2.5 py-3 text-center text-base text-[#131a28]"
                                            >
                                                Belum ada data transaksi. Unggah file rekening koran untuk mencocokkan.
                                            </DataTableCell>
                                        </DataTableRow>
                                    )}
                                </DataTableBody>
                            </DataTable>
                            {rows.length === 0 && (
                                <div className="border-t border-[#edf1f6] bg-white min-h-[280px] sm:min-h-[360px] xl:min-h-[60vh]" />
                            )}
                        </>
                    )}

                    {/* 2. MATCH Tab Table */}
                    {excelRows && activeTab === 'match' && (
                        <>
                            <DataTable className="min-w-[1200px] border-0" wrapperClassName="rounded-none border-0">
                            <DataTableHeader className="bg-[#5f7690]">
                                <tr>
                                    {matchColumns.map((col) => (
                                        <SortableTableHeaderCell
                                            key={col.id}
                                            label={col.label}
                                            align={col.align}
                                            widthClassName={col.widthClassName}
                                            sortable={false}
                                        />
                                    ))}
                                </tr>
                            </DataTableHeader>
                            <DataTableBody>
                                {displayedMatchResults.length > 0 ? (
                                    displayedMatchResults.map((match, index) => {
                                        const isReconciled = match.system?.status === 'Reconciled';
                                        const docNum = match.system?.document_number || match.system?.sourceNumber;

                                        return (
                                            <DataTableRow
                                                key={match.id || index}
                                                className={`border-slate-100 align-top ${index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}
                                            >
                                                {/* Excel Cell */}
                                                <DataTableCell className="p-3">
                                                    {match.excel ? (
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-normal text-slate-500">{match.excel.date}</span>
                                                                <span className={`inline-flex px-1.5 py-0.2 rounded text-[10px] font-normal ${match.excel.type === 'DB' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                                    {match.excel.type === 'DB' ? 'Debit (Out)' : 'Credit (In)'}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs font-normal text-slate-700 truncate max-w-[320px]" title={match.excel.description}>
                                                                {match.excel.description}
                                                            </div>
                                                            <div className="text-sm font-bold text-slate-900">
                                                                {formatCurrency(match.excel.amount)}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs italic text-slate-400">Tidak tertera di Rekening Koran</span>
                                                    )}
                                                </DataTableCell>

                                                {/* Status Cell */}
                                                <DataTableCell className="p-3 text-center">
                                                    <div className="flex flex-col items-center justify-center space-y-1">
                                                        {match.status === 'matched' && (
                                                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-normal bg-emerald-100 text-emerald-800 border border-emerald-200">✓ Cocok</span>
                                                        )}
                                                        {match.status === 'discrepancy' && (
                                                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-normal bg-amber-100 text-amber-800 border border-amber-200">⚠ Selisih</span>
                                                        )}
                                                        {match.status === 'excel_only' && (
                                                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-normal bg-sky-100 text-sky-800 border border-sky-200">Hanya Excel</span>
                                                        )}
                                                        {match.status === 'system_only' && (
                                                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-normal bg-slate-100 text-slate-800 border border-slate-200">Hanya Sistem</span>
                                                        )}
                                                        <span className="text-[10px] text-slate-400 block text-center max-w-[130px] leading-tight font-normal">{match.reason}</span>
                                                    </div>
                                                </DataTableCell>

                                                {/* System Cell */}
                                                <DataTableCell className="p-3">
                                                    {match.system ? (
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-mono font-normal text-slate-700">{docNum}</span>
                                                                <span className="text-[10px] text-slate-400">{match.system.date}</span>
                                                                <span className={`inline-flex px-1.5 py-0.2 rounded text-[10px] font-normal ${isReconciled ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                                                    {match.system.status}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-slate-500 truncate max-w-[350px]">
                                                                [{match.system.transaction_type}] {match.system.description}
                                                            </div>
                                                            <div className="text-sm font-bold text-slate-800">
                                                                {match.system.type === 'Debit' ? formatCurrency(match.system.debit) : formatCurrency(match.system.credit)}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs italic text-slate-400">Transaksi belum dicatat di POS/ERP</span>
                                                    )}
                                                </DataTableCell>

                                                {/* Action Cell */}
                                                <DataTableCell className="p-3 text-center">
                                                    {match.system && (match.status === 'matched' || match.status === 'discrepancy') ? (
                                                        <Button
                                                            variant={isReconciled ? 'secondary' : 'primary'}
                                                            size="sm"
                                                            className="h-7 text-xs font-medium px-3 rounded-[4px]"
                                                            loading={reconcilingIds[docNum]}
                                                            onClick={() => handleReconcileSingle(docNum, !isReconciled)}
                                                        >
                                                            {isReconciled ? 'Buka Rekon' : 'Cocokkan'}
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">-</span>
                                                    )}
                                                </DataTableCell>
                                            </DataTableRow>
                                        );
                                    })
                                ) : (
                                    <DataTableRow className="bg-white">
                                        <DataTableCell
                                            colSpan={matchColumns.length}
                                            className="px-2.5 py-3 text-center text-base text-[#131a28]"
                                        >
                                            Tidak ada baris data dengan filter status ini.
                                        </DataTableCell>
                                    </DataTableRow>
                                )}
                            </DataTableBody>
                        </DataTable>
                        {displayedMatchResults.length === 0 && (
                            <div className="border-t border-[#edf1f6] bg-white min-h-[280px] sm:min-h-[360px] xl:min-h-[60vh]" />
                        )}
                    </>
                )}

                    {/* 3. EXCEL RAW Tab Table */}
                    {excelRows && activeTab === 'excel' && (
                        <>
                            <DataTable className="w-full border-0" wrapperClassName="rounded-none border-0">
                                <DataTableHeader className="bg-[#5f7690]">
                                    <tr>
                                        {excelColumns.map((col) => (
                                            <SortableTableHeaderCell
                                                key={col.id}
                                                label={col.label}
                                                align={col.align}
                                                widthClassName={col.widthClassName}
                                                sortable={false}
                                            />
                                        ))}
                                    </tr>
                                </DataTableHeader>
                                <DataTableBody>
                                    {excelRows.length > 0 ? (
                                        excelRows.map((row, index) => (
                                            <DataTableRow
                                                key={row.id}
                                                className={`border-slate-100 ${index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}
                                            >
                                                <DataTableCell className="text-left px-2.5 text-slate-700 font-normal">{row.date}</DataTableCell>
                                                <DataTableCell className="px-2.5 text-slate-700 font-normal">{row.description}</DataTableCell>
                                                <DataTableCell className="text-left px-2.5 font-bold text-slate-900">{formatCurrency(row.amount)}</DataTableCell>
                                                <DataTableCell className="text-center px-2.5">
                                                    <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-normal ${row.type === 'DB' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                                        {row.type === 'DB' ? 'Debit' : 'Kredit'}
                                                    </span>
                                                </DataTableCell>
                                            </DataTableRow>
                                        ))
                                    ) : (
                                        <DataTableRow className="bg-white">
                                            <DataTableCell
                                                colSpan={excelColumns.length}
                                                className="px-2.5 py-3 text-center text-base text-[#131a28]"
                                            >
                                                Belum ada data.
                                            </DataTableCell>
                                        </DataTableRow>
                                    )}
                                </DataTableBody>
                            </DataTable>
                            {excelRows.length === 0 && (
                                <div className="border-t border-[#edf1f6] bg-white min-h-[280px] sm:min-h-[360px] xl:min-h-[60vh]" />
                            )}
                        </>
                    )}

                    {/* 4. SYSTEM RAW Tab Table */}
                    {excelRows && activeTab === 'system' && (
                        <>
                            <DataTable className="w-full border-0" wrapperClassName="rounded-none border-0">
                                <DataTableHeader className="bg-[#5f7690]">
                                    <tr>
                                        {systemColumns.map((col) => (
                                            <SortableTableHeaderCell
                                                key={col.id}
                                                label={col.label}
                                                align={col.align}
                                                widthClassName={col.widthClassName}
                                                sortable={false}
                                            />
                                        ))}
                                    </tr>
                                </DataTableHeader>
                                <DataTableBody>
                                    {rows.length > 0 ? (
                                        rows.map((row, index) => (
                                            <DataTableRow
                                                key={row.id || index}
                                                className={`border-slate-100 ${index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}
                                            >
                                                <DataTableCell className="text-left px-2.5 text-slate-700 font-normal">{row.date}</DataTableCell>
                                                <DataTableCell className="text-left px-2.5 font-mono font-normal text-slate-700">{row.document_number || row.sourceNumber}</DataTableCell>
                                                <DataTableCell className="px-2.5 text-slate-700 font-normal">[{row.transaction_type}] {row.description}</DataTableCell>
                                                <DataTableCell className="text-left px-2.5 text-emerald-600 font-normal">{row.debit && row.debit !== '0,00' ? formatCurrency(row.debit) : '-'}</DataTableCell>
                                                <DataTableCell className="text-left px-2.5 text-rose-600 font-normal">{row.credit && row.credit !== '0,00' ? formatCurrency(row.credit) : '-'}</DataTableCell>
                                                <DataTableCell className="text-center px-2.5">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-normal ${row.status === 'Reconciled' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                                        {row.status}
                                                    </span>
                                                </DataTableCell>
                                            </DataTableRow>
                                        ))
                                    ) : (
                                        <DataTableRow className="bg-white">
                                            <DataTableCell
                                                colSpan={systemColumns.length}
                                                className="px-2.5 py-3 text-center text-base text-[#131a28]"
                                            >
                                                Belum ada data.
                                            </DataTableCell>
                                        </DataTableRow>
                                    )}
                                </DataTableBody>
                            </DataTable>
                            {rows.length === 0 && (
                                <div className="border-t border-[#edf1f6] bg-white min-h-[280px] sm:min-h-[360px] xl:min-h-[60vh]" />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
