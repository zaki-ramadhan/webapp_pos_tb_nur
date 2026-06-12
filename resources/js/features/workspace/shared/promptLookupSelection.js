import {
    extractBackendRows,
    listBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { showPromptModal } from '@/components/ui/promptModal';

export async function promptSelectBackendRecord(resource, title, labelBuilder) {
    const searchResult = await showPromptModal(`Cari ${title}`, [
        { name: 'keyword', label: 'Kata Kunci Pencarian', type: 'text', required: true }
    ]);

    if (!searchResult) {
        return null;
    }

    const keyword = searchResult.keyword;

    const payload = await listBackendResource(resource, {
        search: keyword.trim(),
        per_page: 10,
    });
    const records = extractBackendRows(payload);

    if (!records.length) {
        throw new Error(`${title} tidak ditemukan.`);
    }

    const options = records.map((record, index) => ({
        value: String(index),
        label: labelBuilder(record)
    }));

    const pickResult = await showPromptModal(`Pilih ${title}`, [
        {
            name: 'pickedIndex',
            label: `Pilih salah satu ${title}`,
            type: 'select',
            defaultValue: '0',
            options: options,
            required: true
        }
    ]);

    if (!pickResult) {
        return null;
    }

    const pickedIndex = Number.parseInt(pickResult.pickedIndex, 10);

    if (!Number.isInteger(pickedIndex) || !records[pickedIndex]) {
        throw new Error(`Pilihan ${title} tidak valid.`);
    }

    return records[pickedIndex];
}
