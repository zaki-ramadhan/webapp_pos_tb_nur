import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Button from '@/components/ui/Button';
import { importFromFile, triggerDownload } from '@/features/workspace/shared/exportUtils';
import { formatCurrencyValue, parseNumericInput } from '@/features/workspace/shared/transactionFormatters';
import { showErrorToast, showSuccessToast } from '@/components/feedback/toast';
import { showSystemErrorModal, showSystemInfoModal } from '@/components/ui/SystemErrorModal';
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
                // Abaikan error pengambilan katalog, tetap izinkan proses impor
            });
    }, [open]);

    async function handleFileSelect(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const fileName = (file.name || '').toLowerCase();
        const isValidType = validExtensions.some((ext) => fileName.endsWith(ext));

        if (!isValidType) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            showSystemErrorModal({
                messages: [
                    'Template tidak sesuai. Pastikan format excel data Anda sesuai dengan contoh yang diberikan.',
                ],
            });
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            showSystemErrorModal({
                messages: [
                    `Ukuran file "${file.name}" melebihi batas maksimal 10 MB.`,
                ],
            });
            return;
        }

        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 80));

        try {
            const { headers, rows } = await importFromFile(file);

            const normalizedHeaders = (headers || []).map((h) =>
                String(h || '').toLowerCase().replace(/[\s_#*-]/g, '')
            );

            const hasItemCol = normalizedHeaders.some((h) =>
                ['kode', 'kodebarang', 'itemcode', 'barcode', 'nama', 'namabarang', 'itemname'].includes(h)
            );
            const hasQtyCol = normalizedHeaders.some((h) =>
                ['kuantitas', 'qty', 'quantity', 'jumlah'].includes(h)
            );

            if (!hasItemCol || !hasQtyCol) {
                showSystemErrorModal({
                    messages: [
                        'Template tidak sesuai. Pastikan format excel data Anda sesuai dengan contoh yang diberikan.',
                    ],
                });
                setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            const dataRows = (rows || []).filter((row) =>
                Object.values(row).some((val) => val !== undefined && val !== null && String(val).trim() !== '')
            );

            if (dataRows.length === 0) {
                showSystemErrorModal({
                    messages: [
                        'Template tidak sesuai. Pastikan format excel data Anda sesuai dengan contoh yang diberikan.',
                    ],
                });
                setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            let notFoundCount = 0;
            let invalidDataCount = 0;
            const errorReportLines = [];
            const importedItems = [];

            dataRows.forEach((row, idx) => {
                const rowNumber = idx + 1;
                const getVal = (...keys) => {
                    for (const k of keys) {
                        const foundKey = Object.keys(row).find(
                            (rk) => rk.toLowerCase().replace(/[\s_#*-]/g, '') === k.toLowerCase().replace(/[\s_#*-]/g, '')
                        );
                        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && String(row[foundKey]).trim() !== '') {
                            return String(row[foundKey]).trim();
                        }
                    }
                    return '';
                };

                const rawCode = getVal('kodebarang', 'kode', 'code', 'barcode', 'itemcode');
                const rawName = getVal('namabarang', 'nama', 'name', 'description', 'itemname');
                const rawType = getVal('tipepenyesuaian', 'tipe', 'type', 'adjustmenttype');
                const rawQty = getVal('kuantitas', 'qty', 'quantity', 'jumlah');
                const rawUnit = getVal('satuan', 'unit');
                const rawCost = getVal('biayasatuan', 'biaya', 'cost', 'unitcost', 'hargabeli', 'harga');
                const rawWarehouse = getVal('gudang', 'warehouse');
                const rawNotes = getVal('keterangan', 'catatan', 'notes');

                const itemIdentifier = rawCode || rawName || `Baris ${rowNumber}`;

                // Cocokkan barang dengan database katalog
                let matchedProduct = null;
                if (rawCode) {
                    matchedProduct = products.find(
                        (p) => String(p.code || '').trim().toLowerCase() === rawCode.toLowerCase() ||
                               String(p.barcode || '').trim().toLowerCase() === rawCode.toLowerCase()
                    );
                }
                if (!matchedProduct && rawName) {
                    matchedProduct = products.find(
                        (p) => String(p.name || '').trim().toLowerCase() === rawName.toLowerCase()
                    );
                }

                if (!matchedProduct) {
                    notFoundCount++;
                    errorReportLines.push(`"${itemIdentifier}", tidak ditemukan di Barang dan Jasa pada data impor baris ke-${rowNumber}, Nama Barang: ${rawName || '-'}, Kode Barang: ${rawCode || '-'}`);
                    return;
                }

                const parsedQty = parseNumericInput(rawQty);
                if (isNaN(parsedQty) || parsedQty <= 0) {
                    invalidDataCount++;
                    errorReportLines.push(`"${itemIdentifier}", kuantitas atau format data tidak valid pada data impor baris ke-${rowNumber}, Nama Barang: ${rawName || '-'}, Kode Barang: ${rawCode || '-'}`);
                    return;
                }

                const parsedCost = rawCost ? parseNumericInput(rawCost) : null;
                const defaultCost = Number(matchedProduct.buy_price ?? matchedProduct.cost_price ?? matchedProduct.unit_cost ?? 0);
                const resolvedCost = (parsedCost !== null && !isNaN(parsedCost) && parsedCost >= 0) ? parsedCost : defaultCost;

                const resolvedType = (rawType && rawType.toLowerCase().includes('kurang')) ? 'Pengurangan' : 'Penambahan';
                const unitName = rawUnit || matchedProduct.base_unit?.name || matchedProduct.unit?.name || '';
                const warehouseName = rawWarehouse || matchedProduct.default_warehouse?.name || 'Gudang Utama';

                importedItems.push({
                    id: `imported-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
                    __productId: matchedProduct.id,
                    __unitId: matchedProduct.base_unit_id ?? matchedProduct.unit_id ?? null,
                    name: matchedProduct.name,
                    code: matchedProduct.code || rawCode || '',
                    adjustmentType: resolvedType,
                    quantity: String(parsedQty),
                    unit: unitName,
                    unitLookup: unitName ? [unitName] : [],
                    unitCost: formatCurrencyValue(resolvedCost),
                    totalCost: formatCurrencyValue(parsedQty * resolvedCost),
                    warehouse: warehouseName ? [warehouseName] : [],
                    department: [],
                    notes: rawNotes || '',
                    oldDiscount: '0',
                    minQty: '0',
                    newDiscount: '0',
                });
            });

            const totalRows = dataRows.length;
            const successCount = importedItems.length;
            const failedCount = totalRows - successCount;

            const failureReasons = [];
            if (notFoundCount > 0) {
                failureReasons.push(`${notFoundCount} baris barang: tidak ditemukan di Barang dan Jasa`);
            }
            if (invalidDataCount > 0) {
                failureReasons.push(`${invalidDataCount} baris barang: kuantitas atau format data tidak valid`);
            }

            const summaryMessage = [
                `${totalRows} baris barang: ${successCount} berhasil terimpor, ${failedCount} gagal impor.`,
                ...failureReasons,
            ].join(' ');

            if (successCount > 0) {
                onImport?.(importedItems);
                showSuccessToast({
                    title: 'Berhasil',
                    message: `${successCount} barang berhasil diimpor ke rincian penyesuaian.`,
                });
            }

            // Auto-download file teks daftar error jika ada baris yang gagal
            if (errorReportLines.length > 0) {
                triggerDownload(
                    errorReportLines.join('\r\n'),
                    'text/plain;charset=utf-8',
                    'error-list-item-adjustment.txt'
                );
            }

            onClose();
            showSystemInfoModal({
                message: summaryMessage,
            });
        } catch (err) {
            showSystemErrorModal({
                messages: [
                    'Template tidak sesuai. Pastikan format excel data Anda sesuai dengan contoh yang diberikan.',
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
                            {loading ? (
                                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                            ) : (
                                <ExcelFileIcon className="h-4 w-4 shrink-0" />
                            )}
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
