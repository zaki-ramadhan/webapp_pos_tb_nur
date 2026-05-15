import {
    createAttachmentDockAction,
    createDeleteDockAction,
    createDocumentDockAction,
    createMoreDockAction,
    createSaveDockAction,
} from '@/features/workspace/modules/shared/workspaceDockActions';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';

const todayDisplayDate = buildTodayDisplayDate();

const workOrderSectionTabs = [
    { id: 'details', label: 'Rincian Barang', icon: 'document' },
    { id: 'charges', label: 'Biaya Lainnya', icon: 'expense' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
    { id: 'work-info', label: 'Informasi Pekerjaan', icon: 'box' },
];

const workOrderListColumns = [
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[220px]', align: 'left' },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[130px]', align: 'left' },
    { id: 'customer', label: 'Pelanggan', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[44%]', align: 'left' },
    { id: 'status', label: 'Status', widthClassName: 'w-[160px]', align: 'left' },
];

const workOrderItemColumns = [
    { id: 'name', label: 'Nama Barang', widthClassName: 'w-[46%]', align: 'left' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'quantity', label: 'Kuantitas', widthClassName: 'w-[90px]', align: 'right' },
    { id: 'unit', label: 'Satuan', widthClassName: 'w-[90px]', align: 'left' },
    { id: 'total', label: 'Total', widthClassName: 'w-[170px]', align: 'right' },
];

const workOrderChargeColumns = [
    { id: 'name', label: 'Nama Biaya', widthClassName: 'w-[58%]', align: 'left' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[130px]', align: 'left' },
    { id: 'amount', label: 'Jumlah', widthClassName: 'w-[150px]', align: 'right' },
];

const createDockActions = [
    createSaveDockAction(),
    createDocumentDockAction({ label: 'Dokumen', itemId: 'linked-order', itemLabel: 'Buka pesanan terkait' }),
    createAttachmentDockAction({ itemId: 'add-attachment', itemLabel: 'Tambah lampiran' }),
    createMoreDockAction({ itemId: 'process-order', itemLabel: 'Proses pekerjaan pesanan' }),
];

const detailDockActions = [
    createSaveDockAction({ tone: 'muted', items: [] }),
    createDocumentDockAction({ label: 'Dokumen', itemId: 'linked-completion', itemLabel: 'Buka penyelesaian pesanan' }),
    createAttachmentDockAction(),
    createMoreDockAction(),
    createDeleteDockAction(),
];

const tableRows = [
    {
        id: 'JC.2017.01.00001',
        number: 'JC.2017.01.00001',
        date: '02/01/2017',
        customer: '',
        notes: '',
        status: 'Selesai',
        dateFilter: 'all',
        statusFilter: 'done',
    },
    {
        id: 'JC.2016.12.00001',
        number: 'JC.2016.12.00001',
        date: '07/12/2016',
        customer: '',
        notes: '',
        status: 'Selesai',
        dateFilter: 'all',
        statusFilter: 'done',
    },
];

function buildSerialNumbers(start, total, width = 9) {
    return Array.from({ length: total }, (_, index) => String(start + index).padStart(width, '0'));
}

const draftRecord = {
    autoNumber: true,
    numberingType: 'Pekerjaan Pesanan',
    documentNumber: '',
    date: todayDisplayDate,
    itemSearch: '',
    chargeSearch: '',
    customerReference: '',
    expenseAccounts: ['[115.000-98] Persediaan Dalam Proses'],
    varianceAccounts: ['[711.000-97] Biaya Selisih Pembiayaan Pesanan'],
    expenseAccountText: '[115.000-98] Persediaan Dalam Proses',
    varianceAccountText: '[711.000-97] Biaya Selisih Pembiayaan Pesanan',
    branches: ['JAKARTA'],
    notes: '',
    closeJob: false,
    showTotals: false,
    totalItemsAmount: '0',
    totalCostAmount: '0',
    grandTotal: '0',
    items: [],
    additionalCosts: [],
    workInformation: {
        addedItems: '0',
        addedCosts: '0',
        totalValue: '0',
        completionNumber: '',
        completionDate: '',
        status: '',
    },
    itemModal: {
        title: 'Rincian Barang',
        tabs: [
            { id: 'details', label: 'Rincian Barang' },
            { id: 'serials', label: 'No Seri/Produksi' },
            { id: 'info', label: 'Info lainnya' },
        ],
        deleteLabel: 'Hapus',
        submitLabel: 'Lanjut',
    },
    dockActions: createDockActions,
};

const detailRecords = {
    'JC.2017.01.00001': {
        autoNumber: false,
        numberingType: 'Pekerjaan Pesanan',
        documentNumber: 'JC.2017.01.00001',
        date: '02/01/2017',
        itemSearch: '',
        chargeSearch: '',
        customerReference: '',
        expenseAccounts: ['Persediaan Dalam Proses'],
        varianceAccounts: ['Biaya Selisih Pembiayaan Pesanan'],
        expenseAccountText: 'Persediaan Dalam Proses',
        varianceAccountText: 'Biaya Selisih Pembiayaan Pesanan',
        branches: ['JAKARTA'],
        notes: '',
        closeJob: true,
        showTotals: true,
        totalItemsAmount: '635,720,816.888878',
        totalCostAmount: '0',
        grandTotal: '635,720,816.888878',
        items: [
            {
                id: 'JC.2017.01.00001-item-1',
                name: 'Iphone 5 64 GB',
                code: '5164003',
                quantity: '98',
                unit: 'PCS',
                unitLookup: ['PCS'],
                warehouse: ['GD. JAKARTA'],
                department: [],
                notes: '',
                total: '631,065,816.888878',
                serialNumbers: buildSerialNumbers(71647138, 98),
            },
            {
                id: 'JC.2017.01.00001-item-2',
                name: 'Anti Gores Iphone 5',
                code: '9900012',
                quantity: '98',
                unit: 'PCS',
                unitLookup: ['PCS'],
                warehouse: ['GD. JAKARTA'],
                department: [],
                notes: '',
                total: '4,655,000',
                serialNumbers: [],
            },
        ],
        additionalCosts: [],
        workInformation: {
            addedItems: '0',
            addedCosts: '0',
            totalValue: '635,720,816.888878',
            completionNumber: 'RO.2017.02.00001',
            completionDate: '15/01/2017',
            status: 'Selesai',
        },
        dockActions: detailDockActions,
    },
    'JC.2016.12.00001': {
        autoNumber: false,
        numberingType: 'Pekerjaan Pesanan',
        documentNumber: 'JC.2016.12.00001',
        date: '07/12/2016',
        itemSearch: '',
        chargeSearch: '',
        customerReference: '',
        expenseAccounts: ['Persediaan Dalam Proses'],
        varianceAccounts: ['Biaya Selisih Pembiayaan Pesanan'],
        expenseAccountText: 'Persediaan Dalam Proses',
        varianceAccountText: 'Biaya Selisih Pembiayaan Pesanan',
        branches: ['JAKARTA'],
        notes: '',
        closeJob: true,
        showTotals: true,
        totalItemsAmount: '212,500,000',
        totalCostAmount: '0',
        grandTotal: '212,500,000',
        items: [
            {
                id: 'JC.2016.12.00001-item-1',
                name: 'Headset Wireless',
                code: '8800101',
                quantity: '50',
                unit: 'PCS',
                unitLookup: ['PCS'],
                warehouse: ['GD. JAKARTA'],
                department: [],
                notes: '',
                total: '212,500,000',
                serialNumbers: buildSerialNumbers(94230001, 50),
            },
        ],
        additionalCosts: [],
        workInformation: {
            addedItems: '0',
            addedCosts: '0',
            totalValue: '212,500,000',
            completionNumber: 'RO.2016.12.00001',
            completionDate: '20/12/2016',
            status: 'Selesai',
        },
        dockActions: detailDockActions,
    },
};

const defaultConfig = {
    labels: {
        date: 'Tanggal',
        documentNumber: 'No Batch #',
        customerReference: 'Referensi Pelanggan',
        expenseAccount: 'Akun Biaya',
        varianceAccount: 'Akun Selisih Biaya',
        branch: 'Cabang',
        notes: 'Keterangan',
        closeJob: 'Tutup Pekerjaan',
    },
    numberingOptions: ['Pekerjaan Pesanan'],
    favoriteButtonLabel: 'Favorit',
    processButtonLabel: 'Proses',
    takeButtonLabel: 'Ambil',
    itemSearchPlaceholder: 'Cari/Pilih Barang & Jasa...',
    chargeSearchPlaceholder: 'Cari/Pilih Akun Perkiraan...',
    itemSectionTitle: 'Rincian Barang',
    chargeSectionTitle: 'Biaya Lainnya',
    additionalInfoTitle: 'Info lainnya',
    workInfoTitle: 'Informasi Pekerjaan',
    table: {
        createLabel: 'Tambah Pekerjaan Pesanan',
        refreshLabel: 'Muat ulang',
        searchPlaceholder: 'Cari...',
        pageValue: '2',
        filters: [
            { id: 'date', label: 'Tanggal', value: 'all', options: [{ value: 'all', label: 'Semua' }] },
            {
                id: 'status',
                label: 'Status',
                value: 'all',
                options: [
                    { value: 'all', label: 'Semua' },
                    { value: 'done', label: 'Selesai' },
                ],
            },
        ],
        columns: workOrderListColumns,
        rows: tableRows,
        downloadItems: [{ id: 'export-list', label: 'Ekspor daftar' }],
        printItems: [{ id: 'print-list', label: 'Cetak daftar' }],
        settingsItems: [{ id: 'arrange-columns', label: 'Atur kolom' }],
    },
    sectionTabs: workOrderSectionTabs,
    itemTable: {
        columns: workOrderItemColumns,
        emptyLabel: 'Belum ada data',
    },
    chargeTable: {
        columns: workOrderChargeColumns,
        emptyLabel: 'Belum ada data',
    },
    draft: draftRecord,
    detailRecords,
};

function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function cloneItems(items = []) {
    return items.map((item) => ({
        ...item,
        unitLookup: cloneList(item.unitLookup ?? item.unit),
        warehouse: cloneList(item.warehouse),
        department: cloneList(item.department),
        serialNumbers: [...(item.serialNumbers ?? [])],
    }));
}

function cloneAdditionalCosts(rows = []) {
    return rows.map((row) => ({ ...row }));
}

function toNumericValue(value) {
    const normalizedValue = Number.parseFloat(String(value ?? '0').replace(/[^\d.-]/g, ''));

    return Number.isFinite(normalizedValue) ? normalizedValue : 0;
}

function buildItemCountLabel(items = []) {
    if (!items.length) {
        return 'Rincian Barang';
    }

    const totalQuantity = items.reduce((sum, item) => sum + toNumericValue(item.quantity), 0);

    return `${items.length} Barang (${totalQuantity})`;
}

export function buildWorkOrderConfig(pageConfig = {}) {
    return {
        ...defaultConfig,
        ...pageConfig,
        labels: {
            ...defaultConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
        numberingOptions: pageConfig.numberingOptions?.length ? pageConfig.numberingOptions : defaultConfig.numberingOptions,
        table: {
            ...defaultConfig.table,
            ...(pageConfig.table ?? {}),
            filters: pageConfig.table?.filters?.length ? pageConfig.table.filters : defaultConfig.table.filters,
            columns: pageConfig.table?.columns?.length ? pageConfig.table.columns : defaultConfig.table.columns,
            rows: pageConfig.table?.rows?.length ? pageConfig.table.rows : defaultConfig.table.rows,
            downloadItems: pageConfig.table?.downloadItems?.length ? pageConfig.table.downloadItems : defaultConfig.table.downloadItems,
            printItems: pageConfig.table?.printItems?.length ? pageConfig.table.printItems : defaultConfig.table.printItems,
            settingsItems: pageConfig.table?.settingsItems?.length ? pageConfig.table.settingsItems : defaultConfig.table.settingsItems,
        },
        sectionTabs: pageConfig.sectionTabs?.length ? pageConfig.sectionTabs : defaultConfig.sectionTabs,
        itemTable: {
            ...defaultConfig.itemTable,
            ...(pageConfig.itemTable ?? {}),
            columns: pageConfig.itemTable?.columns?.length ? pageConfig.itemTable.columns : defaultConfig.itemTable.columns,
        },
        chargeTable: {
            ...defaultConfig.chargeTable,
            ...(pageConfig.chargeTable ?? {}),
            columns: pageConfig.chargeTable?.columns?.length ? pageConfig.chargeTable.columns : defaultConfig.chargeTable.columns,
        },
        draft: {
            ...defaultConfig.draft,
            ...(pageConfig.draft ?? {}),
        },
        detailRecords: {
            ...defaultConfig.detailRecords,
            ...(pageConfig.detailRecords ?? {}),
        },
    };
}

export function buildWorkOrderRecord(row = {}, config = defaultConfig) {
    const detailRecord = config.detailRecords?.[row.id];
    const source = detailRecord
        ? {
              ...config.draft,
              ...detailRecord,
          }
        : {
              ...config.draft,
              autoNumber: false,
              documentNumber: row.number ?? '',
              date: row.date ?? config.draft.date,
              dockActions: detailDockActions,
          };
    const items = cloneItems(source.items ?? []);
    const additionalCosts = cloneAdditionalCosts(source.additionalCosts ?? []);

    return {
        ...source,
        expenseAccounts: cloneList(source.expenseAccounts),
        varianceAccounts: cloneList(source.varianceAccounts),
        branches: cloneList(source.branches),
        items,
        additionalCosts,
        itemCountLabel: source.itemCountLabel ?? buildItemCountLabel(items),
        dockActions: source.dockActions?.length ? source.dockActions : detailDockActions,
        itemModal: {
            ...config.draft.itemModal,
            ...(source.itemModal ?? {}),
        },
    };
}
