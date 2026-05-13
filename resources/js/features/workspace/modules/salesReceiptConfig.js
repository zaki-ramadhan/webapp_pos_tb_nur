import {
    createAttachmentDockAction,
    createDeleteDockAction,
    createDocumentDockAction,
    createMoreDockAction,
    createSaveDockAction,
} from '@/features/workspace/modules/shared/workspaceDockActions';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';

const todayDisplayDate = buildTodayDisplayDate();

const salesReceiptTopActions = [
    {
        id: 'settings',
        label: 'Pengaturan',
        icon: 'settings',
        tone: 'outline',
    },
    {
        id: 'tips',
        label: 'Petunjuk',
        icon: 'idea',
        tone: 'warning',
    },
];

const salesReceiptSectionTabs = [
    { id: 'details', label: 'Faktur', icon: 'document' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
];

const salesReceiptListColumns = [
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[220px]', align: 'left' },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'checkNumber', label: 'No. Cek', widthClassName: 'w-[150px]', align: 'left' },
    { id: 'checkDate', label: 'Tanggal Cek', widthClassName: 'w-[130px]', align: 'left' },
    { id: 'customerShort', label: 'Pelanggan', widthClassName: 'w-[320px]', align: 'left' },
    { id: 'bank', label: 'Bank', widthClassName: 'w-[360px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[28%]', align: 'left' },
    { id: 'useCredit', label: 'Pakai Kredit', widthClassName: 'w-[130px]', align: 'left' },
    { id: 'paymentAmount', label: 'Nilai Pembayaran', widthClassName: 'w-[160px]', align: 'right' },
];

const salesReceiptInvoiceColumns = [
    { id: 'spacer', label: '', widthClassName: 'w-[38px]', align: 'center' },
    { id: 'invoiceNumber', label: 'No. Faktur', widthClassName: 'w-[260px]', align: 'left' },
    { id: 'invoiceDate', label: 'Tgl Faktur', widthClassName: 'w-[100px]', align: 'left' },
    { id: 'invoiceTotal', label: 'Total Faktur', widthClassName: 'w-[150px]', align: 'right' },
    { id: 'outstanding', label: 'Terhutang', widthClassName: 'w-[150px]', align: 'right' },
    { id: 'paid', label: 'Bayar', widthClassName: 'w-[150px]', align: 'right' },
    { id: 'discount', label: 'Diskon', widthClassName: 'w-[130px]', align: 'right' },
    { id: 'payment', label: 'Pembayaran', widthClassName: 'w-[150px]', align: 'right' },
];

const draftDockActions = [
    createSaveDockAction(),
    createDocumentDockAction(),
    createAttachmentDockAction({ itemId: 'upload', itemLabel: 'Tambah lampiran' }),
];

const detailDockActions = [
    createSaveDockAction({ tone: 'muted', items: [] }),
    createDocumentDockAction(),
    createAttachmentDockAction({ itemId: 'upload', itemLabel: 'Tambah lampiran' }),
    createMoreDockAction(),
    createDeleteDockAction(),
];

const salesReceiptTableRows = [
    { id: '111.102-01.2017.02.00002', number: '111.102-01.2017.02.00002', date: '10/02/2017', checkNumber: 'BRI00001', checkDate: '24/02/2017', customer: 'Pelanggan Umum - Jakarta', customerShort: 'Pelanggan Umum - Jakarta', bank: 'Bank BCA IDR Jakarta (069-773-3993)', notes: '', useCredit: 'Tidak', paymentAmount: '33,600,000' },
    { id: '111.101-02.2017.02.00001', number: '111.101-02.2017.02.00001', date: '10/02/2017', checkNumber: '', checkDate: '10/02/2017', customer: 'Pelanggan Umum - Jakarta', customerShort: 'Pelanggan Umum - Jakarta', bank: 'Kas Besar Kantor Jakarta', notes: '', useCredit: 'Tidak', paymentAmount: '6,600,000' },
    { id: '111.202-01.2017.01.00003', number: '111.202-01.2017.01.00003', date: '10/01/2017', checkNumber: '', checkDate: '10/01/2017', customer: 'PT Kassakki Indo Baja', customerShort: 'PT Kassakki Indo Baja', bank: 'Bank BCA IDR Surabaya (388-308-3993)', notes: '', useCredit: 'Tidak', paymentAmount: '794,000' },
    { id: '111.102-01.2016.12.00003', number: '111.102-01.2016.12.00003', date: '13/12/2016', checkNumber: '', checkDate: '13/12/2016', customer: 'Cinema Phone Cellular', customerShort: 'Cinema Phone Cellular', bank: 'Bank BCA IDR Jakarta (069-773-3993)', notes: '', useCredit: 'Tidak', paymentAmount: '15,960,000' },
    { id: '111.102-01.2016.12.00002', number: '111.102-01.2016.12.00002', date: '13/12/2016', checkNumber: '', checkDate: '13/12/2016', customer: 'Cinema Phone Cellular', customerShort: 'Cinema Phone Cellular', bank: 'Bank BCA IDR Jakarta (069-773-3993)', notes: '', useCredit: 'Tidak', paymentAmount: '10,000,000' },
    { id: '111.102-01.2016.12.00001', number: '111.102-01.2016.12.00001', date: '13/12/2016', checkNumber: '', checkDate: '13/12/2016', customer: 'Abadi Phone Center', customerShort: 'Abadi Phone Center', bank: 'Bank BCA IDR Jakarta (069-773-3993)', notes: 'Sisanya dua minggu kemudian.', useCredit: 'Tidak', paymentAmount: '10,000,000' },
    { id: '111.102-01.2016.11.00002', number: '111.102-01.2016.11.00002', date: '30/11/2016', checkNumber: '', checkDate: '30/11/2016', customer: 'Abadi Phone Center', customerShort: 'Abadi Phone Center', bank: 'Bank BCA IDR Jakarta (069-773-3993)', notes: '', useCredit: 'Tidak', paymentAmount: '33,500,000' },
    { id: '111.102-03.2016.11.00001', number: '111.102-03.2016.11.00001', date: '20/11/2016', checkNumber: '', checkDate: '20/11/2016', customer: 'PT CIRCLE PHONE', customerShort: 'PT CIRCLE PHONE', bank: 'Bank BCA SGD Jakarta (157-375-3993)', notes: '', useCredit: 'Tidak', paymentAmount: '10,730' },
    { id: '111.102-01.2016.10.00003', number: '111.102-01.2016.10.00003', date: '30/10/2016', checkNumber: '', checkDate: '30/10/2016', customer: 'Abadi Phone Center', customerShort: 'Abadi Phone Center', bank: 'Bank BCA IDR Jakarta (069-773-3993)', notes: '', useCredit: 'Tidak', paymentAmount: '2,484,000' },
    { id: '111.201-01.2017.02.00001', number: '111.201-01.2017.02.00001', date: '20/10/2016', checkNumber: 'CA 99675', checkDate: '20/10/2016', customer: 'Pelanggan Umum - Surabaya', customerShort: 'Pelanggan Umum - Surabaya', bank: 'Kas Kecil Kantor Surabaya', notes: '', useCredit: 'Tidak', paymentAmount: '2,640,000' },
];

const salesReceiptDraft = {
    customer: [],
    bankAccounts: [],
    entryDate: todayDisplayDate,
    autoNumber: true,
    numberingType: 'Bank BCA IDR Jakarta (069-773-3993)',
    documentNumber: '',
    currency: '',
    paymentAmount: '0',
    invoiceSearch: '',
    invoices: [],
    paymentMethod: 'Tunai',
    checkNumber: '',
    checkDate: '',
    voided: false,
    branches: ['JAKARTA'],
    notes: '',
    reconcileStatus: '',
    printStatus: '',
    amountButtons: ['refresh', 'stack'],
    dockActions: draftDockActions,
};

const salesReceiptDetailRecords = {
    '111.102-01.2017.02.00002': {
        customer: ['[CJKT-0001] Pelanggan Umum - Jakarta'],
        bankAccounts: ['Bank BCA IDR Jakarta (069-773-3993)'],
        entryDate: '10/02/2017',
        autoNumber: false,
        numberingType: 'Bank BCA IDR Jakarta (069-773-3993)',
        documentNumber: '111.102-01.2017.02.00002',
        currency: 'IDR',
        paymentAmount: '33,600,000',
        invoiceSearch: '',
        invoices: [
            {
                id: 'SI.2016.10.00004',
                invoiceNumber: 'SI.2016.10.00004',
                invoiceDate: '11/10/2016',
                invoiceTotal: 'Rp 26,000,000',
                outstanding: 'Rp 6,000,000',
                paid: 'Rp 16,000,000',
                discount: 'Rp 0',
                payment: 'Rp 16,000,000',
                modal: {
                    invoiceNumber: 'SI.2016.10.00004',
                    invoiceDate: '11/10/2016',
                    outstanding: 'Rp 6,000,000',
                    payment: '16,000,000',
                    discountAccount: [],
                    discountAmount: '',
                    discountNotes: '',
                    department: [],
                    discountRows: [],
                },
            },
            {
                id: 'SI.2017.02.00005',
                invoiceNumber: 'SI.2017.02.00005',
                invoiceDate: '10/02/2017',
                invoiceTotal: 'Rp 17,600,000',
                outstanding: 'Rp 0',
                paid: 'Rp 17,600,000',
                discount: 'Rp 0',
                payment: 'Rp 17,600,000',
                modal: {
                    invoiceNumber: 'SI.2017.02.00005',
                    invoiceDate: '10/02/2017',
                    outstanding: 'Rp 0',
                    payment: '17,600,000',
                    discountAccount: [],
                    discountAmount: '',
                    discountNotes: '',
                    department: [],
                    discountRows: [],
                },
            },
        ],
        paymentMethod: 'Cek/Giro',
        checkNumber: 'BRI00001',
        checkDate: '24/02/2017',
        voided: false,
        branches: ['JAKARTA'],
        notes: '',
        reconcileStatus: 'Belum',
        printStatus: 'Belum cetak/email',
        amountButtons: ['refresh'],
        dockActions: detailDockActions,
    },
};

export const defaultSalesReceiptConfig = {
    topActions: salesReceiptTopActions,
    labels: {
        customer: 'Terima dari',
        bank: 'Bank',
        paymentAmount: 'Nilai Pembayaran',
        documentNumber: 'No Bukti #',
        entryDate: 'Tgl Bayar',
        paymentMethod: 'Metode Bayar',
        checkDate: 'Tanggal Cek',
        voided: 'V O I D',
        branch: 'Cabang',
        notes: 'Keterangan',
        reconcileStatus: 'Terekonsiliasi',
        printStatus: 'Dicetak/email',
    },
    numberingOptions: ['Bank BCA IDR Jakarta (069-773-3993)'],
    table: {
        createLabel: 'Tambah Penerimaan Penjualan',
        refreshLabel: 'Muat ulang',
        filterButtonLabel: 'Filter lanjutan',
        searchPlaceholder: 'Cari...',
        pageValue: '10',
        columns: salesReceiptListColumns,
        rows: salesReceiptTableRows,
        filters: [
            { id: 'date', rowKey: 'date', options: [{ value: 'all', label: 'Tanggal: Semua' }, { value: '10/02/2017', label: 'Tanggal: 10/02/2017' }] },
            { id: 'checkDate', rowKey: 'checkDate', options: [{ value: 'all', label: 'Tanggal Cek: Semua' }, { value: '24/02/2017', label: 'Tanggal Cek: 24/02/2017' }] },
            { id: 'paymentMethod', rowKey: 'paymentMethod', options: [{ value: 'all', label: 'Metode Bayar: Semua' }, { value: 'Tunai', label: 'Metode Bayar: Tunai' }, { value: 'Cek/Giro', label: 'Metode Bayar: Cek/Giro' }] },
            { id: 'bank', rowKey: 'bank', options: [{ value: 'all', label: 'Bank: Semua' }, { value: 'Bank BCA IDR Jakarta (069-773-3993)', label: 'Bank: Bank BCA IDR Jakarta (069-773-3993)' }] },
            { id: 'customer', rowKey: 'customer', options: [{ value: 'all', label: 'Terima dari: Semua' }, { value: 'Pelanggan Umum - Jakarta', label: 'Terima dari: Pelanggan Umum - Jakarta' }] },
        ],
        downloadItems: [{ id: 'download-excel', label: 'Unduh Excel' }, { id: 'download-pdf', label: 'Unduh PDF' }],
        printItems: [{ id: 'print-list', label: 'Cetak daftar penerimaan penjualan' }],
        settingsItems: [{ id: 'arrange-columns', label: 'Atur kolom' }],
    },
    sectionTabs: salesReceiptSectionTabs,
    invoiceTable: {
        columns: salesReceiptInvoiceColumns,
        emptyLabel: 'Belum ada data',
    },
    draft: salesReceiptDraft,
    detailRecords: salesReceiptDetailRecords,
};

function mergeSalesReceiptConfig(baseConfig, pageConfig = {}) {
    return {
        ...baseConfig,
        ...pageConfig,
        topActions: pageConfig.topActions ?? baseConfig.topActions,
        labels: {
            ...baseConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
        table: {
            ...baseConfig.table,
            ...(pageConfig.table ?? {}),
            columns: pageConfig.table?.columns ?? baseConfig.table.columns,
            rows: pageConfig.table?.rows ?? baseConfig.table.rows,
            filters: pageConfig.table?.filters ?? baseConfig.table.filters,
            downloadItems: pageConfig.table?.downloadItems ?? baseConfig.table.downloadItems,
            printItems: pageConfig.table?.printItems ?? baseConfig.table.printItems,
            settingsItems: pageConfig.table?.settingsItems ?? baseConfig.table.settingsItems,
        },
        sectionTabs: pageConfig.sectionTabs ?? baseConfig.sectionTabs,
        invoiceTable: {
            ...baseConfig.invoiceTable,
            ...(pageConfig.invoiceTable ?? {}),
            columns: pageConfig.invoiceTable?.columns ?? baseConfig.invoiceTable.columns,
        },
        draft: {
            ...baseConfig.draft,
            ...(pageConfig.draft ?? {}),
        },
        detailRecords: {
            ...baseConfig.detailRecords,
            ...(pageConfig.detailRecords ?? {}),
        },
    };
}

export function buildSalesReceiptConfig(pageConfig = {}) {
    return mergeSalesReceiptConfig(defaultSalesReceiptConfig, pageConfig);
}

export function buildSalesReceiptRecord(row = {}) {
    const detailRecord = salesReceiptDetailRecords[row.id];

    if (detailRecord) {
        return {
            ...salesReceiptDraft,
            ...detailRecord,
        };
    }

    return {
        ...salesReceiptDraft,
        customer: row.customer ? [`[CJKT-0001] ${row.customer}`] : [],
        bankAccounts: row.bank ? [row.bank] : [],
        entryDate: row.date ?? salesReceiptDraft.entryDate,
        autoNumber: false,
        documentNumber: row.number ?? '',
        paymentAmount: row.paymentAmount ?? '0',
        paymentMethod: row.checkNumber ? 'Cek/Giro' : 'Tunai',
        checkNumber: row.checkNumber ?? '',
        checkDate: row.checkDate ?? '',
        notes: row.notes ?? '',
        dockActions: detailDockActions,
        amountButtons: ['refresh'],
    };
}
