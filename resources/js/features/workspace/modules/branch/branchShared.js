import { validateRequiredChecks } from '@/features/workspace/shared/formValidation';

export function buildDefaultValues(form, detailRow = null) {
    return {
        name: detailRow?.name ?? form.defaults?.name ?? '',
        phone: detailRow?.phone ?? form.defaults?.phone ?? '',
        street: detailRow?.street ?? form.defaults?.street ?? '',
        city: detailRow?.city ?? form.defaults?.city ?? '',
        postalCode: detailRow?.postalCode ?? form.defaults?.postalCode ?? '',
        province: detailRow?.province ?? form.defaults?.province ?? '',
        country: detailRow?.country ?? form.defaults?.country ?? '',
        allUsers: detailRow ? !(detailRow?.userIds?.length) : Boolean(form.userAccess?.allUsersChecked),
        __backendRecordId: detailRow?.id ?? null,
        __code: detailRow?.code ?? '',
    };
}

export function buildBranchCode(name, currentCode = '') {
    if (String(currentCode ?? '').trim()) {
        return String(currentCode).trim();
    }

    const baseSlug = String(name ?? '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 18);
    const suffix = Date.now().toString().slice(-6);

    return `BR-${baseSlug || 'AUTO'}-${suffix}`;
}

export function buildBranchSnapshot(values) {
    return {
        name: values.name,
        phone: values.phone,
        street: values.street,
        city: values.city,
        postalCode: values.postalCode,
        province: values.province,
        country: values.country,
        allUsers: values.allUsers,
    };
}

export function validateBranchValues(values, form) {
    return validateRequiredChecks([
        { label: form.labels?.name ?? 'Nama', value: values.name },
    ]);
}
