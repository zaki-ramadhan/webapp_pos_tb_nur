export function buildDefaultValues(form, detailRow = null) {
    if (detailRow) {
        return {
            name: detailRow.name ?? '',
            pic: detailRow.pic ?? '',
            phone: detailRow.phone ?? '',
            street: detailRow.street ?? '',
            city: detailRow.city ?? '',
            postalCode: detailRow.postalCode ?? '',
            province: detailRow.province ?? '',
            country: detailRow.country ?? '',
        };
    }
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
