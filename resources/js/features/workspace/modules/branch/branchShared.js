export function buildDefaultValues(form) {
    return {
        name: form.defaults?.name ?? '',
        phone: form.defaults?.phone ?? '',
        street: form.defaults?.street ?? '',
        city: form.defaults?.city ?? '',
        postalCode: form.defaults?.postalCode ?? '',
        province: form.defaults?.province ?? '',
        country: form.defaults?.country ?? '',
        allUsers: Boolean(form.userAccess?.allUsersChecked),
    };
}
