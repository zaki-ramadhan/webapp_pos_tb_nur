import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Button from '@/components/ui/Button';
import { importFromFile } from '@/features/workspace/shared/exportUtils';
import { formatCurrencyValue, parseNumericInput } from '@/features/workspace/shared/transactionFormatters';
import { showErrorToast, showSuccessToast } from '@/components/feedback/toast';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';
import { downloadInventoryAdjustmentTemplate } from '../constants/inventoryAdjustmentTemplateBase64';

function ExcelFileIcon({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M8 13l4 4" />
            <path d="M12 13l-4 4" />
        </svg>
    );
}

export default function InventoryAdjustmentImportModal({ open, onClose, onImport }) {
    const fileInputRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;

        axios.get('/api/backend/products', { params: { per_page: 1000 } })
            .then((response) => {
                const data = response.data?.data ?? response.data ?? [];
                setProducts(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                // Ignore failure to fetch product catalog, fallback to raw excel values
            });
    }, [open]);

    async function handleFileSelect(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        setErrorMessage('');

        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const fileName = (file.name || '').toLowerCase();
        const isValidType = validExtensions.some((ext) => fileName.endsWith(ext));

        if (!isValidType) {
            showSystemErrorModal({
                title: 'Format File Tidak Didukung',
                description: 'Silakan pilih file dengan format yang sesuai:',
                messages: [
                    `File "${file.name}" tidak dapat diproses.`,
                    'Format yang diperbolehkan hanya file Microsoft Excel (.xlsx, .xls) atau CSV (.csv).',
                ],
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            showSystemErrorModal({
                title: 'Ukuran File Terlalu Besar',
                description: 'Batas ukuran file telah terlampaui:',
                messages: [
                    `Ukuran file "${file.name}" melebihi batas maksimal 10 MB.`,
                ],
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setLoading(true);

        try {
            const { rows } = await importFromFile(file);

            if (!rows || rows.length === 0) {
                showSystemErrorModal({
                    title: 'File Tidak Memiliki Data',
                    description: 'Pemeriksaan baris data gagal:',
                    messages: [
                        'File Excel tidak memiliki baris data untuk diimpor.',
                        'Pastikan data barang dimulai dari baris ke-2 pada Sheet pertama (Template).',
                    ],
                });
                setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            const validationErrors = [];
            const importedItems = [];

            rows.forEach((row, idx) => {
                const rowNumber = idx + 2;
                const getVal = (...keys) => {
                    for (const k of keys) {
                        const foundKey = Object.keys(row).find(
                            (rk) => rk.toLowerCase().replace(/[\s_#-]/g, '') === k.toLowerCase().replace(/[\s_#-]/g, '')
                        );
                        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== '') {
                            return String(row[foundKey]).trim();
                        }
                    }
                    return '';
                };

                const rawCode = getVal('kodebarang', 'kode', 'code', 'barcode');
                const rawName = getVal('namabarang', 'nama', 'name', 'description');
                const rawType = getVal('tipepenyesuaian', 'tipe', 'type', 'adjustmenttype');
                const rawQty = getVal('kuantitas', 'qty', 'quantity', 'jumlah');
                const rawUnit = getVal('satuan', 'unit');
                const rawCost = getVal('biayasatuan', 'biaya', 'cost', 'unitcost', 'hargabeli', 'harga');
                const rawWarehouse = getVal('gudang', 'warehouse');
                const rawNotes = getVal('keterangan', 'catatan', 'notes');

                // Lewati baris kosong tanpa kode, nama, kuantitas, ataupun biaya
                if (!rawCode && !rawName && !rawQty && !rawCost) {
                    return;
                }

                const itemLabel = rawName || rawCode || `Baris ${rowNumber}`;

                if (!rawCode && !rawName) {
                    validationErrors.push(`Baris ${rowNumber}: Kode Barang atau Nama Barang wajib diisi.`);
                    return;
                }

                const parsedQty = parseNumericInput(rawQty);
                if (isNaN(parsedQty) || parsedQty <= 0) {
                    validationErrors.push(`Baris ${rowNumber} (${itemLabel}): Kuantitas harus berupa angka positif lebih dari 0.`);
                }

                const parsedCost = rawCost ? parseNumericInput(rawCost) : null;
                if (parsedCost !== null && (isNaN(parsedCost) || parsedCost < 0)) {
                    validationErrors.push(`Baris ${rowNumber} (${itemLabel}): Biaya satuan tidak boleh bernilai negatif.`);
                }

                const matchedProduct = products.find((p) =>
                    (rawCode && String(p.code).toLowerCase() === rawCode.toLowerCase()) ||
                    (rawName && String(p.name).toLowerCase() === rawName.toLowerCase())
                );

                const resolvedType = (rawType && rawType.toLowerCase().includes('kurang')) ? 'Pengurangan' : 'Penambahan';
                const resolvedQty = parsedQty > 0 ? parsedQty : 1;
                const defaultCost = matchedProduct?.buy_price ?? matchedProduct?.cost_price ?? matchedProduct?.unit_cost ?? 0;
                const resolvedCost = parsedCost !== null ? parsedCost : defaultCost;
                const unitName = rawUnit || matchedProduct?.base_unit?.name || matchedProduct?.unit?.name || '';
                const warehouseName = rawWarehouse || matchedProduct?.default_warehouse?.name || 'Gudang Utama';

                importedItems.push({
                    id: `imported-${Date.now()}-${idx}`,
                    __productId: matchedProduct?.id ?? null,
                    __unitId: matchedProduct?.base_unit_id ?? matchedProduct?.unit_id ?? null,
                    name: matchedProduct?.name ?? rawName ?? `Barang ${idx + 1}`,
                    code: matchedProduct?.code ?? rawCode ?? '',
                    adjustmentType: resolvedType,
                    quantity: String(resolvedQty),
                    unit: unitName,
                    unitLookup: unitName ? [unitName] : [],
                    unitCost: formatCurrencyValue(resolvedCost),
                    totalCost: formatCurrencyValue(resolvedQty * resolvedCost),
                    warehouse: warehouseName ? [warehouseName] : [],
                    department: [],
                    notes: rawNotes || '',
                    oldDiscount: '0',
                    minQty: '0',
                    newDiscount: '0',
                });
            });

            if (validationErrors.length > 0) {
                showSystemErrorModal({
                    title: 'Kesalahan Validasi Data Excel',
                    description: 'Silakan perbaiki data berikut pada file Excel sebelum mengimpor:',
                    messages: validationErrors.slice(0, 8).concat(
                        validationErrors.length > 8 ? [`...dan ${validationErrors.length - 8} kesalahan lainnya.`] : []
                    ),
                });
                setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            if (importedItems.length === 0) {
                showSystemErrorModal({
                    title: 'Data Barang Tidak Valid',
                    description: 'Tidak ada baris barang yang dapat diimpor:',
                    messages: ['Pastikan kolom Kode Barang atau Nama Barang telah terisi pada file Excel.'],
                });
                setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            onImport?.(importedItems);
            showSuccessToast({
                title: 'Berhasil',
                message: `Berhasil mengimpor ${importedItems.length} barang ke rincian penyesuaian.`,
            });
            onClose();
        } catch (err) {
            showSystemErrorModal({
                title: 'Gagal Membaca File Excel',
                description: 'Terjadi permasalahan saat memproses file:',
                messages: [
                    err?.message || 'Pastikan format file Excel (.xlsx, .xls) atau CSV (.csv) valid dan tidak rusak.',
                ],
            });
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            title="Impor Excel Ke Detail Barang"
            headerIcon={null}
            closeLabel="Tutup dialog"
            maxWidthClassName="max-w-[580px] w-full"
            contentClassName="bg-white p-5 sm:p-6 space-y-4"
        >
            {/* Langkah 1 */}
            <div className="flex items-start gap-2.5">
                <span className="text-sm font-normal text-brand-dark shrink-0">1.</span>
                <div>
                    <h4 className="text-sm font-normal italic text-brand-dark">Template File Excel</h4>
                    <p className="mt-1 text-sm font-normal text-brand-dark leading-relaxed">
                        Pastikan format excel data Anda sesuai dengan contoh yang diberikan. Silakan unduh template nya{' '}
                        <button
                            type="button"
                            onClick={downloadInventoryAdjustmentTemplate}
                            className="text-brand-blue font-normal hover:underline cursor-pointer inline p-0 bg-transparent border-none"
                        >
                            disini
                        </button>
                    </p>
                </div>
            </div>

            {/* Langkah 2 */}
            <div className="flex items-start gap-2.5">
                <span className="text-sm font-normal text-brand-dark shrink-0">2.</span>
                <div>
                    <h4 className="text-sm font-normal italic text-brand-dark">Unggah File Excel</h4>
                    <p className="mt-1 text-sm font-normal text-brand-dark leading-relaxed">
                        Klik tombol berikut untuk memilih file excel yang sudah Anda lengkapi
                    </p>

                    <div className="mt-3.5 flex items-center">
                        <Button
                            type="button"
                            variant="primary"
                            size="md"
                            disabled={loading}
                            onClick={() => fileInputRef.current?.click()}
                            className="w-auto px-5 whitespace-nowrap [&>span]:inline-flex [&>span]:items-center [&>span]:gap-2.5 [&>span]:whitespace-nowrap"
                        >
                            <ExcelFileIcon className="h-4 w-4 shrink-0" />
                            <span className="font-normal whitespace-nowrap">{loading ? 'Sedang membaca...' : 'Pilih file Excel'}</span>
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                    </div>
                </div>
            </div>
        </WorkspaceDialog>
    );
}
