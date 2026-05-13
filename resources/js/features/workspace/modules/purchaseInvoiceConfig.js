import {
    buildSalesDocumentRecord,
    mergeSalesDocumentConfigWithPage,
    sharedDetailDockActions,
} from '@/features/workspace/modules/salesOrderConfig';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';
import {
    createAttachmentDockAction,
    createDocumentDockAction,
    createMoreDockAction,
    createSaveDockAction,
} from '@/features/workspace/modules/shared/workspaceDockActions';

const todayDisplayDate = buildTodayDisplayDate();

const purchaseInvoiceSectionTabs = [
    { id: 'details', label: 'Rincian Barang', icon: 'document' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
    { id: 'additional-costs', label: 'Biaya Lainnya', icon: 'payment' },
    { id: 'order-info', label: 'Informasi Faktur', icon: 'receipt' },
];

const purchaseInvoiceListColumns = [
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'billNumber', label: 'No Faktur #', widthClassName: 'w-[150px]', align: 'left' },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'customerShort', label: 'Pemasok', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[48%]', align: 'left' },
    { id: 'status', label: 'Status', widthClassName: 'w-[150px]', align: 'left' },
    { id: 'age', label: 'Umur (hr)', widthClassName: 'w-[100px]', align: 'right' },
    { id: 'total', label: 'Total', widthClassName: 'w-[160px]', align: 'right' },
];

const purchaseInvoiceItemColumns = [
    { id: 'spacer', label: '', kind: 'spacer', widthClassName: 'w-[38px]', align: 'center' },
    { id: 'name', label: 'Nama Barang', widthClassName: 'w-[56%]', align: 'left' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[120px]', align: 'center' },
    { id: 'quantity', label: 'Kuantitas', widthClassName: 'w-[92px]', align: 'right' },
    { id: 'unit', label: 'Satuan', widthClassName: 'w-[82px]', align: 'center' },
    { id: 'price', label: '@Harga', widthClassName: 'w-[108px]', align: 'right' },
    { id: 'discount', label: 'Diskon', widthClassName: 'w-[82px]', align: 'right' },
    { id: 'total', label: 'Total Harga', widthClassName: 'w-[132px]', align: 'right' },
];

const purchaseInvoiceCostColumns = [
    { id: 'spacer', label: '', kind: 'spacer', widthClassName: 'w-[38px]', align: 'center' },
    { id: 'name', label: 'Nama Biaya', widthClassName: 'w-[58%]', align: 'left' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[120px]', align: 'center' },
    { id: 'amount', label: 'Jumlah', widthClassName: 'w-[120px]', align: 'right' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[22%]', align: 'left' },
];

const purchaseInvoiceTableRows = [
    { id: 'PI.2017.01.00015', number: 'PI.2017.01.00015', billNumber: 'APL-491817', date: '18/01/2017', customer: 'Applus', customerShort: 'Applus', notes: '', status: 'Belum Lunas', age: '3387', total: '208,947', printedStatus: 'all' },
    { id: 'PI.2017.01.00014', number: 'PI.2017.01.00014', billNumber: 'APL-032417', date: '18/01/2017', customer: 'Applus', customerShort: 'Applus', notes: '', status: 'Belum Lunas', age: '3387', total: '214,569', printedStatus: 'all' },
    { id: 'PI.2017.01.00016', number: 'PI.2017.01.00016', billNumber: 'CVGP-53972417', date: '15/01/2017', customer: 'CV Ganda Putra', customerShort: 'CV Ganda Putra', notes: '', status: 'Belum Lunas', age: '3390', total: '2,259,860,000', printedStatus: 'all' },
    { id: 'PI.2017.01.00011', number: 'PI.2017.01.00011', billNumber: 'SS-2483217', date: '15/01/2017', customer: 'SAMSANG', customerShort: 'SAMSANG', notes: '', status: 'Belum Lunas', age: '3390', total: '77,885', printedStatus: 'all' },
    { id: 'PI.2017.01.00012', number: 'PI.2017.01.00012', billNumber: 'SS-0342817', date: '13/01/2017', customer: 'SAMSANG', customerShort: 'SAMSANG', notes: '', status: 'Belum Lunas', age: '3392', total: '391,590.99', printedStatus: 'all' },
    { id: 'PI.2017.01.00013', number: 'PI.2017.01.00013', billNumber: 'APL-342817', date: '12/01/2017', customer: 'Applus', customerShort: 'Applus', notes: '', status: 'Belum Lunas', age: '3393', total: '225,192', printedStatus: 'all' },
    { id: 'PI.2017.01.00008', number: 'PI.2017.01.00008', billNumber: 'APL-0927317', date: '12/01/2017', customer: 'Applus', customerShort: 'Applus', notes: '', status: 'Belum Lunas', age: '3393', total: '318,117.8', printedStatus: 'all' },
    { id: 'PI.2017.01.00009', number: 'PI.2017.01.00009', billNumber: 'CVGB-94317', date: '11/01/2017', customer: 'CV Ganda Putra', customerShort: 'CV Ganda Putra', notes: '', status: 'Belum Lunas', age: '3394', total: '936,320,000', printedStatus: 'all' },
    { id: 'PI.2017.01.00010', number: 'PI.2017.01.00010', billNumber: 'SS-324717', date: '10/01/2017', customer: 'SAMSANG', customerShort: 'SAMSANG', notes: '', status: 'Belum Lunas', age: '3395', total: '58,422', printedStatus: 'all' },
    { id: 'PI.2017.01.00001', number: 'PI.2017.01.00001', billNumber: 'BC01100117', date: '05/01/2017', customer: 'Beautiful Cellular', customerShort: 'Beautiful Cellular', notes: '', status: 'Belum Lunas', age: '3400', total: '42,180,000', printedStatus: 'all' },
    { id: 'PI.2017.01.00007', number: 'PI.2017.01.00007', billNumber: 'CVGP-092417', date: '03/01/2017', customer: 'CV Ganda Putra', customerShort: 'CV Ganda Putra', notes: '', status: 'Belum Lunas', age: '3402', total: '4,750,000', printedStatus: 'all' },
    { id: 'PI.2017.01.00006', number: 'PI.2017.01.00006', billNumber: 'APL-0948217', date: '03/01/2017', customer: 'Applus', customerShort: 'Applus', notes: '', status: 'Belum Lunas', age: '3402', total: '103,950', printedStatus: 'all' },
    { id: 'PI.2017.01.00004', number: 'PI.2017.01.00004', billNumber: 'APL-023717', date: '02/01/2017', customer: 'Applus', customerShort: 'Applus', notes: '', status: 'Belum Lunas', age: '3403', total: '95,040', printedStatus: 'all' },
    { id: 'PI.2017.01.00003', number: 'PI.2017.01.00003', billNumber: '#BS-SAC/01247/...', date: '02/01/2017', customer: 'PT Bersih Selalu', customerShort: 'PT Bersih Selalu', notes: '', status: 'Belum Lunas', age: '3403', total: '11,542,500', printedStatus: 'all' },
    { id: 'PI.2017.01.00002', number: 'PI.2017.01.00002', billNumber: 'AS-01002317', date: '02/01/2017', customer: 'ASMUS', customerShort: 'ASMUS', notes: '', status: 'Belum Lunas', age: '3403', total: '87,000', printedStatus: 'all' },
    { id: 'PI.2017.01.00005', number: 'PI.2017.01.00005', billNumber: 'AP0923817', date: '01/01/2017', customer: 'Applus', customerShort: 'Applus', notes: '', status: 'Belum Lunas', age: '3404', total: '205,200', printedStatus: 'all' },
    { id: 'PI.2016.12.00003', number: 'PI.2016.12.00003', billNumber: 'SS-120913812', date: '20/12/2016', customer: 'SAMSANG', customerShort: 'SAMSANG', notes: '', status: 'Belum Lunas', age: '3416', total: '65,325', printedStatus: 'all' },
    { id: 'PI.2016.12.00001', number: 'PI.2016.12.00001', billNumber: 'SGI/201765501', date: '19/12/2016', customer: 'PT. SGI', customerShort: 'PT. SGI', notes: '', status: 'Lunas', age: '54', total: '88,320,000', printedStatus: 'all' },
    { id: 'PI.2016.12.00004', number: 'PI.2016.12.00004', billNumber: 'SS-42316', date: '16/12/2016', customer: 'SAMSANG', customerShort: 'SAMSANG', notes: '', status: 'Belum Lunas', age: '3420', total: '42,496', printedStatus: 'all' },
];

const purchaseInvoiceCreateDockActions = [
    createSaveDockAction(),
    createDocumentDockAction(),
    createAttachmentDockAction({ itemId: 'upload', itemLabel: 'Tambah lampiran' }),
    createMoreDockAction({ itemId: 'duplicate', itemLabel: 'Duplikasi faktur pembelian' }),
];

const defaultPurchaseInvoiceDraft = {
    customer: [],
    entryDate: todayDisplayDate,
    autoNumber: true,
    numberingType: 'Faktur Pembelian',
    documentNumber: '',
    currency: '',
    exchangeRate: '',
    exchangeRateLabel: '',
    exchangeRatePrefix: 'Rp',
    secondaryExchangeRate: '',
    secondaryExchangeRatePrefix: 'Pjk',
    itemSearch: '',
    items: [],
    itemCountLabel: 'Rincian Barang',
    preInvoice: false,
    paymentTerms: [],
    bankAccounts: [],
    purchaseOrderNumber: '',
    address: '',
    branches: ['JAKARTA'],
    notes: '',
    taxEnabled: false,
    taxIncluded: false,
    shippingDate: todayDisplayDate,
    shippingMethod: [],
    fob: [],
    costSearch: '',
    additionalCosts: [],
    summary: [
        ['Total', 'Rp 0'],
        ['Uang Muka', 'Rp 0'],
        ['Pembayaran', 'Rp 0'],
        ['Retur', 'Rp 0'],
        ['Utang', 'Rp 0'],
        ['Utang Pajak', 'Rp 0'],
        ['Status', '-'],
        ['Dicetak/email', 'Belum cetak/email'],
    ],
    summaryStatusTone: 'warning',
    processedBy: null,
    approvalStamp: '',
    processStamp: '',
    processStampTone: 'gray',
    showSecondaryHeaderAction: false,
    showProcessButton: false,
    showProcessButtonOnCreate: true,
    processDisabled: false,
    subtotal: '0',
    discountValue: '0',
    discountPrefix: '',
    taxLabel: '',
    taxValue: '',
    total: '0',
    itemModal: {
        title: 'Rincian Barang',
        tabs: [
            { id: 'details', label: 'Rincian Barang' },
            { id: 'info', label: 'Info lainnya' },
        ],
        values: {
            code: '',
            name: '',
            quantity: '',
            unit: [],
            price: '',
            discountPercent: '',
            discountValue: '0',
            total: '0',
            taxChecked: false,
            taxLabel: 'PPN 10 %',
            warehouse: [],
            salesPerson: [],
            department: [],
            notes: '',
        },
    },
    dockActions: purchaseInvoiceCreateDockActions,
};

const purchaseInvoiceDetailRecords = {
    'PI.2017.01.00015': {
        customer: ['[VJKT-0002] Applus'],
        entryDate: '18/01/2017',
        autoNumber: false,
        numberingType: 'Faktur Pembelian',
        documentNumber: 'PI.2017.01.00015',
        currency: 'USD',
        exchangeRate: '12,456',
        exchangeRateLabel: '1 USD=XXX IDR',
        exchangeRatePrefix: 'Rp',
        secondaryExchangeRate: '12,455',
        secondaryExchangeRatePrefix: 'Pjk',
        itemSearch: '',
        items: [
            {
                id: 'PI.2017.01.00015-item-1',
                name: 'Iphone 6 S Plus 64 GB',
                code: '6364002',
                quantity: '241',
                unit: 'PCS',
                price: '867',
                discount: '0',
                total: '208,947',
            },
        ],
        itemCountLabel: '1 Barang (241)',
        preInvoice: false,
        paymentTerms: ['C.O.D'],
        bankAccounts: [],
        purchaseOrderNumber: 'APL-491817',
        address: 'Parkway, AL8 6HGEW',
        branches: ['JAKARTA'],
        notes: '',
        taxEnabled: false,
        taxIncluded: false,
        shippingDate: '11/02/2017',
        shippingMethod: [],
        fob: [],
        costSearch: '',
        additionalCosts: [],
        summary: [
            ['Total', '$ 208,947'],
            ['Uang Muka', '$ 0'],
            ['Pembayaran', '$ 0'],
            ['Retur', '$ 0'],
            ['Utang', '$ 208,947'],
            ['Utang Pajak', 'Rp 0'],
            ['Status', 'Belum Lunas'],
            ['Dicetak/email', 'Belum cetak/email'],
        ],
        summaryStatusTone: 'warning',
        processedBy: null,
        approvalStamp: '',
        processStamp: 'BELUM\nLUNAS',
        processStampTone: 'gray',
        showSecondaryHeaderAction: false,
        showProcessButton: true,
        showProcessButtonOnCreate: false,
        processDisabled: false,
        subtotal: '$ 208,947',
        discountValue: '0',
        discountPrefix: '$',
        taxLabel: '',
        taxValue: '',
        total: '$ 208,947',
        itemModal: {
            title: 'Rincian Barang',
            tabs: [
                { id: 'details', label: 'Rincian Barang' },
                { id: 'info', label: 'Info lainnya' },
            ],
            values: {
                code: '6364002',
                name: 'Iphone 6 S Plus 64 GB',
                quantity: '241',
                unit: ['PCS'],
                price: '867',
                discountPercent: '',
                discountValue: '0',
                total: '$ 208,947',
                taxChecked: false,
                taxLabel: 'PPN 10 %',
                warehouse: ['GD. JAKARTA'],
                salesPerson: [],
                department: [],
                notes: '',
            },
        },
        dockActions: sharedDetailDockActions,
    },
};

const defaultPurchaseInvoiceConfig = {
    labels: {
        customer: 'Pemasok',
        entryDate: 'Tanggal',
        documentNumber: 'No Form #',
        preInvoice: 'Tagihan Dimuka',
        paymentTerms: 'Syarat Pembayaran',
        purchaseOrderNumber: 'No Faktur #',
        address: 'Alamat',
        branch: 'Cabang',
        notes: 'Keterangan',
        tax: 'Pajak',
        shippingDate: 'Tgl Pengiriman',
        shippingMethod: 'Pengiriman',
        fob: 'FOB',
        exchangeRate: 'Kurs',
    },
    numberingOptions: ['Faktur Pembelian'],
    customerPlaceholder: 'Cari/Pilih Pemasok...',
    customerSearchLabel: 'Cari pemasok',
    table: {
        createLabel: 'Tambah Faktur Pembelian',
        refreshLabel: 'Muat ulang',
        filterButtonLabel: 'Filter lanjutan',
        searchPlaceholder: 'Cari...',
        pageValue: '56',
        columns: purchaseInvoiceListColumns,
        rows: purchaseInvoiceTableRows,
        filters: [
            { id: 'date', rowKey: 'date', options: [{ value: 'all', label: 'Tanggal: Semua' }, { value: '18/01/2017', label: 'Tanggal: 18/01/2017' }] },
            { id: 'customer', rowKey: 'customer', options: [{ value: 'all', label: 'Pemasok: Semua' }, { value: 'Applus', label: 'Pemasok: Applus' }, { value: 'CV Ganda Putra', label: 'Pemasok: CV Ganda Putra' }] },
            { id: 'status', rowKey: 'status', options: [{ value: 'all', label: 'Status: Semua' }, { value: 'Belum Lunas', label: 'Status: Belum Lunas' }, { value: 'Lunas', label: 'Status: Lunas' }] },
            { id: 'printed', rowKey: 'printedStatus', options: [{ value: 'all', label: 'Sudah dicetak: Semua' }, { value: 'all', label: 'Sudah dicetak: Semua' }] },
        ],
        downloadItems: [{ id: 'download-excel', label: 'Unduh Excel' }],
        printItems: [{ id: 'print-list', label: 'Cetak daftar faktur pembelian' }],
        settingsItems: [{ id: 'arrange-columns', label: 'Atur kolom' }],
    },
    sectionTabs: purchaseInvoiceSectionTabs,
    itemSearchPlaceholder: 'Cari/Pilih Barang & Jasa...',
    itemSectionTitle: 'Rincian Barang',
    itemTable: {
        columns: purchaseInvoiceItemColumns,
        emptyLabel: 'Belum ada data',
        minWidthClassName: 'min-w-[1080px]',
    },
    costSearchPlaceholder: 'Cari/Pilih Akun Perkiraan...',
    additionalCostsTitle: 'Biaya Lainnya',
    costTable: {
        columns: purchaseInvoiceCostColumns,
        emptyLabel: 'Belum ada data',
    },
    additionalInfoTitle: 'Info lainnya',
    taxInfoTitle: 'Info Pajak',
    shippingInfoTitle: 'Info Pengiriman',
    extraInfoTitle: 'Info Tambahan',
    orderInfoTitle: 'Informasi Faktur',
    processedByTitle: 'Diproses Oleh',
    processedByEmptyLabel: 'Belum ada transaksi lanjutan.',
    showSummarySecondarySection: false,
    showPreInvoiceOption: true,
    preInvoiceOptionLabel: 'Ya (Mendahului Terima Barang)',
    showAddressPinButton: true,
    showPaymentTerms: true,
    showPurchaseOrderNumber: true,
    showTaxInfo: true,
    showShippingInfo: true,
    showExtraInfo: true,
    showFobInShippingInfo: false,
    additionalInfoLookupFields: [
        {
            type: 'lookup',
            label: 'Rekening Bank',
            valueKey: 'bankAccounts',
            placeholder: 'Rekening Bank',
            searchLabel: 'Cari rekening bank',
        },
    ],
    itemModal: {
        enabled: true,
    },
    secondaryActionLabel: '',
    showSecondaryHeaderAction: false,
    showFooter: true,
    initialSectionId: 'details',
    detailInitialSectionId: 'details',
    takeButtonLabel: 'Ambil',
    processButtonLabel: 'Proses',
    showProcessButtonOnCreate: true,
    draft: defaultPurchaseInvoiceDraft,
    detailRecords: purchaseInvoiceDetailRecords,
};

function ensurePurchaseInvoiceSectionTabs(sectionTabs = []) {
    const normalizedTabs = Array.isArray(sectionTabs) ? [...sectionTabs] : [];

    for (const requiredTab of purchaseInvoiceSectionTabs) {
        if (!normalizedTabs.some((tab) => tab.id === requiredTab.id)) {
            normalizedTabs.push(requiredTab);
        }
    }

    return normalizedTabs;
}

function buildPurchaseInvoiceSummary(row = {}, record = {}) {
    if (record.summary?.length) {
        return record.summary;
    }

    const totalValue = record.total || `$ ${row.total ?? '0'}`;

    return [
        ['Total', totalValue],
        ['Uang Muka', '$ 0'],
        ['Pembayaran', '$ 0'],
        ['Retur', '$ 0'],
        ['Utang', totalValue],
        ['Utang Pajak', 'Rp 0'],
        ['Status', row.status ?? 'Belum Lunas'],
        ['Dicetak/email', 'Belum cetak/email'],
    ];
}

export function buildPurchaseInvoiceConfig(pageConfig = {}) {
    const config = mergeSalesDocumentConfigWithPage(defaultPurchaseInvoiceConfig, pageConfig);

    return {
        ...config,
        sectionTabs: ensurePurchaseInvoiceSectionTabs(config.sectionTabs),
    };
}

export function buildPurchaseInvoiceRecord(row = {}, config) {
    const record = buildSalesDocumentRecord(row, config.draft, config.detailRecords, {
        customerPrefix: '[VJKT-0002]',
        includeAdvanceSummary: false,
        includePrintedSummary: false,
        dockActions: sharedDetailDockActions,
        showProcessButton: true,
        processStamp: 'BELUM\nLUNAS',
        approvalStamp: '',
        processedBy: null,
    });

    const currency = record.currency || row.currency || 'USD';
    const currencyPrefix = currency === 'USD' ? '$' : 'Rp';
    const totalValue = row.total ? `${currencyPrefix} ${row.total}` : (record.total || `${currencyPrefix} 0`);

    return {
        ...record,
        purchaseOrderNumber: row.billNumber ?? record.purchaseOrderNumber ?? '',
        summary: buildPurchaseInvoiceSummary(row, {
            ...record,
            total: totalValue,
        }),
        summaryStatusTone: record.summaryStatusTone ?? 'warning',
        showSecondaryHeaderAction: false,
        showProcessButton: true,
        showProcessButtonOnCreate: false,
        processDisabled: row.status === 'Lunas',
        processStamp: row.status === 'Lunas' ? 'LUNAS' : (record.processStamp || 'BELUM\nLUNAS'),
        processStampTone: row.status === 'Lunas' ? 'green' : (record.processStampTone ?? 'gray'),
        subtotal: record.subtotal || totalValue,
        discountPrefix: record.discountPrefix || currencyPrefix,
        total: record.total || totalValue,
        dockActions: row.id ? sharedDetailDockActions : (record.dockActions?.length ? record.dockActions : purchaseInvoiceCreateDockActions),
    };
}
