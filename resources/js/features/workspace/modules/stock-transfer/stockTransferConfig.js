import {
    createAttachmentDockAction,
    createDeleteDockAction,
    createDocumentDockAction,
    createMoreDockAction,
    createSaveDockAction,
} from '@/features/workspace/modules/shared/workspaceDockActions';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';

const todayDisplayDate = buildTodayDisplayDate();

const stockTransferSectionTabs = [
    { id: 'details', label: 'Rincian Barang', icon: 'document' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
];

const stockTransferListColumns = [
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'process', label: 'Tipe Proses', widthClassName: 'w-[180px]', align: 'left' },
    { id: 'routeWarehouse', label: 'Gudang Tujuan/Dari', widthClassName: 'w-[220px]', align: 'left' },
    { id: 'warehouse', label: 'Gudang', widthClassName: 'w-[220px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[28%]', align: 'left' },
    { id: 'shipmentStatus', label: 'Status Pengiriman', widthClassName: 'w-[220px]', align: 'left' },
];

const stockTransferDetailColumns = [
    { id: 'name', label: 'Nama Barang', widthClassName: 'w-[40%]', align: 'left' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[170px]', align: 'left' },
    { id: 'quantity', label: 'Kuan...', widthClassName: 'w-[90px]', align: 'right' },
    { id: 'unit', label: 'Satuan', widthClassName: 'w-[90px]', align: 'left' },
    { id: 'category', label: 'Kategori Barang', widthClassName: 'w-[180px]', align: 'left' },
];

const createDockActions = [
    createSaveDockAction(),
    createDocumentDockAction({ label: 'Dokumen' }),
    createAttachmentDockAction({ itemId: 'add-attachment', itemLabel: 'Tambah lampiran' }),
    createMoreDockAction({ itemId: 'duplicate', itemLabel: 'Duplikasi pemindahan barang' }),
];

const detailDockActions = [
    createSaveDockAction({ tone: 'muted', items: [] }),
    createDocumentDockAction({ label: 'Dokumen' }),
    createAttachmentDockAction(),
    createMoreDockAction(),
    createDeleteDockAction(),
];

const tableRows = [
    { id: 'IT.2017.01.00006', number: 'IT.2017.01.00006', date: '17/01/2017', process: 'Terima Barang', routeWarehouse: 'GD. JAKARTA', warehouse: 'GD. SURABAYA', notes: '-', shipmentStatus: '-', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2017.01.00005', number: 'IT.2017.01.00005', date: '15/01/2017', process: 'Kirim Barang', routeWarehouse: 'GD. SURABAYA', warehouse: 'GD. JAKARTA', notes: '', shipmentStatus: 'Diterima Seluruhnya', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2017.01.00004', number: 'IT.2017.01.00004', date: '13/01/2017', process: 'Terima Barang', routeWarehouse: 'GD. JAKARTA', warehouse: 'GD. SURABAYA', notes: '-', shipmentStatus: '-', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2017.01.00003', number: 'IT.2017.01.00003', date: '10/01/2017', process: 'Kirim Barang', routeWarehouse: 'GD. SURABAYA', warehouse: 'GD. JAKARTA', notes: '', shipmentStatus: 'Diterima Seluruhnya', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2017.01.00002', number: 'IT.2017.01.00002', date: '07/01/2017', process: 'Terima Barang', routeWarehouse: 'GD. JAKARTA', warehouse: 'GD. SURABAYA', notes: '-', shipmentStatus: '-', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2017.01.00001', number: 'IT.2017.01.00001', date: '05/01/2017', process: 'Kirim Barang', routeWarehouse: 'GD. SURABAYA', warehouse: 'GD. JAKARTA', notes: '', shipmentStatus: 'Diterima Seluruhnya', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2016.12.00004.1', number: 'IT.2016.12.00004.1', date: '15/12/2016', process: 'Terima Barang', routeWarehouse: 'GD. SURABAYA', warehouse: 'GD. JAKARTA', notes: '', shipmentStatus: '-', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2016.12.00003', number: 'IT.2016.12.00003', date: '13/12/2016', process: 'Kirim Barang', routeWarehouse: 'GD. JAKARTA', warehouse: 'GD. SURABAYA', notes: '', shipmentStatus: 'Diterima Seluruhnya', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2016.12.00002', number: 'IT.2016.12.00002', date: '13/12/2016', process: 'Terima Barang', routeWarehouse: 'GD. JAKARTA', warehouse: 'GD. SURABAYA', notes: '', shipmentStatus: '-', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2016.12.00001', number: 'IT.2016.12.00001', date: '11/12/2016', process: 'Kirim Barang', routeWarehouse: 'GD. SURABAYA', warehouse: 'GD. JAKARTA', notes: 'up to bapak khodir', shipmentStatus: 'Diterima Sebagian', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2016.11.00006', number: 'IT.2016.11.00006', date: '15/11/2016', process: 'Terima Barang', routeWarehouse: 'GD. JAKARTA', warehouse: 'GD. SURABAYA', notes: '-', shipmentStatus: '-', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2016.11.00005', number: 'IT.2016.11.00005', date: '13/11/2016', process: 'Kirim Barang', routeWarehouse: 'GD. SURABAYA', warehouse: 'GD. JAKARTA', notes: '', shipmentStatus: 'Diterima Seluruhnya', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2016.11.00004', number: 'IT.2016.11.00004', date: '07/11/2016', process: 'Terima Barang', routeWarehouse: 'GD. JAKARTA', warehouse: 'GD. SURABAYA', notes: '-', shipmentStatus: '-', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2016.11.00003', number: 'IT.2016.11.00003', date: '05/11/2016', process: 'Kirim Barang', routeWarehouse: 'GD. SURABAYA', warehouse: 'GD. JAKARTA', notes: '', shipmentStatus: 'Diterima Seluruhnya', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2016.11.00002', number: 'IT.2016.11.00002', date: '05/11/2016', process: 'Terima Barang', routeWarehouse: 'GD. JAKARTA', warehouse: 'GD. SURABAYA', notes: '-', shipmentStatus: '-', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2016.11.00001', number: 'IT.2016.11.00001', date: '02/11/2016', process: 'Kirim Barang', routeWarehouse: 'GD. SURABAYA', warehouse: 'GD. JAKARTA', notes: '', shipmentStatus: 'Diterima Seluruhnya', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2016.10.00006', number: 'IT.2016.10.00006', date: '22/10/2016', process: 'Terima Barang', routeWarehouse: 'GD. JAKARTA', warehouse: 'GD. SURABAYA', notes: '-', shipmentStatus: '-', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2016.10.00005', number: 'IT.2016.10.00005', date: '20/10/2016', process: 'Kirim Barang', routeWarehouse: 'GD. SURABAYA', warehouse: 'GD. JAKARTA', notes: '', shipmentStatus: 'Diterima Seluruhnya', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2016.10.00004', number: 'IT.2016.10.00004', date: '15/10/2016', process: 'Terima Barang', routeWarehouse: 'GD. JAKARTA', warehouse: 'GD. SURABAYA', notes: '-', shipmentStatus: '-', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2016.10.00003', number: 'IT.2016.10.00003', date: '11/10/2016', process: 'Kirim Barang', routeWarehouse: 'GD. SURABAYA', warehouse: 'GD. JAKARTA', notes: '', shipmentStatus: 'Diterima Seluruhnya', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2016.10.00002', number: 'IT.2016.10.00002', date: '08/10/2016', process: 'Terima Barang', routeWarehouse: 'GD. JAKARTA', warehouse: 'GD. SURABAYA', notes: '-', shipmentStatus: '-', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
    { id: 'IT.2016.10.00001', number: 'IT.2016.10.00001', date: '05/10/2016', process: 'Kirim Barang', routeWarehouse: 'GD. SURABAYA', warehouse: 'GD. JAKARTA', notes: '', shipmentStatus: 'Diterima Seluruhnya', dateFilter: 'all', routeFilter: 'all', statusFilter: 'all', warehouseFilter: 'all', processFilter: 'all' },
];

function buildSerialNumbers(start, total) {
    return Array.from({ length: total }, (_, index) => String(start + index));
}

const draftRecord = {
    process: 'Kirim Barang',
    autoNumber: true,
    numberingType: 'Pindah Barang',
    documentNumber: '',
    referenceNumber: '',
    warehouse: [],
    counterpartWarehouse: [],
    counterpartWarehouseLabel: 'Gudang Tujuan',
    date: todayDisplayDate,
    itemSearch: '',
    notes: '',
    branches: ['JAKARTA'],
    printedEmail: '',
    items: [],
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
    'IT.2017.01.00006': {
        process: 'Terima Barang',
        autoNumber: false,
        numberingType: 'Pindah Barang',
        documentNumber: 'IT.2017.01.00006',
        referenceNumber: 'IT.2017.01.00005',
        warehouse: ['GD. SURABAYA'],
        counterpartWarehouse: ['GD. JAKARTA'],
        counterpartWarehouseLabel: 'Gudang Pengirim',
        date: '17/01/2017',
        notes: '',
        branches: ['JAKARTA'],
        printedEmail: 'Belum cetak/email',
        items: [
            {
                id: 'IT.2017.01.00006-item-1',
                name: 'Iphone 5 S 16 GB',
                code: '5216001',
                quantity: '35',
                unit: 'PCS',
                unitLookup: ['PCS'],
                category: 'Handphone',
                serialNumbers: buildSerialNumbers(94823401, 35),
                notes: '',
            },
        ],
        dockActions: detailDockActions,
    },
};

const defaultConfig = {
    labels: {
        process: 'Proses',
        warehouse: 'Gudang',
        counterpartWarehouse: 'Gudang Tujuan',
        documentNumber: 'No. Pemindahan #',
        date: 'Tanggal',
        notes: 'Keterangan',
        branch: 'Cabang',
        printedEmail: 'Dicetak/email',
    },
    processOptions: ['Kirim Barang', 'Terima Barang'],
    numberingOptions: ['Pindah Barang'],
    takeButtonLabel: 'Ambil',
    table: {
        createLabel: 'Tambah Pemindahan Barang',
        refreshLabel: 'Muat ulang',
        searchPlaceholder: 'Cari...',
        pageValue: '22',
        filters: [
            { id: 'date', label: 'Tanggal', value: 'all', options: [{ value: 'all', label: 'Semua' }] },
            { id: 'route', label: 'Gudang Tujuan/Dari', value: 'all', options: [{ value: 'all', label: 'Semua' }] },
            { id: 'shipmentStatus', label: 'Status Pengiriman', value: 'all', options: [{ value: 'all', label: 'Semua' }] },
            { id: 'warehouse', label: 'Gudang', value: 'all', options: [{ value: 'all', label: 'Semua' }] },
            { id: 'process', label: 'Tipe Proses', value: 'all', options: [{ value: 'all', label: 'Semua' }] },
        ],
        columns: stockTransferListColumns,
        rows: tableRows,
        transferItems: [{ id: 'open-linked', label: 'Buka pemindahan terkait' }],
        settingsItems: [{ id: 'arrange-columns', label: 'Atur kolom' }],
    },
    sectionTabs: stockTransferSectionTabs,
    detailSearchPlaceholder: 'Cari/Pilih Barang & Jasa...',
    itemSectionTitle: 'Rincian Barang',
    itemTable: {
        columns: stockTransferDetailColumns,
        emptyLabel: 'Belum ada data',
    },
    additionalInfoTitle: 'Info lainnya',
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
        serialNumbers: [...(item.serialNumbers ?? [])],
    }));
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

export function buildStockTransferConfig(pageConfig = {}) {
    return {
        ...defaultConfig,
        ...pageConfig,
        labels: {
            ...defaultConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
        processOptions: pageConfig.processOptions?.length ? pageConfig.processOptions : defaultConfig.processOptions,
        numberingOptions: pageConfig.numberingOptions?.length ? pageConfig.numberingOptions : defaultConfig.numberingOptions,
        table: {
            ...defaultConfig.table,
            ...(pageConfig.table ?? {}),
            filters: pageConfig.table?.filters?.length ? pageConfig.table.filters : defaultConfig.table.filters,
            columns: pageConfig.table?.columns?.length ? pageConfig.table.columns : defaultConfig.table.columns,
            rows: pageConfig.table?.rows?.length ? pageConfig.table.rows : defaultConfig.table.rows,
            transferItems: pageConfig.table?.transferItems?.length ? pageConfig.table.transferItems : defaultConfig.table.transferItems,
            settingsItems: pageConfig.table?.settingsItems?.length ? pageConfig.table.settingsItems : defaultConfig.table.settingsItems,
        },
        sectionTabs: pageConfig.sectionTabs?.length ? pageConfig.sectionTabs : defaultConfig.sectionTabs,
        itemTable: {
            ...defaultConfig.itemTable,
            ...(pageConfig.itemTable ?? {}),
            columns: pageConfig.itemTable?.columns?.length ? pageConfig.itemTable.columns : defaultConfig.itemTable.columns,
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

export function buildStockTransferRecord(row = {}, config = defaultConfig) {
    const detailRecord = config.detailRecords?.[row.id];
    const source = detailRecord
        ? {
              ...config.draft,
              ...detailRecord,
          }
        : {
              ...config.draft,
              process: row.process ?? config.draft.process,
              autoNumber: false,
              documentNumber: row.number ?? '',
              date: row.date ?? config.draft.date,
              warehouse: row.warehouse ? [row.warehouse] : config.draft.warehouse,
              counterpartWarehouse: row.routeWarehouse ? [row.routeWarehouse] : config.draft.counterpartWarehouse,
              dockActions: detailDockActions,
          };
    const items = cloneItems(source.items ?? []);

    return {
        ...source,
        warehouse: cloneList(source.warehouse),
        counterpartWarehouse: cloneList(source.counterpartWarehouse),
        branches: cloneList(source.branches),
        items,
        itemCountLabel: source.itemCountLabel ?? buildItemCountLabel(items),
        dockActions: source.dockActions?.length ? source.dockActions : detailDockActions,
        itemModal: {
            ...config.draft.itemModal,
            ...(source.itemModal ?? {}),
        },
    };
}
