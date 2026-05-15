import {
    extractBackendRows,
    listBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';

export async function promptSelectBackendRecord(resource, title, labelBuilder) {
    const keyword = window.prompt(`Cari ${title}`);

    if (keyword === null) {
        return null;
    }

    const payload = await listBackendResource(resource, {
        search: keyword.trim(),
        per_page: 10,
    });
    const records = extractBackendRows(payload);

    if (!records.length) {
        throw new Error(`${title} tidak ditemukan.`);
    }

    const optionText = records
        .map((record, index) => `${index + 1}. ${labelBuilder(record)}`)
        .join('\n');
    const pickedValue = window.prompt(`Pilih ${title}:\n${optionText}\nKetik nomor pilihan.`);

    if (pickedValue === null) {
        return null;
    }

    const pickedIndex = Number.parseInt(pickedValue, 10) - 1;

    if (!Number.isInteger(pickedIndex) || !records[pickedIndex]) {
        throw new Error(`Pilihan ${title} tidak valid.`);
    }

    return records[pickedIndex];
}
