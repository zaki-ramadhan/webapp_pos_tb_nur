import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { SaveIcon, TrashIcon } from '@/features/workspace/shared/Icons';

export function buildSimpleMasterFormValues(form, detailRow = null) {
    return (form.fields ?? []).reduce((result, field) => {
        if (field.type === 'heading') {
            return result;
        }

        if (field.type === 'checkbox') {
            result[field.id] = Boolean(detailRow?.[field.id] ?? field.checked ?? false);
            return result;
        }

        result[field.id] = detailRow?.[field.id] ?? field.value ?? '';
        return result;
    }, {});
}

export function renderSimpleMasterDockIcon(icon) {
    if (icon === 'trash') {
        return <TrashIcon className="h-9 w-9" />;
    }

    return <SaveIcon className="h-9 w-9" />;
}

export function buildSimpleMasterDockActions(form, isDetailMode) {
    if (isDetailMode && form.dockActionsDetail?.length) {
        return form.dockActionsDetail;
    }

    if (!isDetailMode && form.dockActionsCreate?.length) {
        return form.dockActionsCreate;
    }

    if (form.dockActions?.length) {
        return form.dockActions;
    }

    const actions = [
        {
            id: 'save',
            label: form.saveLabel,
            tone: isDetailMode ? (form.saveToneDetail ?? 'muted') : (form.saveToneCreate ?? 'primary'),
            icon: 'save',
        },
    ];

    if (isDetailMode && form.deleteLabel) {
        actions.push({
            id: 'delete',
            label: form.deleteLabel,
            tone: 'danger',
            icon: 'trash',
        });
    }

    return actions;
}

export function findSimpleMasterDetailRow(tableRows, activeLevel2Tab) {
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

    if (!recordId) {
        return null;
    }

    return (tableRows ?? []).find((row) => String(row.id) === String(recordId)) ?? null;
}

export function renderSimpleMasterCellValue(column, row) {
    if (column.kind === 'spacer') {
        return '';
    }

    return formatTableTextValue(row[column.id]);
}
