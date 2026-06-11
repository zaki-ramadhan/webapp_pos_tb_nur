import {
    createAttachmentDockAction,
    createDeleteDockAction,
    createDocumentDockAction,
    createMoreDockAction,
    createSaveDockAction,
} from '@/features/workspace/modules/shared/workspaceDockActions';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';

const todayDisplayDate = buildTodayDisplayDate();

const purchasePaymentCreateDockActions = [
    createSaveDockAction(),
    createDocumentDockAction(),
    createAttachmentDockAction({ itemId: 'upload', itemLabel: 'Tambah lampiran' }),
];

export const purchasePaymentDetailDockActions = [
    createSaveDockAction({ tone: 'muted', items: [] }),
    createDocumentDockAction(),
    createAttachmentDockAction(),
    createMoreDockAction(),
    createDeleteDockAction(),
];

const purchasePaymentTableRows = [];

const defaultPurchasePaymentDraft = {
    payee: [],
    bankAccounts: [],
    paymentAmount: '',
    paymentAmountPrefix: '',
    paymentAmountDisplay: '0',
    entryDate: todayDisplayDate,
    autoNumber: true,
    numberingType: 'Bank BCA IDR Jakarta (069-773-3993)',
    documentNumber: '',
    currency: '',
    invoiceSearch: '',
    invoices: [],
    invoiceTitle: 'Faktur',
    paymentMethod: 'Tunai',
    dueDatePph: '',
    notes: '',
    voided: false,
    branches: ['JAKARTA'],
    __branchId: 1,
    reconcileStatus: '',
    printStatus: '',
    paidWith: '',
    paidAt: '',
    footerPaymentValue: '0',
    footerInvoiceValue: '0',
    showSecondaryAmountButton: true,
    modal: null,
    dockActions: purchasePaymentCreateDockActions,
};

const purchasePaymentDetailRecords = {};

export const defaultPurchasePaymentConfig = {
    labels: {
        payee: 'Pembayaran ke',
        bank: 'Bank',
        paymentAmount: 'Nilai Pembayaran',
        documentNumber: 'No Bukti #',
        entryDate: 'Tgl Bayar',
        paymentMethod: 'Metode Bayar',
        dueDatePph: 'Jth Tempo PPh',
        notes: 'Keterangan',
        voided: 'V O I D',
        branch: 'Cabang',
        reconcileStatus: 'Terekonsiliasi',
        printStatus: 'Dicetak/email',
    },
    topActions: [],
    numberingOptions: ['Bank BCA IDR Jakarta (069-773-3993)'],
    payeePlaceholder: 'Cari/Pilih Pemasok...',
    bankPlaceholder: 'Cari/Pilih...',
    invoiceSearchPlaceholder: 'Cari/Pilih...',
    table: {
        createLabel: 'Tambah Pembayaran',
        refreshLabel: 'Muat ulang',
        filterButtonLabel: 'Filter lanjutan',
        searchPlaceholder: 'Cari...',
        pageValue: '9',
        columns: [
            { id: 'number', label: 'Nomor #', widthClassName: 'w-[220px]', align: 'left' },
            { id: 'date', label: 'Tanggal', widthClassName: 'w-[130px]', align: 'left' },
            { id: 'checkNumber', label: 'No. Cek', widthClassName: 'w-[160px]', align: 'left' },
            { id: 'checkDate', label: 'Tanggal Cek', widthClassName: 'w-[140px]', align: 'left' },
            { id: 'supplier', label: 'Pemasok', widthClassName: 'w-[26%]', align: 'left' },
            { id: 'bank', label: 'Bank', widthClassName: 'w-[30%]', align: 'left' },
            { id: 'notes', label: 'Keterangan', widthClassName: 'w-[24%]', align: 'left' },
            { id: 'paymentAmount', label: 'Nilai Pembayaran', widthClassName: 'w-[150px]', align: 'right' },
        ],
        rows: purchasePaymentTableRows,
        filters: [
            { id: 'date', rowKey: 'date', options: [{ value: 'all', label: 'Tanggal: Semua' }, { value: '11/02/2017', label: 'Tanggal: 11/02/2017' }] },
            { id: 'checkDate', rowKey: 'checkDate', options: [{ value: 'all', label: 'Tanggal Cek: Semua' }, { value: '11/02/2017', label: 'Tanggal Cek: 11/02/2017' }] },
            { id: 'method', rowKey: 'method', options: [{ value: 'all', label: 'Metode Bayar: Semua' }, { value: 'Tunai', label: 'Metode Bayar: Tunai' }, { value: 'Transfer Bank', label: 'Metode Bayar: Transfer Bank' }] },
            { id: 'bank', rowKey: 'bank', options: [{ value: 'all', label: 'Bank: Semua' }, { value: 'Bank BCA IDR Jakarta (069-773-3993)', label: 'Bank: Bank BCA IDR Jakarta' }, { value: 'Bank Mandiri IDR Jakarta (142-205-9324)', label: 'Bank: Bank Mandiri IDR Jakarta' }] },
            { id: 'supplier', rowKey: 'supplier', options: [{ value: 'all', label: 'Pembayaran ke: Semua' }, { value: 'PT. SGI', label: 'Pembayaran ke: PT. SGI' }, { value: 'Applus', label: 'Pembayaran ke: Applus' }] },
        ],
        downloadItems: [{ id: 'download-excel', label: 'Unduh Excel' }],
        printItems: [{ id: 'print-list', label: 'Cetak daftar pembayaran pembelian' }],
        settingsItems: [{ id: 'arrange-columns', label: 'Atur kolom' }],
    },
    sectionTabs: [
        { id: 'details', label: 'Faktur', icon: 'document' },
        { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
    ],
    detailSectionTabs: [
        { id: 'details', label: 'Faktur', icon: 'document' },
        { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
        { id: 'payment-info', label: 'Info pembayaran', icon: 'payment' },
    ],
    invoiceTable: {
        columns: [
            { id: 'spacer', label: '', kind: 'spacer', widthClassName: 'w-[38px]', align: 'center' },
            { id: 'number', label: 'No. Faktur', widthClassName: 'w-[52%]', align: 'left' },
            { id: 'date', label: 'Tgl Faktur', widthClassName: 'w-[120px]', align: 'left' },
            { id: 'total', label: 'Total Faktur', widthClassName: 'w-[150px]', align: 'right' },
            { id: 'outstanding', label: 'Terhutang', widthClassName: 'w-[150px]', align: 'right' },
            { id: 'pay', label: 'Bayar', widthClassName: 'w-[150px]', align: 'right' },
            { id: 'discount', label: 'Diskon', widthClassName: 'w-[150px]', align: 'right' },
            { id: 'payment', label: 'Pembayaran', widthClassName: 'w-[160px]', align: 'right' },
        ],
        emptyLabel: 'Belum ada data',
        minWidthClassName: 'min-w-[1200px]',
    },
    infoTitle: 'Info lainnya',
    paymentInfoTitle: 'Info Pembayaran',
    takeButtonLabel: 'Ambil',
    draft: defaultPurchasePaymentDraft,
    detailRecords: purchasePaymentDetailRecords,
};
