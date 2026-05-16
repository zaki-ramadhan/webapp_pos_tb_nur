import { validateRequiredChecks } from '@/features/workspace/shared/formValidation';

export function buildDefaultValues(form, detailRow = null) {
    const detailUsers = detailRow?.users ?? [];

    return {
        name: detailRow?.name ?? form.defaults?.name ?? '',
        description: detailRow?.notes ?? form.defaults?.description ?? '',
        isSubDepartment: Boolean(detailRow?.parentDepartmentId),
        parentDepartmentId: detailRow?.parentDepartmentId ?? null,
        parentDepartmentName: detailRow?.parentDepartmentName ?? '',
        openingDate: form.defaults?.openingDate ?? '',
        openingBalanceKeyword: '',
        allUsers: !(detailRow?.userIds?.length),
        userScopeBranchId: null,
        userScopeBranchLabel: '',
        selectedUserIds: detailUsers.map((user) => user.id),
        selectedUserLabels: detailUsers.map((user) => user.name ?? user.email ?? `User #${user.id}`),
        __backendRecordId: detailRow?.id ?? null,
        __code: detailRow?.code ?? '',
    };
}

export function buildDepartmentSnapshot(values) {
    return {
        name: values.name,
        description: values.description,
        isSubDepartment: values.isSubDepartment,
        parentDepartmentId: values.parentDepartmentId,
        allUsers: values.allUsers,
        selectedUserIds: [...(values.selectedUserIds ?? [])].sort((left, right) => Number(left) - Number(right)),
    };
}

export function buildDepartmentCode(name, currentCode = '') {
    if (String(currentCode ?? '').trim()) {
        return String(currentCode).trim();
    }

    const baseSlug = String(name ?? '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 18);
    const suffix = Date.now().toString().slice(-6);

    return `DEPT-${baseSlug || 'AUTO'}-${suffix}`;
}

export function validateDepartmentValues(values, form) {
    const requiredMessage = validateRequiredChecks([
        { label: form.labels.name, value: values.name },
    ]);

    if (requiredMessage) {
        return requiredMessage;
    }

    if (values.isSubDepartment && !values.parentDepartmentId) {
        return 'Parent departemen wajib dipilih saat Sub Dept. aktif.';
    }

    if (!values.allUsers && !(values.selectedUserIds ?? []).length) {
        return 'Pilih minimal satu pengguna saat Semua Pengguna tidak aktif.';
    }

    return '';
}

export function applyDepartmentFormChange(currentValues, field, nextValue) {
    if (field === 'isSubDepartment') {
        return {
            ...currentValues,
            isSubDepartment: Boolean(nextValue),
            parentDepartmentId: nextValue ? currentValues.parentDepartmentId : null,
            parentDepartmentName: nextValue ? currentValues.parentDepartmentName : '',
        };
    }

    if (field === 'parentDepartment') {
        return {
            ...currentValues,
            parentDepartmentId: nextValue?.id ?? null,
            parentDepartmentName: nextValue?.label ?? '',
        };
    }

    if (field === 'allUsers') {
        return {
            ...currentValues,
            allUsers: Boolean(nextValue),
            userScopeBranchId: nextValue ? null : currentValues.userScopeBranchId,
            userScopeBranchLabel: nextValue ? '' : currentValues.userScopeBranchLabel,
            selectedUserIds: nextValue ? [] : currentValues.selectedUserIds,
            selectedUserLabels: nextValue ? [] : currentValues.selectedUserLabels,
        };
    }

    if (field === 'userScopeBranch') {
        return {
            ...currentValues,
            userScopeBranchId: nextValue?.id ?? null,
            userScopeBranchLabel: nextValue?.label ?? '',
        };
    }

    if (field === 'selectedUser') {
        if (!nextValue?.id || currentValues.selectedUserIds.includes(nextValue.id)) {
            return currentValues;
        }

        return {
            ...currentValues,
            selectedUserIds: [...currentValues.selectedUserIds, nextValue.id],
            selectedUserLabels: [...currentValues.selectedUserLabels, nextValue.label],
        };
    }

    if (field === 'removeSelectedUser') {
        const removeIndex = currentValues.selectedUserLabels.findIndex((label) => label === nextValue);

        if (removeIndex < 0) {
            return currentValues;
        }

        return {
            ...currentValues,
            selectedUserIds: currentValues.selectedUserIds.filter((_, index) => index !== removeIndex),
            selectedUserLabels: currentValues.selectedUserLabels.filter((_, index) => index !== removeIndex),
        };
    }

    return {
        ...currentValues,
        [field]: nextValue,
    };
}
