export function buildDefaultValues(form) {
    return {
        name: form.defaults?.name ?? '',
        pic: form.defaults?.pic ?? '',
        phone: form.defaults?.phone ?? '',
        street: form.defaults?.street ?? '',
        city: form.defaults?.city ?? '',
        postalCode: form.defaults?.postalCode ?? '',
        province: form.defaults?.province ?? '',
        country: form.defaults?.country ?? '',
    };
}
