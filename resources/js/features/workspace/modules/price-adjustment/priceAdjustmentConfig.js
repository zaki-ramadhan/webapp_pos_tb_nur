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

const priceAdjustmentSectionTabs = [
    { id: 'details', label: 'Rincian Barang', icon: 'document' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
];

const priceAdjustmentListColumns = [
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[200px]', align: 'left', noWrap: true },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left', noWrap: true },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[58%]', align: 'left' },
];

const priceAdjustmentDetailColumns = [
    { id: 'name', label: 'Nama Barang', widthClassName: 'w-[60%]', align: 'left' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[130px]', align: 'center' },
    { id: 'adjustmentType', label: 'Tipe', widthClassName: 'w-[130px]', align: 'center' },
    { id: 'quantity', label: 'Kuantitas', widthClassName: 'w-[100px]', align: 'right' },
    { id: 'unit', label: 'Satuan', widthClassName: 'w-[90px]', align: 'left' },
];

const createDockActions = [
    createSaveDockAction(),
    createDocumentDockAction({ label: 'Dokumen' }),
    createAttachmentDockAction({ itemId: 'add-attachment', itemLabel: 'Tambah lampiran' }),
    createMoreDockAction({ itemId: 'duplicate', itemLabel: 'Duplikasi penyesuaian persediaan' }),
];

const detailDockActions = [
    createSaveDockAction({ tone: 'muted', items: [] }),
    createDocumentDockAction({ label: 'Dokumen' }),
    createAttachmentDockAction(),
    createMoreDockAction(),
    createDeleteDockAction(),
];

const draftRecord = {
    date: todayDisplayDate,
    autoNumber: true,
    numberingType: 'Penyesuaian Persediaan',
    documentNumber: '',
    itemSearch: '',
    detailMode: 'Rincian',
    copyItems: [{ id: 'copy-lines', label: 'Salin rincian barang' }],
    items: [],
    itemCountLabel: 'Rincian Barang',
    adjustmentAccount: [],
    notes: '',
    branches: [],
    totalValue: 'Rp 0',
    dockActions: createDockActions,
    itemModal: {
        title: 'Rincian Barang',
        tabs: [
            { id: 'details', label: 'Rincian Barang' },
            { id: 'info', label: 'Info Lainnya' },
        ],
        deleteLabel: 'Hapus',
        submitLabel: 'Lanjut',
    },
};

const detailRecords = {};

const defaultConfig = {
    labels: {
        date: 'Tanggal',
        documentNumber: 'No Penyesuaian #',
        adjustmentAccount: 'Akun Penyesuaian',
        notes: 'Keterangan',
        branch: 'Cabang',
    },
    numberingOptions: ['Penyesuaian Persediaan'],
    detailModeOptions: ['Rincian'],
    adjustmentTypeOptions: ['Penambahan', 'Pengurangan'],
    takeButtonLabel: 'Ambil',
    table: {
        createLabel: 'Tambah Penyesuaian Persediaan',
        refreshLabel: 'Muat ulang',
        searchPlaceholder: 'Cari...',
        searchWidthClassName: 'sm:w-[342px]',
        tableClassName: 'min-w-[1180px]',
        pageValue: '116',
        filterButtonLabel: 'Filter lanjutan',
        columns: priceAdjustmentListColumns,
        rows: [],
        filters: [
            {
                id: 'date',
                rowKey: 'dateFilter',
                options: [{ value: 'all', label: 'Tanggal: Semua' }],
            },
        ],
    },
    sectionTabs: priceAdjustmentSectionTabs,
    detailSearchPlaceholder: 'Cari/Pilih Barang & Jasa...',
    itemSectionTitle: 'Rincian Barang',
    itemTable: {
        columns: priceAdjustmentDetailColumns,
        emptyLabel: 'Belum ada data',
        minWidthClassName: 'min-w-[980px]',
    },
    additionalInfoTitle: 'Info lainnya',
    draft: draftRecord,
    detailRecords,
};

function cloneItems(items = []) {
    return items.map((item) => ({
        ...item,
        unitLookup: cloneList(item.unitLookup),
        warehouse: cloneList(item.warehouse),
        department: cloneList(item.department),
    }));
}

function mergeTableConfig(baseTable, pageTable = {}) {
    return {
        ...baseTable,
        ...pageTable,
        columns: pageTable.columns?.length ? pageTable.columns : baseTable.columns,
        rows: pageTable.rows?.length ? pageTable.rows : baseTable.rows,
        filters: pageTable.filters?.length ? pageTable.filters : baseTable.filters,
    };
}

export function buildInventoryAdjustmentConfig(pageConfig = {}) {
    return {
        ...defaultConfig,
        ...pageConfig,
        labels: {
            ...defaultConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
        numberingOptions: pageConfig.numberingOptions?.length ? pageConfig.numberingOptions : defaultConfig.numberingOptions,
        detailModeOptions: pageConfig.detailModeOptions?.length ? pageConfig.detailModeOptions : defaultConfig.detailModeOptions,
        adjustmentTypeOptions: pageConfig.adjustmentTypeOptions?.length
            ? pageConfig.adjustmentTypeOptions
            : defaultConfig.adjustmentTypeOptions,
        sectionTabs: pageConfig.sectionTabs?.length ? pageConfig.sectionTabs : defaultConfig.sectionTabs,
        table: mergeTableConfig(defaultConfig.table, pageConfig.table ?? {}),
        itemTable: {
            ...defaultConfig.itemTable,
            ...(pageConfig.itemTable ?? {}),
            columns: pageConfig.itemTable?.columns?.length ? pageConfig.itemTable.columns : defaultConfig.itemTable.columns,
        },
        draft: {
            ...defaultConfig.draft,
            ...(pageConfig.draft ?? {}),
            adjustmentAccount: cloneList(pageConfig.draft?.adjustmentAccount ?? defaultConfig.draft.adjustmentAccount),
            branches: cloneList(pageConfig.draft?.branches ?? defaultConfig.draft.branches),
            items: cloneItems(pageConfig.draft?.items ?? defaultConfig.draft.items),
            dockActions: pageConfig.draft?.dockActions?.length ? pageConfig.draft.dockActions : defaultConfig.draft.dockActions,
            itemModal: {
                ...defaultConfig.draft.itemModal,
                ...(pageConfig.draft?.itemModal ?? {}),
            },
        },
        detailRecords: {
            ...defaultConfig.detailRecords,
            ...(pageConfig.detailRecords ?? {}),
        },
    };
}

export function buildInventoryAdjustmentRecord(row = {}, config = defaultConfig) {
    const detailRecord = config.detailRecords?.[row.id];
    const source = detailRecord
        ? {
              ...config.draft,
              ...detailRecord,
          }
        : {
              ...config.draft,
              date: row.date ?? config.draft.date,
              autoNumber: false,
              documentNumber: row.number ?? '',
              notes: row.notes ?? '',
              branches: ['JAKARTA'],
              dockActions: detailDockActions,
          };
    const items = cloneItems(source.items ?? []);

    return {
        ...source,
        adjustmentAccount: cloneList(source.adjustmentAccount),
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

export const buildPriceAdjustmentConfig = buildInventoryAdjustmentConfig;
export const buildPriceAdjustmentRecord = buildInventoryAdjustmentRecord;
