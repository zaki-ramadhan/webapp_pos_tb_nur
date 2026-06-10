import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import ModalBase from '@/components/ui/ModalBase';
import { CloseIcon, TableActionIcon } from '@/features/workspace/shared/Icons';

// Helper to parse CSV values
function parseCSV(text) {
    const lines = text.split(/\r?\n/);
    const firstLine = lines[0] || '';
    const delimiter = firstLine.includes(';') ? ';' : ',';

    return lines
        .map((line) => {
            const result = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === delimiter && !inQuotes) {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current.trim());
            return result;
        })
        .filter((row) => row.length > 0 && row.some((cell) => cell !== ''));
}

export default function ImportItemsModal({ open, onClose, onImport, mode = 'sales' }) {
    const [file, setFile] = useState(null);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [csvRows, setCsvRows] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [columnMapping, setColumnMapping] = useState({
        code: -1,
        quantity: -1,
        price: -1,
        notes: -1,
    });
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch product catalog
    useEffect(() => {
        if (!open) return;

        async function fetchProducts() {
            setLoadingProducts(true);
            try {
                const response = await axios.get('/api/backend/products', {
                    params: { per_page: 1000 },
                });
                const data = response.data?.data ?? response.data ?? [];
                setProducts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to load products for import mapping:', err);
                setErrorMessage('Gagal memuat katalog barang dari server.');
            } finally {
                setLoadingProducts(false);
            }
        }

        fetchProducts();
    }, [open]);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!open) {
            setFile(null);
            setCsvHeaders([]);
            setCsvRows([]);
            setColumnMapping({ code: -1, quantity: -1, price: -1, notes: -1 });
            setErrorMessage('');
        }
    }, [open]);

    // Handle file upload and parsing
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.txt')) {
            setErrorMessage('Hanya mendukung file format CSV (.csv).');
            return;
        }

        setErrorMessage('');
        setFile(selectedFile);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const parsed = parseCSV(text);

                if (parsed.length < 2) {
                    setErrorMessage('File CSV tidak memiliki data yang cukup.');
                    return;
                }

                const headers = parsed[0];
                const rows = parsed.slice(1);

                setCsvHeaders(headers);
                setCsvRows(rows);

                // Auto-detect columns
                const mapping = { code: -1, quantity: -1, price: -1, notes: -1 };
                headers.forEach((header, index) => {
                    const h = header.toLowerCase();
                    if (h.includes('kode') || h.includes('code') || h.includes('sku') || h.includes('barcode') || h.includes('id')) {
                        if (mapping.code === -1) mapping.code = index;
                    } else if (h.includes('qty') || h.includes('jumlah') || h.includes('quantity') || h.includes('kuantitas')) {
                        if (mapping.quantity === -1) mapping.quantity = index;
                    } else if (h.includes('harga') || h.includes('price') || h.includes('rate')) {
                        if (mapping.price === -1) mapping.price = index;
                    } else if (h.includes('note') || h.includes('ket') || h.includes('catatan') || h.includes('deskripsi')) {
                        if (mapping.notes === -1) mapping.notes = index;
                    }
                });

                setColumnMapping(mapping);
            } catch (err) {
                setErrorMessage('Gagal membaca dan menganalisis file CSV.');
            }
        };
        reader.readAsText(selectedFile);
    };

    // Calculate resolved items based on product catalog matching
    const previewItems = useMemo(() => {
        if (csvRows.length === 0 || columnMapping.code === -1 || columnMapping.quantity === -1) {
            return [];
        }

        return csvRows.map((row, idx) => {
            const rawCode = String(row[columnMapping.code] ?? '').trim();
            const rawQty = String(row[columnMapping.quantity] ?? '').trim();
            const rawPrice = columnMapping.price !== -1 ? String(row[columnMapping.price] ?? '').trim() : '';
            const rawNotes = columnMapping.notes !== -1 ? String(row[columnMapping.notes] ?? '').trim() : '';

            // Clean quantity and price numbers
            const parsedQty = parseFloat(rawQty.replace(/[^\d.-]/g, '')) || 0;
            const parsedPrice = parseFloat(rawPrice.replace(/[^\d.-]/g, '')) || 0;

            // Match product
            const matchedProduct = products.find(
                (p) =>
                    String(p.code).toLowerCase() === rawCode.toLowerCase() ||
                    String(p.barcode).toLowerCase() === rawCode.toLowerCase()
            );

            const isMatched = !!matchedProduct;

            return {
                id: `import-${idx}-${Date.now()}`,
                __productId: matchedProduct?.id ?? null,
                __unitId: matchedProduct?.base_unit_id ?? matchedProduct?.sales_unit_id ?? null,
                name: matchedProduct?.name ?? `Barang tidak ditemukan (${rawCode})`,
                code: matchedProduct?.code ?? rawCode,
                quantity: String(parsedQty),
                unit: matchedProduct?.base_unit?.name ?? matchedProduct?.sales_unit?.name ?? 'PCS',
                price: matchedProduct
                    ? (parsedPrice || parseFloat(mode === 'sales' ? matchedProduct.default_sale_price : matchedProduct.default_purchase_price) || 0)
                    : 0,
                notes: rawNotes,
                valid: isMatched && parsedQty > 0,
                rawCode,
                rawQty,
            };
        });
    }, [csvRows, columnMapping, products, mode]);

    const validItemsCount = previewItems.filter((item) => item.valid).length;

    // Handle Confirm Import
    const handleConfirmImport = () => {
        const importable = previewItems
            .filter((item) => item.valid)
            .map((item) => {
                // Return exactly the fields expected by the form states
                const unitPrice = parseFloat(item.price) || 0;
                const qty = parseFloat(item.quantity) || 1;
                const totalAmount = qty * unitPrice;

                return {
                    id: item.id,
                    __productId: item.__productId,
                    __unitId: item.__unitId,
                    name: item.name,
                    code: item.code,
                    quantity: String(qty),
                    unit: item.unit,
                    price: item.price.toLocaleString('id-ID'),
                    discount: '0',
                    discountValue: '0',
                    total: totalAmount.toLocaleString('id-ID'),
                    requestDate: new Date().toLocaleDateString('id-ID'), // for ItemRequest
                    notes: item.notes,
                };
            });

        if (importable.length === 0) {
            setErrorMessage('Tidak ada data valid yang bisa diimpor.');
            return;
        }

        onImport(importable);
        onClose();
    };

    return (
        <ModalBase
            open={open}
            onBackdropClick={onClose}
            className="bg-[rgba(15,23,42,0.72)] z-[9999]"
            panelClassName="max-w-[820px] w-full overflow-hidden rounded-[8px] px-0 py-0 shadow-[0_18px_44px_rgba(15,23,42,0.28)]"
        >
            {/* Header */}
            <div className="bg-[#173968] px-5 py-4 text-white">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <TableActionIcon className="h-5 w-5 text-white" />
                        <h2 className="text-[17px] font-medium">Ekstraksi File CSV / Excel</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] text-white transition hover:bg-white/10"
                    >
                        <CloseIcon className="h-5 w-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white p-6">
                {errorMessage && (
                    <div className="mb-4 rounded-[4px] bg-red-50 border border-red-200 p-3 text-[14px] text-red-700">
                        {errorMessage}
                    </div>
                )}

                {/* Step 1: Upload File */}
                {!file ? (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#cfd6e2] rounded-[6px] p-8 bg-slate-50 hover:bg-slate-100 transition">
                        <TableActionIcon className="h-12 w-12 text-[#94a3b8] mb-3" />
                        <p className="text-[15px] font-medium text-slate-700 mb-1">Pilih File CSV Laporan</p>
                        <p className="text-[13px] text-slate-500 mb-4 text-center">
                            Ekspor file Excel Anda ke format CSV (, atau ;) lalu upload ke sini
                        </p>
                        <label className="inline-flex h-[38px] cursor-pointer items-center justify-center rounded-[4px] bg-[#1d52a5] px-5 text-[14px] font-medium text-white hover:bg-[#173968] transition">
                            Cari File
                            <input
                                type="file"
                                accept=".csv,.txt"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* File info */}
                        <div className="flex items-center justify-between rounded-[4px] border border-slate-200 bg-slate-50 px-4 py-3">
                            <span className="text-[14px] font-medium text-slate-700">{file.name}</span>
                            <button
                                type="button"
                                onClick={() => setFile(null)}
                                className="text-[13px] font-semibold text-red-600 hover:text-red-800"
                            >
                                Ganti File
                            </button>
                        </div>

                        {/* Step 2: Mapping columns */}
                        <div>
                            <h3 className="text-[15px] font-semibold text-slate-800 mb-3 border-b pb-2">
                                Sesuaikan Pemetaan Kolom CSV
                            </h3>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <div>
                                    <label className="block text-[13px] font-semibold text-slate-600 mb-1">
                                        Kode Barang / Barcode *
                                    </label>
                                    <select
                                        value={columnMapping.code}
                                        onChange={(e) =>
                                            setColumnMapping((prev) => ({ ...prev, code: parseInt(e.target.value) }))
                                        }
                                        className="w-full h-[36px] rounded-[4px] border border-[#cfd6e2] px-2 text-[14px] outline-none focus:border-[#1d52a5]"
                                    >
                                        <option value="-1">-- Pilih Kolom --</option>
                                        {csvHeaders.map((header, idx) => (
                                            <option key={idx} value={idx}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[13px] font-semibold text-slate-600 mb-1">
                                        Kuantitas *
                                    </label>
                                    <select
                                        value={columnMapping.quantity}
                                        onChange={(e) =>
                                            setColumnMapping((prev) => ({ ...prev, quantity: parseInt(e.target.value) }))
                                        }
                                        className="w-full h-[36px] rounded-[4px] border border-[#cfd6e2] px-2 text-[14px] outline-none focus:border-[#1d52a5]"
                                    >
                                        <option value="-1">-- Pilih Kolom --</option>
                                        {csvHeaders.map((header, idx) => (
                                            <option key={idx} value={idx}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[13px] font-semibold text-slate-600 mb-1">
                                        Harga Satuan
                                    </label>
                                    <select
                                        value={columnMapping.price}
                                        onChange={(e) =>
                                            setColumnMapping((prev) => ({ ...prev, price: parseInt(e.target.value) }))
                                        }
                                        className="w-full h-[36px] rounded-[4px] border border-[#cfd6e2] px-2 text-[14px] outline-none focus:border-[#1d52a5]"
                                    >
                                        <option value="-1">-- Gunakan Harga Default --</option>
                                        {csvHeaders.map((header, idx) => (
                                            <option key={idx} value={idx}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[13px] font-semibold text-slate-600 mb-1">
                                        Catatan / Keterangan
                                    </label>
                                    <select
                                        value={columnMapping.notes}
                                        onChange={(e) =>
                                            setColumnMapping((prev) => ({ ...prev, notes: parseInt(e.target.value) }))
                                        }
                                        className="w-full h-[36px] rounded-[4px] border border-[#cfd6e2] px-2 text-[14px] outline-none focus:border-[#1d52a5]"
                                    >
                                        <option value="-1">-- Kosongkan --</option>
                                        {csvHeaders.map((header, idx) => (
                                            <option key={idx} value={idx}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Match & Preview */}
                        {columnMapping.code !== -1 && columnMapping.quantity !== -1 && (
                            <div>
                                <div className="flex items-center justify-between border-b pb-2 mb-3">
                                    <h3 className="text-[15px] font-semibold text-slate-800">
                                        Preview Hasil Pencocokan Barang ({validItemsCount} valid dari {previewItems.length} baris)
                                    </h3>
                                    {loadingProducts && <span className="text-[13px] text-slate-500">Mencocokkan...</span>}
                                </div>
                                <div className="max-h-[240px] overflow-y-auto border border-slate-200 rounded-[4px]">
                                    <table className="w-full border-collapse text-left text-[14px]">
                                        <thead className="bg-slate-50 text-slate-700 sticky top-0 border-b border-slate-200">
                                            <tr>
                                                <th className="px-3 py-2 font-semibold">Kode Input</th>
                                                <th className="px-3 py-2 font-semibold">Hasil Pencocokan</th>
                                                <th className="px-3 py-2 font-semibold text-right">Qty</th>
                                                {columnMapping.price !== -1 && <th className="px-3 py-2 font-semibold text-right">Harga</th>}
                                                <th className="px-3 py-2 font-semibold text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {previewItems.map((item, idx) => (
                                                <tr key={idx} className={item.valid ? 'hover:bg-slate-50' : 'bg-red-50/50'}>
                                                    <td className="px-3 py-2 font-mono text-slate-600">{item.rawCode}</td>
                                                    <td className="px-3 py-2">
                                                        <div className="font-medium text-slate-800">{item.name}</div>
                                                        {item.valid && (
                                                            <div className="text-[12px] text-slate-500">
                                                                Kode Sistem: {item.code} | Unit: {item.unit}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-mono">{item.rawQty}</td>
                                                    {columnMapping.price !== -1 && (
                                                        <td className="px-3 py-2 text-right font-mono">
                                                            {item.price ? `Rp ${item.price.toLocaleString('id-ID')}` : '-'}
                                                        </td>
                                                    )}
                                                    <td className="px-3 py-2 text-center">
                                                        {item.valid ? (
                                                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-[12px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                                Valid
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-[12px] font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                                                                Error / Tidak Ditemukan
                                                            </span>
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

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-200 mt-6 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-[38px] items-center justify-center rounded-[4px] border border-slate-300 bg-white px-5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        Batal
                    </button>
                    {file && (
                        <button
                            type="button"
                            onClick={handleConfirmImport}
                            disabled={validItemsCount === 0}
                            className={`inline-flex h-[38px] items-center justify-center rounded-[4px] px-5 text-[14px] font-semibold text-white transition ${
                                validItemsCount > 0 ? 'bg-[#1d52a5] hover:bg-[#173968] cursor-pointer' : 'bg-slate-300 cursor-not-allowed'
                            }`}
                        >
                            Impor {validItemsCount} Item
                        </button>
                    )}
                </div>
            </div>
        </ModalBase>
    );
}
