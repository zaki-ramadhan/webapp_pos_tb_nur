export const supplierTransferConfig = {
    controls: [
        {
            id: 'paymentStatus',
            type: 'select',
            value: 'unpaid',
            options: [{ value: 'unpaid', label: 'Belum Dibayar' }],
            wrapperClassName: 'w-full sm:w-[260px]',
            className: 'w-full',
        },
        {
            id: 'period',
            type: 'select',
            value: 'last-7-days',
            options: [{ value: 'last-7-days', label: '7 hari terakhir' }],
            wrapperClassName: 'w-full sm:w-[260px]',
            className: 'w-full',
        },
    ],
    toolbarActions: [
        { id: 'reload', type: 'icon', icon: 'link', label: 'Muat ulang transfer pemasok' },
        { id: 'settings', type: 'icon', icon: 'settings', label: 'Pengaturan transfer pemasok' },
    ],
    search: {
        value: '',
        placeholder: 'Cari Nomor/Nama bank/Rek..',
    },
    table: {
        columns: [
            { id: 'selected', label: '', kind: 'checkbox', widthClassName: 'w-[44px]', align: 'center' },
            { id: 'transferDueDate', label: 'Tgl Batas Transfer', widthClassName: 'w-[190px]', align: 'center' },
            { id: 'supplier', label: 'Pemasok', widthClassName: 'w-[220px]', align: 'center' },
            { id: 'paymentMethod', label: 'Metode Bayar', widthClassName: 'w-[220px]', align: 'center' },
            { id: 'bank', label: 'Bank', widthClassName: 'w-[180px]', align: 'center' },
            { id: 'supplierBankNumber', label: 'No Rekening Pemasok', widthClassName: 'w-[220px]', align: 'center' },
            { id: 'accountName', label: 'A/n Rekening', widthClassName: 'w-[200px]', align: 'center' },
            { id: 'paymentAmount', label: 'Nilai Pembayaran', widthClassName: 'w-[180px]', align: 'center' },
            { id: 'process', label: 'Proses', widthClassName: 'w-[140px]', align: 'center' },
        ],
        rows: [],
        emptyLabel: 'Belum ada data',
        tableClassName: 'min-w-[1650px]',
        searchKeys: ['transferDueDate', 'supplier', 'paymentMethod', 'bank', 'supplierBankNumber', 'accountName', 'paymentAmount'],
    },
    emptyState: {
        icon: 'document',
        description: 'Klik tombol "Refresh" untuk memperbarui data',
    },
    footer: {
        totalLabel: 'Total',
        totalValue: 'Rp. 0 (0)',
        selectValue: '',
        selectOptions: [{ value: '', label: '-- Pilih salah satu --' }],
        actionLabel: 'Export/Bayar',
    },
};
