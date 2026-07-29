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

const inventoryAdjustmentSectionTabs = [
    { id: 'details', label: 'Rincian Barang', icon: 'document' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
];

const inventoryAdjustmentListColumns = [
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[200px]', align: 'left', noWrap: true },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left', noWrap: true },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[58%]', align: 'left' },
];

const inventoryAdjustmentDetailColumns = [
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
};

const baseInventoryAdjustmentConfig = {
    title: 'Penyesuaian Persediaan',
    newTitle: 'Penyesuaian Persediaan Baru',
    sectionTabs: inventoryAdjustmentSectionTabs,
    table: {
        columns: inventoryAdjustmentListColumns,
    },
    detailTable: {
        title: 'Rincian Barang',
        emptyLabel: 'Belum ada rincian barang yang ditambahkan.',
        columns: inventoryAdjustmentDetailColumns,
    },
    dockActions: {
        create: createDockActions,
        detail: detailDockActions,
    },
    formDefaults: draftRecord,
};

export function buildInventoryAdjustmentConfig(page) {
    const isNew = page.mode !== 'detail';

    return {
        ...baseInventoryAdjustmentConfig,
        id: page.id,
        title: isNew ? baseInventoryAdjustmentConfig.newTitle : (page.label || baseInventoryAdjustmentConfig.title),
        tabLabel: isNew ? 'Penyesuaian Persediaan' : (page.tabLabel || page.label || baseInventoryAdjustmentConfig.title),
        isNew,
        dockActions: isNew ? createDockActions : detailDockActions,
        formDefaults: {
            ...draftRecord,
            date: page.date || draftRecord.date,
        },
    };
}

export function buildInventoryAdjustmentRecord(baseRecord, config) {
    const rawItems = baseRecord?.items ?? config.formDefaults.items;

    return {
        ...config.formDefaults,
        ...baseRecord,
        items: cloneList(rawItems),
        itemCountLabel: buildItemCountLabel(rawItems, 'Rincian Barang'),
    };
}
