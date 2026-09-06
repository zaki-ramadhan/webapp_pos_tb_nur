import { toUserPayload } from '@/features/workspace/backend/workspaceBackendAdapters';

export const DEVELOPER_EMAILS = ['piscokpiscok2610@gmail.com', 'zakiram4dhan@gmail.com'];
export const USER_FORM_TABS = [{ id: 'users-general', label: 'Pengguna' }];

export function isSuperAdminEmail(email) {
    return DEVELOPER_EMAILS.includes(String(email ?? '').trim().toLowerCase());
}

export function buildInitialValues(detailRow) {
    const rawEmail = (detailRow?.email ?? '').trim();
    const normalizedEmail = rawEmail.toLowerCase();
    const isSuperAdmin = DEVELOPER_EMAILS.includes(normalizedEmail);
    const accessTypeStr = String(detailRow?.accessType ?? '').toLowerCase();
    const isOwner = !isSuperAdmin && (
        accessTypeStr.includes('owner') ||
        accessTypeStr.includes('admin') ||
        normalizedEmail === 'nurhayati.karya@gmail.com' ||
        (detailRow?.roleIds ?? []).includes(1) ||
        (detailRow?.roleIds ?? []).includes(3)
    );

    let accessType = 'kasir';
    let accessTypeLabel = 'Kasir';
    if (isSuperAdmin) {
        accessType = 'super_admin';
        accessTypeLabel = 'Administrator Sistem';
    } else if (isOwner) {
        accessType = 'owner';
        accessTypeLabel = 'Owner';
    }

    const phone = detailRow?.phone ?? '';

    return {
        name: detailRow?.name ?? '',
        email: rawEmail,
        phone,
        password: '',
        isActive: detailRow?.isActive ?? true,
        accessGroupIds: detailRow?.accessGroupIds ?? [],
        accessType,
        accessTypeLabel: detailRow?.accessType || accessTypeLabel,
        initialEmail: rawEmail,
        initialPhone: phone.trim(),
    };
}

export function buildPayloadFromInput(inputVal, values, lookupData, isDetail, detailRow) {
    const isEmailInput = inputVal.includes('@');
    let name = detailRow?.name || values.name || '', email = '', phone = '';

    if (isEmailInput) {
        email = inputVal.trim();
        const match = lookupData?.employees?.find((e) => e.email?.toLowerCase() === email.toLowerCase());
        if (match) {
            name = name || match.full_name;
            phone = match.mobile_phone || match.whatsapp_phone || match.office_phone || '';
        } else {
            name = name || `User ${email.split('@')[0]}`;
            phone = '';
        }
    } else {
        phone = inputVal.trim();
        const normalized = phone.replace(/[^0-9]/g, '');
        const match = lookupData?.employees?.find((e) => {
            const ep = (e.mobile_phone || e.whatsapp_phone || e.office_phone || '').replace(/[^0-9]/g, '');
            return ep && ep === normalized;
        });
        if (match) {
            name = name || match.full_name;
            email = match.email || '';
        } else {
            name = name || `User ${phone}`;
            email = '';
        }
    }

    const superAdminRole = lookupData?.roles?.find((r) => r.code === 'super_admin');
    const adminRole = lookupData?.roles?.find((r) => r.code === 'admin' || r.name?.toLowerCase()?.includes('admin'));
    const kasirRole = lookupData?.roles?.find((r) => r.code === 'kasir' || r.code === 'operator' || r.name?.toLowerCase()?.includes('kasir') || r.name?.toLowerCase()?.includes('operator'));

    let roleIds = [kasirRole?.id ?? 2];
    if (values.accessType === 'super_admin') {
        roleIds = [superAdminRole?.id ?? 1];
    } else if (values.accessType === 'owner' || values.accessType === 'admin') {
        roleIds = [adminRole?.id ?? 3];
    }

    return toUserPayload({
        ...values,
        name: name || inputVal,
        email: email || undefined,
        phone: phone || undefined,
        password: values.password || (isDetail ? undefined : 'password'),
        roleIds,
    });
}

export function validateUserForm(values, isDetail, isEmailLocked) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!isDetail) {
        const inputVal = values.phone?.trim() ?? '';
        if (!inputVal) {
            return 'No Handphone/Email wajib diisi.';
        }
        if (inputVal.includes('@')) {
            if (!emailRegex.test(inputVal)) {
                return 'Format email tidak valid.';
            }
        }
        return '';
    }

    if (!isEmailLocked && values.email?.trim()) {
        if (!emailRegex.test(values.email.trim())) {
            return 'Format email tidak valid.';
        }
    }
    return '';
}

export function canDeleteUser(detailRow, isDetail, isSelf, isActorSuperAdmin, tableRows) {
    if (!isDetail || isSelf) return false;

    const targetEmail = String(detailRow?.email ?? '').toLowerCase();
    const isTargetAdmin = DEVELOPER_EMAILS.includes(targetEmail);

    if (isTargetAdmin) {
        if (!isActorSuperAdmin) return false;
        const totalAdmins = tableRows.filter((r) => DEVELOPER_EMAILS.includes(String(r.email ?? '').toLowerCase())).length;
        return totalAdmins > 1;
    }

    if (isActorSuperAdmin) return true;

    const accessTypeStr = String(detailRow?.accessType ?? '').toLowerCase();
    return accessTypeStr.includes('kasir') || accessTypeStr.includes('operator');
}

export function resolveUserIdentifier(values) {
    const name = (values.name || '').trim();
    const contact = (values.email || values.phone || '').trim();
    if (name && contact && name.toLowerCase() !== contact.toLowerCase()) {
        return `${name} (${contact})`;
    }
    return name || contact || 'pengguna ini';
}
