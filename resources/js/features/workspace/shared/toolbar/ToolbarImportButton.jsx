import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import ToolbarIconButton from './ToolbarIconButton';
import { LoadingIcon, DownloadIcon, CloseIcon, AlertTriangleIcon, UploadIcon } from '@/features/workspace/shared/Icons';
import { importFromFile } from '../exportUtils';
import ModalBase from '@/components/ui/ModalBase';

const DEPENDENCY_GUIDES = {
    'employees': {
        title: 'Karyawan',
        dependencies: [
            { label: 'Cabang Master', path: 'branch' },
            { label: 'Departemen', path: 'department' }
        ],
        description: 'Sebelum mengimpor data Karyawan, pastikan data Cabang dan Departemen yang digunakan oleh Karyawan tersebut sudah terdaftar di sistem agar data relasi tidak terputus.'
    },
    'products': {
        title: 'Barang & Jasa (Produk)',
        dependencies: [
            { label: 'Satuan Barang', path: 'item-unit' },
            { label: 'Kategori Barang', path: 'item-category' },
            { label: 'Merek Barang', path: 'item-brand' }
        ],
        description: 'Sebelum mengimpor data Barang & Jasa, pastikan Satuan Utama dan Kategori Barang yang dicantumkan sudah terdaftar.'
    },
    'sales-invoices': {
        title: 'Faktur Penjualan',
        dependencies: [
            { label: 'Pelanggan', path: 'customer-category' },
            { label: 'Barang & Jasa', path: 'items-services' }
        ],
        description: 'Sebelum mengimpor Faktur Penjualan, pastikan data Pelanggan dan Barang & Jasa yang dibeli sudah terdaftar.'
    },
    'purchase-invoices': {
        title: 'Faktur Pembelian',
        dependencies: [
            { label: 'Pemasok (Supplier)', path: 'supplier-category' },
            { label: 'Barang & Jasa', path: 'items-services' }
        ],
        description: 'Sebelum mengimpor Faktur Pembelian, pastikan data Pemasok dan Barang & Jasa yang dibeli sudah terdaftar.'
    },
    'sales-orders': {
        title: 'Pesanan Penjualan',
        dependencies: [
            { label: 'Pelanggan', path: 'customer-category' },
            { label: 'Barang & Jasa', path: 'items-services' }
        ],
        description: 'Sebelum mengimpor Pesanan Penjualan, pastikan data Pelanggan dan Barang & Jasa yang dibeli sudah terdaftar.'
    },
    'sales-returns': {
        title: 'Retur Penjualan',
        dependencies: [
            { label: 'Pelanggan', path: 'customer-category' },
            { label: 'Barang & Jasa', path: 'items-services' }
        ],
        description: 'Sebelum mengimpor Retur Penjualan, pastikan data Pelanggan dan Barang & Jasa sudah terdaftar.'
    },
    'purchase-returns': {
        title: 'Retur Pembelian',
        dependencies: [
            { label: 'Pemasok (Supplier)', path: 'supplier-category' },
            { label: 'Barang & Jasa', path: 'items-services' }
        ],
        description: 'Sebelum mengimpor Retur Pembelian, pastikan data Pemasok dan Barang & Jasa sudah terdaftar.'
    }
};

export default function ToolbarImportButton({ importConfig, sizeStyle, resource = '', columns = [] }) {
    const fileInputRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleFileChange(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const result = await importFromFile(file);
            await importConfig.onImport?.(result);
            setShowModal(false);
        } catch {
            // abaikan error
        } finally {
            setLoading(false);
            event.target.value = '';
        }
    }

    function handleDownloadTemplate() {
        if (!columns || !columns.length) return;
        const activeCols = columns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label);
        const headers = activeCols.map(col => col.label);

        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template Impor');

        const title = importConfig.label ?? 'Template';
        const cleanTitle = String(title).replace(/\s+/g, '-').toLowerCase();
        XLSX.writeFile(wb, `${cleanTitle}_template.xlsx`);
    }

    const guide = DEPENDENCY_GUIDES[resource] ?? null;

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
            />

            <ToolbarIconButton
                label={importConfig.label ?? 'Impor data'}
                onClick={() => setShowModal(true)}
                className={`inline-flex shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue transition hover:bg-brand-blue-light ${sizeStyle.utilityButton} ${loading ? 'pointer-events-none opacity-70' : ''}`.trim()}
            >
                {loading
                    ? <LoadingIcon className="h-4 w-4 animate-spin" />
                    : <DownloadIcon className="h-4 w-4" />
                }
            </ToolbarIconButton>

            {showModal ? (
                <ModalBase open={showModal} onClose={() => setShowModal(false)} widthClassName="max-w-[500px]">
                    <div className="flex flex-col bg-white rounded-[6px] shadow-lg overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-table-row-border px-4.5 py-3.5 bg-slate-50">
                            <span className="font-semibold text-[15px] text-brand-dark">
                                {importConfig.label ?? 'Impor Data'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex h-6 w-6 items-center justify-center rounded-full text-text-light hover:bg-slate-200 hover:text-brand-dark"
                            >
                                <CloseIcon className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col p-4.5 gap-4">
                            {guide ? (
                                <div className="flex flex-col gap-3 rounded-[6px] border border-amber-200 bg-amber-50 p-4">
                                    <div className="flex items-start gap-2.5">
                                        <AlertTriangleIcon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold text-sm text-amber-900">Urutan Pengisian Data (Penting)</span>
                                            <p className="text-xs leading-relaxed text-amber-800">
                                                {guide.description}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-1.5 pl-7.5 border-t border-amber-200/60 pt-2.5">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Harus Diisi Terlebih Dahulu:</span>
                                        <div className="flex flex-col gap-1">
                                            {guide.dependencies.map((dep, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs text-amber-800 font-medium">
                                                    <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                                                    {dep.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-xs text-text-light leading-relaxed">
                                    Silakan gunakan fitur ini untuk mengunggah daftar data secara masal melalui file Excel atau CSV.
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-semibold text-brand-dark">Langkah Impor:</span>
                                <div className="flex flex-col gap-2.5 text-xs text-text-light">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-brand-dark">1</span>
                                        <div className="flex-1">
                                            Unduh file template kolom tabel yang sesuai.
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleDownloadTemplate}
                                            className="inline-flex items-center gap-1.5 rounded-[4px] border border-brand-blue px-2.5 py-1 text-xs font-medium text-brand-blue hover:bg-brand-blue-light transition"
                                        >
                                            <DownloadIcon className="h-3.5 w-3.5" />
                                            Unduh Template
                                        </button>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-brand-dark">2</span>
                                        <div className="flex-1 pt-0.5">
                                            Salin data Accurate Anda ke kolom Excel template yang sudah diunduh, lalu simpan file.
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-brand-dark">3</span>
                                        <div className="flex-1 pt-0.5">
                                            Unggah file template yang sudah terisi di bawah ini untuk memproses impor data.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end border-t border-table-row-border p-4.5 bg-slate-50 gap-2">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="h-[36px] rounded-[4px] border border-border-input-hover-alt bg-white px-4 text-xs font-semibold text-brand-dark hover:bg-slate-50 transition"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                                className="inline-flex h-[36px] items-center gap-1.5 rounded-[4px] bg-brand-blue px-4.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-blue-darker transition disabled:opacity-75 disabled:pointer-events-none"
                            >
                                <UploadIcon className="h-4 w-4" />
                                Pilih & Unggah File
                            </button>
                        </div>
                    </div>
                </ModalBase>
            ) : null}
        </>
    );
}
