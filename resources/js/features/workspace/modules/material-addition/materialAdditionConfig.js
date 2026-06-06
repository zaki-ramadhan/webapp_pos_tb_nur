import { cloneList, buildItemCountLabel } from '@/features/workspace/modules/shared/configCloneUtils';
import {
    createAttachmentDockAction,
    createDeleteDockAction,
    createDocumentDockAction,
    createMoreDockAction,
    createSaveDockAction,
} from '@/features/workspace/modules/shared/workspaceDockActions';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';

const todayDisplayDate = buildTodayDisplayDate();

const materialAdditionSectionTabs = [
    { id: 'details', label: 'Rincian Barang', icon: 'document' },
    { id: 'charges', label: 'Biaya Lainnya', icon: 'payment' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
];

const materialAdditionListColumns = [
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'type', label: 'Tipe', widthClassName: 'w-[150px]', align: 'left' },
    { id: 'workOrderNumber', label: 'Pekerjaan Pesanan', widthClassName: 'w-[180px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[42%]', align: 'left' },
];

const materialAdditionItemColumns = [
    { id: 'name', label: 'Nama Barang', widthClassName: 'w-[56%]', align: 'left' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'quantity', label: 'Kuantitas', widthClassName: 'w-[100px]', align: 'right' },
    { id: 'unit', label: 'Satuan', widthClassName: 'w-[90px]', align: 'left' },
];

const materialAdditionChargeColumns = [
    { id: 'name', label: 'Nama Biaya', widthClassName: 'w-[58%]', align: 'left' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[130px]', align: 'left' },
    { id: 'amount', label: 'Jumlah', widthClassName: 'w-[150px]', align: 'right' },
];

const createDockActions = [
    createSaveDockAction(),
    createDocumentDockAction({ label: 'Dokumen', itemId: 'linked-document' }),
    createAttachmentDockAction({ itemId: 'add-attachment', itemLabel: 'Tambah lampiran' }),
    createMoreDockAction({ itemId: 'process-material-addition', itemLabel: 'Proses penambahan bahan baku' }),
];

const detailDockActions = [
    createSaveDockAction({ tone: 'muted', items: [] }),
    createDocumentDockAction({ label: 'Dokumen', itemId: 'linked-document' }),
    createAttachmentDockAction(),
    createMoreDockAction(),
    createDeleteDockAction(),
];

const draftRecord = {
    autoNumber: true,
    numberingType: 'Penambahan Bahan Baku',
    date: todayDisplayDate,
    type: 'Ambil Barang',
    workOrderNumber: '',
    itemSearch: '',
    chargeSearch: '',
    branches: ['JAKARTA'],
    notes: '',
    items: [],
    additionalCosts: [],
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

const detailRecords = {};

const defaultConfig = {
    labels: {
        date: 'Tanggal',
        type: 'Tipe',
        workOrderNumber: 'No Pekerjaan #',
        documentNumber: 'No Batch #',
        branch: 'Cabang',
        notes: 'Keterangan',
    },
    typeOptions: ['Ambil Barang', 'Kembalikan Barang'],
    numberingOptions: ['Penambahan Bahan Baku'],
    favoriteButtonLabel: 'Favorit',
    processButtonLabel: 'Proses',
    itemSearchPlaceholder: 'Cari/Pilih Barang & Jasa...',
    chargeSearchPlaceholder: 'Cari/Pilih Akun Perkiraan...',
    workOrderPlaceholder: 'Cari/Pilih...',
    additionalInfoTitle: 'Info lainnya',
    itemSectionTitle: 'Rincian Barang',
    chargeSectionTitle: 'Biaya Lainnya',
    table: {
        createLabel: 'Tambah Penambahan Bahan Baku',
        refreshLabel: 'Muat ulang',
        searchPlaceholder: 'Cari...',
        pageValue: '0',
        filters: [
            { id: 'date', label: 'Tanggal', value: 'all', options: [{ value: 'all', label: 'Semua' }] },
            { id: 'type', label: 'Tipe', value: 'all', options: [{ value: 'all', label: 'Semua' }] },
        ],
        columns: materialAdditionListColumns,
        rows: [],
        printItems: [{ id: 'print-list', label: 'Cetak daftar' }],
        settingsItems: [{ id: 'arrange-columns', label: 'Atur kolom' }],
    },
    sectionTabs: materialAdditionSectionTabs,
    itemTable: {
        columns: materialAdditionItemColumns,
        emptyLabel: 'Belum ada data',
    },
    chargeTable: {
        columns: materialAdditionChargeColumns,
        emptyLabel: 'Belum ada data',
    },
    draft: draftRecord,
    detailRecords,
};

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

export function buildMaterialAdditionConfig(pageConfig = {}) {
    return {
        ...defaultConfig,
        ...pageConfig,
        labels: {
            ...defaultConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
        typeOptions: pageConfig.typeOptions?.length ? pageConfig.typeOptions : defaultConfig.typeOptions,
        numberingOptions: pageConfig.numberingOptions?.length ? pageConfig.numberingOptions : defaultConfig.numberingOptions,
        table: {
            ...defaultConfig.table,
            ...(pageConfig.table ?? {}),
            filters: pageConfig.table?.filters?.length ? pageConfig.table.filters : defaultConfig.table.filters,
            columns: pageConfig.table?.columns?.length ? pageConfig.table.columns : defaultConfig.table.columns,
            rows: pageConfig.table?.rows?.length ? pageConfig.table.rows : defaultConfig.table.rows,
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

export function buildMaterialAdditionRecord(row = {}, config = defaultConfig) {
    const detailRecord = config.detailRecords?.[row.id];
    const source = detailRecord
        ? {
              ...config.draft,
              ...detailRecord,
          }
        : {
              ...config.draft,
              autoNumber: false,
              date: row.date ?? config.draft.date,
              type: row.type ?? config.draft.type,
              workOrderNumber: row.workOrderNumber ?? config.draft.workOrderNumber,
              notes: row.notes ?? config.draft.notes,
              dockActions: detailDockActions,
          };
    const items = cloneItems(source.items ?? []);
    const additionalCosts = cloneAdditionalCosts(source.additionalCosts ?? []);

    return {
        ...source,
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
