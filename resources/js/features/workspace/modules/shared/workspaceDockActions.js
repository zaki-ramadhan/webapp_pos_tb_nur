const DEFAULT_SAVE_ITEMS = [
    { id: 'save-now', label: 'Simpan' },
    { id: 'save-new', label: 'Simpan dan buat baru' },
];

function cloneItems(items = []) {
    return items.map((item) => ({ ...item }));
}

export function createSaveDockAction({
    id = 'save',
    label = 'Simpan',
    icon = 'save',
    tone = 'primary',
    items = DEFAULT_SAVE_ITEMS,
} = {}) {
    const action = { id, label, icon, tone };

    if (Array.isArray(items) && items.length) {
        action.items = cloneItems(items);
    }

    return action;
}

export function createDocumentDockAction({
    id = 'document',
    label = 'Form lain',
    icon = 'document',
    tone = 'secondary',
    itemId = 'open-linked',
    itemLabel = 'Buka transaksi terkait',
} = {}) {
    return {
        id,
        label,
        icon,
        tone,
        items: [{ id: itemId, label: itemLabel }],
    };
}

export function createAttachmentDockAction({
    id = 'attachment',
    label = 'Lampiran',
    icon = 'paperclip',
    tone = 'secondary',
    itemId = 'manage-attachment',
    itemLabel = 'Kelola lampiran',
} = {}) {
    return {
        id,
        label,
        icon,
        tone,
        items: [{ id: itemId, label: itemLabel }],
    };
}

export function createMoreDockAction({
    id = 'more',
    label = 'Lainnya',
    icon = 'kebab',
    tone = 'success',
    itemId = 'audit',
    itemLabel = 'Lihat jejak audit',
} = {}) {
    return {
        id,
        label,
        icon,
        tone,
        items: [{ id: itemId, label: itemLabel }],
    };
}

export function createDeleteDockAction({
    id = 'delete',
    label = 'Hapus',
    icon = 'trash',
    tone = 'danger',
} = {}) {
    return { id, label, icon, tone };
}
