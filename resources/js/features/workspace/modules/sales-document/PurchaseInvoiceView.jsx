import { useMemo } from 'react';

import { buildPurchaseInvoiceConfig, buildPurchaseInvoiceRecord } from '@/features/workspace/modules/sales-document/purchaseInvoiceConfig';
import SalesDocumentView from '@/features/workspace/modules/sales-document/SalesDocumentView';

export default function PurchaseInvoiceView({ page, mode, activeLevel2Tab, level2Tabs = [], onOpenContent, onOpenDetail }) {
    const isPurchaseOrder = page.id === 'purchase-order';

    const config = useMemo(() => {
        const baseConfig = buildPurchaseInvoiceConfig(page.purchaseInvoice);
        if (isPurchaseOrder) {
            return {
                ...baseConfig,
                labels: {
                    ...baseConfig.labels,
                    documentNumber: 'Nomor #',
                },
                showPurchaseOrderNumber: false,
                numberingOptions: ['Pesanan Pembelian'],
                headerSelectLookupField: null,
                takeOptions: [
                    'Barang perlu dipesan',
                    'Barang per pemasok',
                    'Permintaan',
                    'Pesanan penjualan',
                ],
                processOptions: [
                    'Faktur',
                    'Uang muka',
                ],
                table: {
                    ...baseConfig.table,
                    createLabel: 'Tambah Pesanan Pembelian',
                    columns: [
                        { id: 'number', label: 'Nomor #', widthClassName: 'w-[200px]', align: 'left' },
                        { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left' },
                        { id: 'customerShort', label: 'Pemasok', widthClassName: 'w-[220px]', align: 'left' },
                        { id: 'notes', label: 'Keterangan', widthClassName: 'w-[40%]', align: 'left' },
                        { id: 'status', label: 'Status', widthClassName: 'w-[150px]', align: 'left' },
                        { id: 'total', label: 'Total', widthClassName: 'w-[160px]', align: 'right' },
                    ],
                    filters: [
                        {
                            id: 'date',
                            rowKey: 'date',
                            options: [
                                { value: 'all', label: 'Tanggal: Semua' },
                            ],
                        },
                        {
                            id: 'customer',
                            rowKey: 'customer',
                            options: [
                                { value: 'all', label: 'Pemasok: Semua' },
                            ],
                        },
                        {
                            id: 'status',
                            rowKey: 'status',
                            options: [
                                { value: 'all', label: 'Status: Semua' },
                                { value: 'Belum Diproses', label: 'Status: Belum Diproses' },
                                { value: 'Diproses', label: 'Status: Diproses' },
                                { value: 'Selesai', label: 'Status: Selesai' },
                            ],
                        },
                    ],
                },
            };
        }
        return baseConfig;
    }, [page.purchaseInvoice, isPurchaseOrder]);

    const buildRecord = useMemo(() => (row = {}) => buildPurchaseInvoiceRecord(row, config), [config]);

    return (
        <SalesDocumentView
            pageId={page.id}
            config={config}
            buildRecord={buildRecord}
            mode={mode}
            activeLevel2Tab={activeLevel2Tab}
            level2Tabs={level2Tabs}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    );
}
