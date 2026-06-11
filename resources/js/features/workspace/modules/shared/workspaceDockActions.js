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

/**
 * Merge runtime callbacks and state into static dock action definitions.
 * Replaces the repetitive action.id === 'save' ? {...} : ... pattern.
 *
 * @param {Array} actions - Static action definitions (from config)
 * @param {object} opts
 * @param {boolean} opts.saving - Whether a save is in progress
 * @param {boolean} [opts.saveDisabled] - Additional disabled condition for save
 * @param {Function} opts.onSave - Save handler
 * @param {Function} [opts.onDelete] - Delete handler
 * @param {string} [opts.saveTone] - Override tone for save button
 * @returns {Array} Actions with runtime state merged in
 */
export function mapDockActions(actions, { saving, saveDisabled = false, onSave, onDelete, saveTone } = {}) {
    return actions.map(action => {
        if (action.id === 'save') {
            return {
                ...action,
                loading: saving,
                disabled: saving || saveDisabled,
                onClick: onSave,
                ...(saveTone ? { tone: saveTone } : {}),
            };
        }
        if (action.id === 'delete') {
            return { ...action, onClick: onDelete };
        }
        return action;
    });
}

