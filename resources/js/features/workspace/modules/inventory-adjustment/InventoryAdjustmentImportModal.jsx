import { useState, useEffect, useRef } from 'react';
import DocumentModalLayout from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import SelectField from '@/components/ui/SelectField';
import { importFromFile } from '@/features/workspace/shared/exportUtils';
import { showSuccessToast, showErrorToast } from '@/components/feedback/toast';
import { parseNumericInput, formatCurrencyValue } from './inventoryAdjustmentShared';

// Fuzzy match helper
function fuzzyMatch(targetKey, headers) {
    const rules = {
        name: ['nama', 'barang', 'name', 'item', 'produk', 'product'],
        code: ['kode', 'code', 'sku', 'barcode', 'id'],
        adjustmentType: ['tipe', 'type', 'jenis', 'action', 'kategori'],
        quantity: ['kuantitas', 'qty', 'quantity', 'jumlah', 'stok', 'stock', 'vol'],
        unit: ['satuan', 'unit', 'uom', 'pcs'],
        unitCost: ['harga', 'price', 'biaya', 'cost', 'modal', 'unitcost'],
    };

    const words = rules[targetKey] || [];
    for (const header of headers) {
        const hLower = String(header).toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const word of words) {
            if (hLower.includes(word)) {
                return header;
            }
        }
    }
    return '';
}

export default function InventoryAdjustmentImportModal({ open, onClose, onImport }) {
    const [step, setStep] = useState('upload');
    const [fileName, setFileName] = useState('');
    const [headers, setHeaders] = useState([]);
    const [rawRows, setRawRows] = useState([]);
    const [mappings, setMappings] = useState({
        name: '',
        code: '',
        adjustmentType: '',
        quantity: '',
        unit: '',
        unitCost: '',
    });
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    // Reset state saat modal dibuka/ditutup
    useEffect(() => {
        if (open) {
            setStep('upload');
            setFileName('');
            setHeaders([]);
            setRawRows([]);
            setMappings({
                name: '',
                code: '',
                adjustmentType: '',
                quantity: '',
                unit: '',
                unitCost: '',
            });
            setLoading(false);
        }
    }, [open]);

    // Handle drag events
    const [dragActive, setDragActive] = useState(false);
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = async (e) => {
        if (e.target.files && e.target.files[0]) {
            await processFile(e.target.files[0]);
        }
    };

    const processFile = async (file) => {
        setLoading(true);
        try {
            const { headers: parsedHeaders, rows: parsedRows } = await importFromFile(file);
            if (!parsedHeaders.length) {
                throw new Error('File tidak memiliki data atau baris header kosong.');
            }

            setFileName(file.name);
            setHeaders(parsedHeaders);
            setRawRows(parsedRows);

            // Auto-mapping berdasarkan fuzzy matching
            setMappings({
                name: fuzzyMatch('name', parsedHeaders),
                code: fuzzyMatch('code', parsedHeaders),
                adjustmentType: fuzzyMatch('adjustmentType', parsedHeaders),
                quantity: fuzzyMatch('quantity', parsedHeaders),
                unit: fuzzyMatch('unit', parsedHeaders),
                unitCost: fuzzyMatch('unitCost', parsedHeaders),
            });

            setStep('match');
        } catch (err) {
            showErrorToast({ message: err.message || 'Gagal mengimpor file.' });
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleImportSubmit = () => {
        if (!mappings.name) {
            showErrorToast({ message: 'Kolom Target "Nama Barang" wajib dipetakan.' });
            return;
        }
        if (!mappings.quantity) {
            showErrorToast({ message: 'Kolom Target "Kuantitas" wajib dipetakan.' });
            return;
        }

        try {
            const mappedItems = rawRows.map((row, index) => {
                const rawName = String(row[mappings.name] || '').trim();
                const rawCode = mappings.code ? String(row[mappings.code] || '').trim() : '';
                const rawType = mappings.adjustmentType ? String(row[mappings.adjustmentType] || '').trim() : 'Penambahan';
                const rawQty = mappings.quantity ? String(row[mappings.quantity] || '').trim() : '1';
                const rawUnit = mappings.unit ? String(row[mappings.unit] || '').trim() : 'PCS';
                const rawUnitCost = mappings.unitCost ? String(row[mappings.unitCost] || '').trim() : '0';

                // Normalisasi tipe penyesuaian
                let adjustmentType = 'Penambahan';
                if (/kurang|out|pengurangan|dec|minus|-/i.test(rawType)) {
                    adjustmentType = 'Pengurangan';
                }

                const quantityAmount = parseNumericInput(rawQty);
                const unitCostAmount = parseNumericInput(rawUnitCost);
                const resolvedUnit = rawUnit || 'PCS';

                return {
                    id: `import-item-${Date.now()}-${index}`,
                    name: rawName || 'Barang Impor',
                    code: rawCode,
                    adjustmentType,
                    quantity: String(quantityAmount || 1),
                    unit: resolvedUnit,
                    unitLookup: [resolvedUnit],
                    unitCost: formatCurrencyValue(unitCostAmount),
                    totalCost: formatCurrencyValue(quantityAmount * unitCostAmount),
                    warehouse: [],
                    department: [],
                    notes: 'Diimpor dari berkas Excel/CSV',
                };
            }).filter(item => item.name);

            if (mappedItems.length === 0) {
                throw new Error('Tidak ada data barang valid untuk diimpor.');
            }

            onImport?.(mappedItems);
            showSuccessToast({ message: `Berhasil mengimpor ${mappedItems.length} barang.` });
            onClose();
        } catch (err) {
            showErrorToast({ message: err.message });
        }
    };

    // Preview first 3 rows
    const previewData = rawRows.slice(0, 3).map((row) => {
        const rawName = mappings.name ? row[mappings.name] : '';
        const rawCode = mappings.code ? row[mappings.code] : '';
        const rawType = mappings.adjustmentType ? row[mappings.adjustmentType] : 'Penambahan';
        const rawQty = mappings.quantity ? row[mappings.quantity] : '1';
        const rawUnit = mappings.unit ? row[mappings.unit] : 'PCS';
        const rawUnitCost = mappings.unitCost ? row[mappings.unitCost] : '0';

        const qty = parseNumericInput(rawQty);
        const cost = parseNumericInput(rawUnitCost);

        return {
            name: rawName || '-',
            code: rawCode || '-',
            adjustmentType: /kurang|out|pengurangan|dec|minus|-/i.test(rawType) ? 'Pengurangan' : 'Penambahan',
            quantity: `${qty} ${rawUnit || 'PCS'}`,
            unitCost: `Rp ${formatCurrencyValue(cost)}`,
            totalCost: `Rp ${formatCurrencyValue(qty * cost)}`,
        };
    });

    return (
        <DocumentModalLayout
            open={open}
            onClose={onClose}
            title="Impor Rincian Barang"
            closeAriaLabel="Tutup modal impor"
            panelClassName="max-w-[640px] overflow-hidden rounded-[8px] px-0 py-0 shadow-modal-import"
            bodyClassName="min-h-[300px] py-4"
            footer={
                <div className="flex items-center justify-between border-t border-ui-border-medium pt-3 px-4">
                    {step === 'match' ? (
                        <button
                            type="button"
                            onClick={() => setStep('upload')}
                            className="inline-flex h-8 items-center justify-center rounded-[4px] border border-brand-blue bg-white px-4 text-xs font-medium text-brand-blue hover:bg-brand-blue/5 transition cursor-pointer"
                        >
                            Kembali
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-8 items-center justify-center rounded-[4px] border border-brand-blue bg-white px-4 text-xs font-medium text-brand-blue hover:bg-brand-blue/5 transition cursor-pointer"
                        >
                            Batal
                        </button>
                    )}

                    {step === 'match' && (
                        <button
                            type="button"
                            onClick={handleImportSubmit}
                            className="inline-flex h-8 items-center justify-center rounded-[4px] border border-import-action-blue bg-import-action-blue px-4 text-xs font-normal text-white"
                        >
                            Mulai Impor
                        </button>
                    )}
                </div>
            }
        >
            {step === 'upload' ? (
                <div className="px-4">
                    <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 text-center transition ${
                            dragActive ? 'border-illustration-danger-bg bg-danger-bg' : 'border-ui-border hover:border-gray-400'
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                            onChange={handleFileSelect}
                        />

                        {loading ? (
                            <div className="flex flex-col items-center gap-2">
                                <svg className="animate-spin h-8 w-8 text-import-action-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-sm font-medium text-gray-600">Membaca berkas...</p>
                            </div>
                        ) : (
                            <>
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="mt-4 text-sm font-medium text-gray-900">
                                    Tarik & lepas file di sini, atau{' '}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-import-action-blue underline font-semibold hover:text-blue-900"
                                    >
                                        pilih dari komputer
                                    </button>
                                </p>
                                <p className="mt-2 text-xs text-gray-500">Mendukung berkas Excel (.xlsx, .xls) dan CSV (.csv)</p>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="px-4 space-y-5">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800">Nama Berkas: <span className="text-import-action-blue font-normal">{fileName}</span></h3>
                        <p className="text-xs text-gray-500 mt-1">Sesuaikan kolom berkas Excel Anda dengan kolom rincian barang sistem di bawah ini.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-ui-border-light p-4 rounded-lg bg-tab-inactive-border-l/50">
                        {/* Nama Barang */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Barang <span className="text-red-500">*</span></label>
                            <SelectField
                                value={mappings.name}
                                onChange={(e) => setMappings(m => ({ ...m, name: e.target.value }))}
                                className="h-[34px] rounded-[4px] border-ui-border w-full"
                                selectClassName="text-xs text-brand-dark"
                            >
                                <option value="">-- Pilih Kolom Excel --</option>
                                {headers.map(h => <option key={h} value={h}>{h}</option>)}
                            </SelectField>
                        </div>

                        {/* Kuantitas */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kuantitas <span className="text-red-500">*</span></label>
                            <SelectField
                                value={mappings.quantity}
                                onChange={(e) => setMappings(m => ({ ...m, quantity: e.target.value }))}
                                className="h-[34px] rounded-[4px] border-ui-border w-full"
                                selectClassName="text-xs text-brand-dark"
                            >
                                <option value="">-- Pilih Kolom Excel --</option>
                                {headers.map(h => <option key={h} value={h}>{h}</option>)}
                            </SelectField>
                        </div>

                        {/* Kode Barang */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kode Barang</label>
                            <SelectField
                                value={mappings.code}
                                onChange={(e) => setMappings(m => ({ ...m, code: e.target.value }))}
                                className="h-[34px] rounded-[4px] border-ui-border w-full"
                                selectClassName="text-xs text-brand-dark"
                            >
                                <option value="">-- Lewati (Kosong) --</option>
                                {headers.map(h => <option key={h} value={h}>{h}</option>)}
                            </SelectField>
                        </div>

                        {/* Tipe Penyesuaian */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tipe Penyesuaian</label>
                            <SelectField
                                value={mappings.adjustmentType}
                                onChange={(e) => setMappings(m => ({ ...m, adjustmentType: e.target.value }))}
                                className="h-[34px] rounded-[4px] border-ui-border w-full"
                                selectClassName="text-xs text-brand-dark"
                            >
                                <option value="">-- Default (Penambahan) --</option>
                                {headers.map(h => <option key={h} value={h}>{h}</option>)}
                            </SelectField>
                        </div>

                        {/* Satuan */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Satuan</label>
                            <SelectField
                                value={mappings.unit}
                                onChange={(e) => setMappings(m => ({ ...m, unit: e.target.value }))}
                                className="h-[34px] rounded-[4px] border-ui-border w-full"
                                selectClassName="text-xs text-brand-dark"
                            >
                                <option value="">-- Default (PCS) --</option>
                                {headers.map(h => <option key={h} value={h}>{h}</option>)}
                            </SelectField>
                        </div>

                        {/* Harga Satuan */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Harga Satuan</label>
                            <SelectField
                                value={mappings.unitCost}
                                onChange={(e) => setMappings(m => ({ ...m, unitCost: e.target.value }))}
                                className="h-[34px] rounded-[4px] border-ui-border w-full"
                                selectClassName="text-xs text-brand-dark"
                            >
                                <option value="">-- Default (Rp 0) --</option>
                                {headers.map(h => <option key={h} value={h}>{h}</option>)}
                            </SelectField>
                        </div>
                    </div>

                    {/* Preview Table */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">Pratinjau Data (3 baris pertama)</h4>
                        <div className="border border-ui-border-light rounded-lg overflow-hidden overflow-x-auto">
                            <table className="min-w-full text-xs text-left text-gray-500">
                                <thead className="bg-table-header-bg text-white text-[11px] font-semibold uppercase">
                                    <tr>
                                        <th className="px-3 py-2 text-center">Nama Barang</th>
                                        <th className="px-3 py-2 text-center">Kode</th>
                                        <th className="px-3 py-2 text-center">Tipe</th>
                                        <th className="px-3 py-2 text-center">Qty</th>
                                        <th className="px-3 py-2 text-center">Biaya Satuan</th>
                                        <th className="px-3 py-2 text-center">Total Biaya</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ui-border-light bg-white">
                                    {previewData.map((p, idx) => (
                                        <tr key={idx} className="hover:bg-tab-inactive-border-l">
                                            <td className="px-3 py-2 font-medium text-gray-900 truncate max-w-[140px] text-left">{p.name}</td>
                                            <td className="px-3 py-2 text-left">{p.code}</td>
                                            <td className="px-3 py-2 text-left">{p.adjustmentType}</td>
                                            <td className="px-3 py-2 text-left">{p.quantity}</td>
                                            <td className="px-3 py-2 text-left">{p.unitCost}</td>
                                            <td className="px-3 py-2 text-left font-medium text-gray-900">{p.totalCost}</td>
                                        </tr>
                                    ))}
                                    {previewData.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-3 py-4 text-center text-gray-400">Pilih kolom untuk melihat pratinjau data.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </DocumentModalLayout>
    );
}
