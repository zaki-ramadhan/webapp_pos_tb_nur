import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/ui/Button';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { buildTodayDisplayDate, buildFirstDayOfMonthDisplayDate } from '@/features/workspace/shared/dateDefaults';
import { importFromFile } from '@/features/workspace/shared/exportUtils';

export default function BankReconciliationView({ page, onOpenContent }) {
    const today = buildTodayDisplayDate();
    const firstDayOfMonth = buildFirstDayOfMonthDisplayDate();

    const [filters, setFilters] = useState({
        search: 'Bank BRI',
        startDate: firstDayOfMonth,
        endDate: today,
    });

    const queryFilters = useMemo(() => ({
        search: filters.search,
        start_date: normalizeDisplayDate(filters.startDate),
        end_date: normalizeDisplayDate(filters.endDate),
        per_page: 100,
    }), [filters]);

    // Internal Transactions (Jurnal Accurate)
    const {
        rows: accurateDocs,
        total: totalDocs,
        loading: loadingAccurate,
        reload: reloadAccurate,
    } = useBackendIndexResource({
        resource: 'bank-reconciliations',
        filters: queryFilters,
        initialPerPage: 100,
    });

    // CSV Mutasi Bank State
    const [csvRows, setCsvRows] = useState([]);
    const [csvFileName, setCsvFileName] = useState('');
    const [selectedDocNumbers, setSelectedDocNumbers] = useState(new Set());
    const [isReconciling, setIsReconciling] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'matched' | 'unmatched' | 'reconciled'
    const fileInputRef = useRef(null);

    // Auto sample mutasi generator for BRIMO
    const loadSampleBrimoCsv = () => {
        const sampleCsv = `Tanggal,Keterangan,Tipe,Nominal,Saldo
${new Date().toLocaleDateString('id-ID')},TRSF BRIMO CR PEMBAYARAN FAKTUR TB NUR,CR,3500000,181112000
${new Date().toLocaleDateString('id-ID')},SETOR TUNAI PENJUALAN KASIR TOKO,CR,1250000,177612000
${new Date().toLocaleDateString('id-ID')},TRSF BRIMO DB PEMBELIAN SEMEN GRESIK,DB,8500000,176362000
${new Date().toLocaleDateString('id-ID')},BIAYA ADM REK BRI BULANAN,DB,12000,184862000`;

        parseAndLoadCsv(sampleCsv, 'mutasi_brimo_sample.csv');
        toast.success('Contoh mutasi CSV BRI Mobile (BRIMO) berhasil dimuat!');
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const { headers, rows } = await importFromFile(file);
            if (!rows || rows.length === 0) {
                toast.error('File tidak memiliki data mutasi.');
                return;
            }

            processImportedRows(headers, rows, file.name);
            toast.success(`File ${file.name} (${rows.length} baris mutasi) berhasil dimuat!`);
        } catch (err) {
            toast.error('Gagal membaca file. Pastikan format file .csv atau .xlsx.');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const processImportedRows = (headers, rawRows, fileName) => {
        const lowerHeaders = headers.map(h => String(h).trim().toLowerCase());
        const mapped = rawRows.map((row, idx) => {
            let date = '';
            let desc = '';
            let type = 'CR';
            let amount = 0;
            let balance = 0;

            headers.forEach((h, colIdx) => {
                const key = lowerHeaders[colIdx];
                const val = String(row[h] ?? '').trim();

                if (key.includes('tgl') || key.includes('date') || key.includes('tanggal')) date = val;
                else if (key.includes('ket') || key.includes('desc') || key.includes('uraian')) desc = val;
                else if (key.includes('tipe') || key.includes('type')) type = val.toUpperCase().includes('D') ? 'DB' : 'CR';
                else if (key.includes('nom') || key.includes('mutasi') || key.includes('amount') || key.includes('debet') || key.includes('kredit')) {
                    const num = parseFloat(val.replace(/[^\d.-]/g, '')) || 0;
                    if (num > 0) amount = num;
                } else if (key.includes('saldo') || key.includes('balance')) {
                    balance = parseFloat(val.replace(/[^\d.-]/g, '')) || 0;
                }
            });

            if (!desc && Object.values(row)[1]) desc = String(Object.values(row)[1]);
            if (!date && Object.values(row)[0]) date = String(Object.values(row)[0]);
            if (amount === 0 && Object.values(row)[3]) {
                amount = parseFloat(String(Object.values(row)[3]).replace(/[^\d.-]/g, '')) || 0;
            }

            return {
                id: `csv-${idx + 1}`,
                date,
                description: desc,
                type,
                amount,
                balance,
            };
        });

        setCsvRows(mapped);
        setCsvFileName(fileName);
    };

    const parseAndLoadCsv = (text, fileName) => {
        const lines = text.trim().split(/\r?\n/).filter(Boolean);
        if (lines.length < 2) return;
        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1).map(line => {
            const parts = line.split(',');
            const obj = {};
            headers.forEach((h, i) => {
                obj[h] = parts[i]?.trim() ?? '';
            });
            return obj;
        });
        processImportedRows(headers, rows, fileName);
    };

    // Calculate match status between Accurate documents and Bank CSV mutations
    const comparisonResults = useMemo(() => {
        const docList = accurateDocs.map(doc => {
            const debitNum = parseFloat(String(doc.debit || 0).replace(/[^\d.-]/g, '')) || 0;
            const creditNum = parseFloat(String(doc.credit || 0).replace(/[^\d.-]/g, '')) || 0;
            const docAmount = Math.max(debitNum, creditNum);
            const isDebit = debitNum > 0;

            // Find matching mutation in CSV
            const matchedCsv = csvRows.find(csv => {
                // Match by amount with tolerance of Rp 0
                return Math.abs(csv.amount - docAmount) < 1;
            });

            const isReconciled = doc.status === 'Reconciled' || doc.is_closed;

            return {
                ...doc,
                numericAmount: docAmount,
                isDebit,
                isReconciled,
                matchedCsv,
                matchStatus: isReconciled ? 'Terekonsiliasi' : (matchedCsv ? 'Cocok' : 'Belum Cocok'),
            };
        });

        return docList;
    }, [accurateDocs, csvRows]);

    // Filtered by active tab
    const displayedDocs = useMemo(() => {
        if (activeTab === 'matched') {
            return comparisonResults.filter(d => d.matchStatus === 'Cocok');
        }
        if (activeTab === 'unmatched') {
            return comparisonResults.filter(d => d.matchStatus === 'Belum Cocok');
        }
        if (activeTab === 'reconciled') {
            return comparisonResults.filter(d => d.isReconciled);
        }
        return comparisonResults;
    }, [comparisonResults, activeTab]);

    // Handle selection
    const toggleSelectDoc = (docNumber) => {
        setSelectedDocNumbers(prev => {
            const next = new Set(prev);
            if (next.has(docNumber)) next.delete(docNumber);
            else next.add(docNumber);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedDocNumbers.size === displayedDocs.length) {
            setSelectedDocNumbers(new Set());
        } else {
            setSelectedDocNumbers(new Set(displayedDocs.map(d => d.document_number).filter(Boolean)));
        }
    };

    // Auto match and select matched docs
    const handleAutoMatchAndSelect = () => {
        if (csvRows.length === 0) {
            toast.info('Silakan unggah file CSV mutasi bank terlebih dahulu.');
            return;
        }

        const matchedNumbers = new Set();
        comparisonResults.forEach(doc => {
            if (doc.matchedCsv && !doc.isReconciled && doc.document_number) {
                matchedNumbers.add(doc.document_number);
            }
        });

        setSelectedDocNumbers(matchedNumbers);
        toast.success(`Ditemukan ${matchedNumbers.size} transaksi yang cocok dengan mutasi CSV!`);
    };

    // Execute Reconcile
    const handleProcessReconcile = async (isClosed = true) => {
        const docNumbers = Array.from(selectedDocNumbers);
        if (docNumbers.length === 0) {
            toast.error('Pilih minimal satu transaksi untuk diproses.');
            return;
        }

        setIsReconciling(true);
        try {
            const response = await fetch('/backend/bank-reconciliations/reconcile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    document_numbers: docNumbers,
                    is_closed: isClosed,
                }),
            });

            if (response.ok) {
                const res = await response.json();
                toast.success(res.message || 'Status rekonsiliasi berhasil diperbarui.');
                setSelectedDocNumbers(new Set());
                reloadAccurate();
            } else {
                toast.error('Gagal memperbarui status rekonsiliasi di server.');
            }
        } catch (err) {
            toast.error('Terjadi kesalahan jaringan.');
        } finally {
            setIsReconciling(false);
        }
    };

    // Stats
    const stats = useMemo(() => {
        const total = comparisonResults.length;
        const matched = comparisonResults.filter(d => d.matchStatus === 'Cocok').length;
        const reconciled = comparisonResults.filter(d => d.isReconciled).length;
        const unmatched = comparisonResults.filter(d => d.matchStatus === 'Belum Cocok').length;
        return { total, matched, reconciled, unmatched };
    }, [comparisonResults]);

    return (
        <div className="flex h-full flex-col bg-tab-active-bg overflow-hidden">
            {/* Top Toolbar Header */}
            <div className="border-b border-ui-border bg-white p-4 shadow-xs">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg font-bold text-slate-800">
                                Rekonsiliasi Bank (Jurnal Accurate vs Mutasi CSV Bank)
                            </h2>
                            <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
                                SmartLink BRIMO
                            </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Mencocokkan file mutasi bank (CSV) dengan transaksi internal kas/bank TB Nur untuk memverifikasi keakuratan saldo.
                        </p>
                    </div>

                    {/* Quick Stats Banner */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                            <span className="text-slate-500">Jurnal Internal:</span>{' '}
                            <span className="font-bold text-slate-800">{stats.total} Dok</span>
                        </div>
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5">
                            <span className="text-emerald-700">Cocok Mutasi:</span>{' '}
                            <span className="font-bold text-emerald-800">{stats.matched} Dok</span>
                        </div>
                        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5">
                            <span className="text-blue-700">Terekonsiliasi:</span>{' '}
                            <span className="font-bold text-blue-800">{stats.reconciled} Dok</span>
                        </div>
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5">
                            <span className="text-amber-700">Belum Cocok:</span>{' '}
                            <span className="font-bold text-amber-800">{stats.unmatched} Dok</span>
                        </div>
                    </div>
                </div>

                {/* Filter Controls & CSV Upload Bar */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5">
                            <label className="text-xs font-semibold text-slate-600">Akun Bank:</label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                placeholder="Bank BRI"
                                className="h-8 rounded border border-ui-border bg-white px-2 text-xs font-semibold text-slate-800 w-[140px]"
                            />
                        </div>

                        <div className="flex items-center gap-1">
                            <input
                                type="text"
                                value={filters.startDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                placeholder="DD/MM/YYYY"
                                className="h-8 rounded border border-ui-border bg-white px-2 text-xs text-slate-700 w-[110px]"
                            />
                            <span className="text-xs text-slate-400">s/d</span>
                            <input
                                type="text"
                                value={filters.endDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                placeholder="DD/MM/YYYY"
                                className="h-8 rounded border border-ui-border bg-white px-2 text-xs text-slate-700 w-[110px]"
                            />
                        </div>

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={reloadAccurate}
                            disabled={loadingAccurate}
                        >
                            {loadingAccurate ? 'Memuat...' : 'Muat Transaksi'}
                        </Button>
                    </div>

                    {/* CSV Upload & Match Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".csv"
                            className="hidden"
                        />

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            {csvFileName ? `Ganti CSV (${csvFileName})` : 'Impor CSV Mutasi Bank'}
                        </Button>

                        <button
                            type="button"
                            onClick={loadSampleBrimoCsv}
                            className="text-xs text-brand-blue hover:underline cursor-pointer px-1 py-1"
                        >
                            Gunakan Contoh CSV BRIMO
                        </button>

                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleAutoMatchAndSelect}
                        >
                            Cocokkan Otomatis
                        </Button>
                    </div>
                </div>
            </div>

            {/* Reconciliation Action Bar (Shown when items are selected) */}
            {selectedDocNumbers.size > 0 && (
                <div className="bg-blue-600 px-4 py-2 text-white flex items-center justify-between text-xs shadow-sm">
                    <span className="font-semibold">
                        {selectedDocNumbers.size} transaksi dipilih
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleProcessReconcile(true)}
                            disabled={isReconciling}
                            className="rounded bg-white px-3 py-1 font-bold text-blue-700 hover:bg-blue-50 transition cursor-pointer disabled:opacity-50"
                        >
                            {isReconciling ? 'Memproses...' : 'Tandai Terekonsiliasi'}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleProcessReconcile(false)}
                            disabled={isReconciling}
                            className="rounded bg-blue-700 px-3 py-1 font-semibold text-white hover:bg-blue-800 transition cursor-pointer"
                        >
                            Buka Rekonsiliasi (Open)
                        </button>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex border-b border-ui-border bg-white px-4">
                <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`border-b-2 px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                        activeTab === 'all' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Semua Transaksi ({stats.total})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('matched')}
                    className={`border-b-2 px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                        activeTab === 'matched' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Cocok dengan CSV ({stats.matched})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('reconciled')}
                    className={`border-b-2 px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                        activeTab === 'reconciled' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Terekonsiliasi ({stats.reconciled})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('unmatched')}
                    className={`border-b-2 px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                        activeTab === 'unmatched' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Belum Cocok ({stats.unmatched})
                </button>
            </div>

            {/* Split Comparison Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    {/* Left/Main Column: Transaksi Aplikasi (Jurnal Accurate) */}
                    <div className={csvRows.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'}>
                        <div className="rounded-xl border border-ui-border bg-white shadow-xs overflow-hidden">
                            <div className="border-b border-ui-border bg-slate-50 px-4 py-2.5 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Transaksi Jurnal Accurate (Internal)
                                </span>
                                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={displayedDocs.length > 0 && selectedDocNumbers.size === displayedDocs.length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-slate-300 text-blue-600"
                                    />
                                    Pilih Semua
                                </label>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-ui-border bg-slate-100 text-slate-600 font-semibold">
                                        <tr>
                                            <th className="w-8 px-3 py-2.5 text-center">#</th>
                                            <th className="w-24 px-3 py-2.5">Tanggal</th>
                                            <th className="w-32 px-3 py-2.5">No. Bukti</th>
                                            <th className="w-32 px-3 py-2.5">Tipe</th>
                                            <th className="min-w-[200px] px-3 py-2.5">Keterangan</th>
                                            <th className="w-28 px-3 py-2.5 text-right">Debit</th>
                                            <th className="w-28 px-3 py-2.5 text-right">Kredit</th>
                                            <th className="w-28 px-3 py-2.5 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-ui-border">
                                        {loadingAccurate ? (
                                            <tr>
                                                <td colSpan={8} className="py-8 text-center text-slate-400">
                                                    Memuat transaksi jurnal...
                                                </td>
                                            </tr>
                                        ) : displayedDocs.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="py-8 text-center text-slate-400">
                                                    Tidak ada transaksi yang cocok dengan filter saat ini.
                                                </td>
                                            </tr>
                                        ) : (
                                            displayedDocs.map((doc) => {
                                                const isSelected = selectedDocNumbers.has(doc.document_number);
                                                return (
                                                    <tr
                                                        key={doc.id}
                                                        className={`hover:bg-slate-50 transition cursor-pointer ${
                                                            isSelected ? 'bg-blue-50/60' : ''
                                                        }`}
                                                        onClick={() => toggleSelectDoc(doc.document_number)}
                                                    >
                                                        <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleSelectDoc(doc.document_number)}
                                                                className="rounded border-slate-300 text-blue-600"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">
                                                            {doc.date}
                                                        </td>
                                                        <td className="px-3 py-2 font-mono text-slate-800 whitespace-nowrap">
                                                            {doc.document_number || '-'}
                                                        </td>
                                                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                                                            {doc.transaction_type}
                                                        </td>
                                                        <td className="px-3 py-2 text-slate-600 truncate max-w-[220px]">
                                                            {doc.description || '-'}
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-medium text-emerald-700 whitespace-nowrap">
                                                            {doc.debit && doc.debit !== '0' ? `Rp ${doc.debit}` : '-'}
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-medium text-rose-700 whitespace-nowrap">
                                                            {doc.credit && doc.credit !== '0' ? `Rp ${doc.credit}` : '-'}
                                                        </td>
                                                        <td className="px-3 py-2 text-center whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                                                                    doc.isReconciled
                                                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                        : doc.matchStatus === 'Cocok'
                                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                                                }`}
                                                            >
                                                                {doc.matchStatus}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Mutasi Bank CSV Panel */}
                    {csvRows.length > 0 && (
                        <div className="lg:col-span-4 space-y-3">
                            <div className="rounded-xl border border-ui-border bg-white shadow-xs overflow-hidden">
                                <div className="border-b border-ui-border bg-emerald-50 px-4 py-2.5 flex items-center justify-between">
                                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                                        Mutasi Bank ({csvRows.length} Baris)
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCsvRows([]);
                                            setCsvFileName('');
                                        }}
                                        className="text-[11px] text-slate-500 hover:text-red-600"
                                    >
                                        Tutup CSV
                                    </button>
                                </div>

                                <div className="max-h-[520px] overflow-y-auto divide-y divide-ui-border">
                                    {csvRows.map((row) => (
                                        <div key={row.id} className="p-3 hover:bg-slate-50 text-xs space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-slate-700">{row.date}</span>
                                                <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                                                    row.type === 'CR' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                }`}>
                                                    {row.type} Rp {row.amount.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 line-clamp-2 leading-relaxed">
                                                {row.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
