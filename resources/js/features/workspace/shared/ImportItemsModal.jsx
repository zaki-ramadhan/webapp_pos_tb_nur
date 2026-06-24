import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

import ModalBase from '@/components/ui/ModalBase';
import { CloseIcon, TableActionIcon } from '@/features/workspace/shared/Icons';
import { importFromFile } from '@/features/workspace/shared/exportUtils';

// Modular Imports
import { DEFAULT_COLUMN_MAPPING, autoDetectMapping } from './importMappingConstants';
import ColumnMappingSelect from './ImportColumnMappingSelect';

export default function ImportItemsModal({ open, onClose, onImport, mode = 'sales' }) {
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [csvRows, setCsvRows] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [columnMapping, setColumnMapping] = useState({ ...DEFAULT_COLUMN_MAPPING });
    const [errorMessage, setErrorMessage] = useState('');

    // Ambil katalog produk
    useEffect(() => {
        if (!open) return;
        setLoadingProducts(true);
        axios.get('/api/backend/products', { params: { per_page: 1000 } })
            .then(response => {
                const data = response.data?.data ?? response.data ?? [];
                setProducts(Array.isArray(data) ? data : []);
            })
            .catch(() => setErrorMessage('Gagal memuat katalog barang dari server.'))
            .finally(() => setLoadingProducts(false));
    }, [open]);

    // Reset saat tutup
    useEffect(() => {
        if (!open) {
            setFile(null);
            setCsvHeaders([]);
            setCsvRows([]);
            setColumnMapping({ ...DEFAULT_COLUMN_MAPPING });
            setErrorMessage('');
        }
    }, [open]);

    // Upload file via SheetJS
    async function handleFileChange(e) {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setErrorMessage('');
        try {
            const { headers, rows } = await importFromFile(selectedFile);

            if (rows.length === 0) {
                setErrorMessage('File tidak memiliki data yang cukup.');
                return;
            }

            setFile(selectedFile);
            setCsvHeaders(headers);
            // Konversi baris ke array
            setCsvRows(rows.map(row => headers.map(h => row[h] ?? '')));
            setColumnMapping(autoDetectMapping(headers));
        } catch {
            setErrorMessage('Gagal membaca file. Pastikan format file .xlsx, .xls, atau .csv.');
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    // Sesuaikan item impor
    const previewItems = useMemo(() => {
        if (csvRows.length === 0 || columnMapping.code === -1 || columnMapping.quantity === -1) return [];

        return csvRows.map((row, idx) => {
            const rawCode = String(row[columnMapping.code] ?? '').trim();
            const rawQty = String(row[columnMapping.quantity] ?? '').trim();
            const rawPrice = columnMapping.price !== -1 ? String(row[columnMapping.price] ?? '').trim() : '';
            const rawNotes = columnMapping.notes !== -1 ? String(row[columnMapping.notes] ?? '').trim() : '';

            const parsedQty = parseFloat(rawQty.replace(/[^\d.-]/g, '')) || 0;
            const parsedPrice = parseFloat(rawPrice.replace(/[^\d.-]/g, '')) || 0;

            const matched = products.find(
                p => String(p.code).toLowerCase() === rawCode.toLowerCase()
                    || String(p.barcode).toLowerCase() === rawCode.toLowerCase(),
            );

            const defaultPrice = parseFloat(mode === 'sales' ? matched?.default_sale_price : matched?.default_purchase_price) || 0;

            return {
                id: `import-${idx}-${Date.now()}`,
                __productId: matched?.id ?? null,
                __unitId: matched?.base_unit_id ?? matched?.sales_unit_id ?? null,
                name: matched?.name ?? `Barang tidak ditemukan (${rawCode})`,
                code: matched?.code ?? rawCode,
                quantity: String(parsedQty),
                unit: matched?.base_unit?.name ?? matched?.sales_unit?.name ?? 'PCS',
                price: matched ? (parsedPrice || defaultPrice) : 0,
                notes: rawNotes,
                valid: !!matched && parsedQty > 0,
                rawCode,
                rawQty,
            };
        });
    }, [csvRows, columnMapping, products, mode]);

    const validCount = previewItems.filter(item => item.valid).length;

    function handleConfirmImport() {
        const importable = previewItems
            .filter(item => item.valid)
            .map(item => {
                const qty = parseFloat(item.quantity) || 1;
                const unitPrice = parseFloat(item.price) || 0;
                return {
                    id: item.id,
                    __productId: item.__productId,
                    __unitId: item.__unitId,
                    name: item.name,
                    code: item.code,
                    quantity: String(qty),
                    unit: item.unit,
                    price: unitPrice.toLocaleString('id-ID'),
                    discount: '0',
                    discountValue: '0',
                    total: (qty * unitPrice).toLocaleString('id-ID'),
                    requestDate: new Date().toLocaleDateString('id-ID'),
                    notes: item.notes,
                };
            });

        if (importable.length === 0) {
            setErrorMessage('Tidak ada data valid yang bisa diimpor.');
            return;
        }

        onImport(importable);
        onClose();
    }

    return (
        <ModalBase
            open={open}
            onBackdropClick={onClose}
            className="bg-modal-overlay-dark z-[9999]"
            panelClassName="max-w-[820px] w-full overflow-hidden rounded-[8px] px-0 py-0 shadow-modal-import"
        >
            <div className="bg-blue-900 px-5 py-2.5 text-white">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <TableActionIcon className="h-4 w-4 text-white" />
                        <h2 className="text-sm font-medium">Ekstraksi File CSV / Excel</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-[4px] text-white transition hover:bg-white/10 cursor-pointer"
                    >
                        <CloseIcon className="h-4 w-4 text-white" />
                    </button>
                </div>
            </div>

            <div className="bg-white p-6">
                {errorMessage && (
                    <div className="mb-4 rounded-[4px] bg-danger-border border border-red-150 p-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                {!file ? (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-ui-border rounded-[6px] p-8 bg-slate-50 hover:bg-slate-100 transition">
                        <TableActionIcon className="h-12 w-12 text-text-light mb-3" />
                        <p className="text-base font-medium text-slate-700 mb-1">Pilih File</p>
                        <p className="text-sm text-slate-500 mb-4 text-center">
                            Mendukung format Excel (.xlsx, .xls) dan CSV (.csv)
                        </p>
                        <label className="inline-flex h-[38px] cursor-pointer items-center justify-center rounded-[4px] bg-import-action-blue px-5 text-xs sm:text-sm font-medium text-white hover:bg-blue-900 transition">
                            Cari File
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-[4px] border border-slate-200 bg-slate-50 px-4 py-3">
                            <span className="text-sm font-medium text-slate-700">{file.name}</span>
                            <button
                                type="button"
                                onClick={() => setFile(null)}
                                className="text-sm font-semibold text-red-350 hover:text-red-800"
                            >
                                Ganti File
                            </button>
                        </div>

                        <div>
                            <h3 className="text-base font-semibold text-slate-800 mb-3 border-b pb-2">
                                Sesuaikan Pemetaan Kolom
                            </h3>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                <ColumnMappingSelect label="Kode Barang / Barcode *" fieldKey="code" mapping={columnMapping} setMapping={setColumnMapping} csvHeaders={csvHeaders} />
                                <ColumnMappingSelect label="Kuantitas *" fieldKey="quantity" mapping={columnMapping} setMapping={setColumnMapping} csvHeaders={csvHeaders} />
                                <ColumnMappingSelect label="Harga Satuan" fieldKey="price" mapping={columnMapping} setMapping={setColumnMapping} csvHeaders={csvHeaders} defaultLabel="-- Gunakan Harga Default --" />
                                <ColumnMappingSelect label="Catatan / Keterangan" fieldKey="notes" mapping={columnMapping} setMapping={setColumnMapping} csvHeaders={csvHeaders} defaultLabel="-- Kosongkan --" />
                            </div>
                        </div>

                        {columnMapping.code !== -1 && columnMapping.quantity !== -1 && (
                            <div>
                                <div className="flex items-center justify-between border-b pb-2 mb-3">
                                    <h3 className="text-base font-semibold text-slate-800">
                                        Preview Pencocokan Barang ({validCount} valid dari {previewItems.length} baris)
                                    </h3>
                                    {loadingProducts && <span className="text-sm text-slate-500">Mencocokkan...</span>}
                                </div>
                                <div className="max-h-[240px] overflow-y-auto border border-slate-200 rounded-[4px]">
                                    <table className="w-full border-collapse text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-700 sticky top-0 border-b border-slate-200">
                                            <tr>
                                                <th className="px-3 py-2 font-semibold text-center">Kode Input</th>
                                                <th className="px-3 py-2 font-semibold text-center">Hasil Pencocokan</th>
                                                <th className="px-3 py-2 font-semibold text-center">Qty</th>
                                                {columnMapping.price !== -1 && <th className="px-3 py-2 font-semibold text-center">Harga</th>}
                                                <th className="px-3 py-2 font-semibold text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {previewItems.map((item, idx) => (
                                                <tr key={idx} className={item.valid ? 'hover:bg-slate-50' : 'bg-danger-border/50'}>
                                                    <td className="px-3 py-2 font-mono text-slate-600">{item.rawCode}</td>
                                                    <td className="px-3 py-2">
                                                        <div className="font-medium text-slate-800">{item.name}</div>
                                                        {item.valid && (
                                                            <div className="text-xs text-slate-500">
                                                                Kode Sistem: {item.code} | Unit: {item.unit}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-left font-mono">{item.rawQty}</td>
                                                    {columnMapping.price !== -1 && (
                                                        <td className="px-3 py-2 text-left font-mono">
                                                            {item.price ? `Rp ${Number(item.price).toLocaleString('id-ID')}` : '-'}
                                                        </td>
                                                    )}
                                                    <td className="px-3 py-2 text-center">
                                                        {item.valid ? (
                                                            <span className="inline-flex items-center rounded-full bg-success-bg px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Valid</span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-full bg-danger-border px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-350/20">Tidak Ditemukan</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 mt-6 pt-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-8 items-center justify-center rounded-[4px] border border-slate-300 bg-white px-4 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                        Batal
                    </button>
                    {file && (
                        <button
                            type="button"
                            onClick={handleConfirmImport}
                            disabled={validCount === 0}
                            className={`inline-flex h-8 items-center justify-center rounded-[4px] px-4 text-xs font-medium text-white transition ${
                                validCount > 0 ? 'bg-import-action-blue hover:bg-blue-900 cursor-pointer' : 'bg-slate-300 cursor-not-allowed'
                            }`}
                        >
                            Impor {validCount} Item
                        </button>
                    )}
                </div>
            </div>
        </ModalBase>
    );
}
