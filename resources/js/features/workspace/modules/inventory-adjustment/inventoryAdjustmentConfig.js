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
    { id: 'number', label: 'Nomor', widthClassName: 'w-[200px]', align: 'left', noWrap: true },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left', noWrap: true },
    { id: 'notes', label: 'Keterangan', widthClassName: 'min-w-[240px] w-full', align: 'left' },
];

const inventoryAdjustmentDetailColumns = [
    { id: 'name', label: 'Nama Barang', widthClassName: 'min-w-[200px] w-full', align: 'left' },
    { id: 'code', label: 'Kode Barang', widthClassName: 'w-[130px]', align: 'center' },
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
    notes: '',
    branches: [],
    totalValue: 'Rp 0',
};

const baseInventoryAdjustmentConfig = {
    title: 'Penyesuaian Persediaan',
    newTitle: 'Penyesuaian Persediaan Baru',
    additionalInfoTitle: 'Informasi Tambahan',
    labels: {
        date: 'Tanggal',
        documentNumber: 'No. Penyesuaian',
        notes: 'Keterangan',
    },
    numberingOptions: ['Penyesuaian Persediaan', 'Manual'],
    adjustmentTypeOptions: ['Pengurangan Stok', 'Penambahan Stok', 'Penyesuaian Nilai'],
    sectionTabs: inventoryAdjustmentSectionTabs,
    table: {
        columns: inventoryAdjustmentListColumns,
    },
    detailTable: {
        title: 'Rincian Barang',
        emptyLabel: 'Belum ada data',
        columns: inventoryAdjustmentDetailColumns,
    },
    itemTable: {
        emptyLabel: 'Belum ada data',
        columns: inventoryAdjustmentDetailColumns,
    },
    dockActions: {
        create: createDockActions,
        detail: detailDockActions,
    },
    formDefaults: draftRecord,
};

export function buildInventoryAdjustmentConfig(page = {}) {
    const isNew = page?.mode !== 'detail';
    const isPriceAdjustment = page?.id === 'price-adjustment';

    return {
        ...baseInventoryAdjustmentConfig,
        id: page?.id,
        adjustmentTypeOptions: isPriceAdjustment
            ? ['Harga', 'Diskon (%)']
            : baseInventoryAdjustmentConfig.adjustmentTypeOptions,
        title: isNew
            ? (isPriceAdjustment ? 'Penyesuaian Harga Baru' : baseInventoryAdjustmentConfig.newTitle)
            : (page?.label || (isPriceAdjustment ? 'Penyesuaian Harga' : baseInventoryAdjustmentConfig.title)),
        tabLabel: isNew
            ? (isPriceAdjustment ? 'Penyesuaian Harga' : 'Penyesuaian Persediaan')
            : (page?.tabLabel || page?.label || (isPriceAdjustment ? 'Penyesuaian Harga' : baseInventoryAdjustmentConfig.title)),
        isNew,
        dockActions: isNew ? createDockActions : detailDockActions,
        formDefaults: {
            ...draftRecord,
            adjustmentType: isPriceAdjustment ? 'Harga' : 'Pengurangan Stok',
            date: page?.date || draftRecord.date,
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
