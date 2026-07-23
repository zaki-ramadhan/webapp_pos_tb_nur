export const SALES_DOCUMENT_COPY_CONFIG_MAP = {
    'Penawaran': {
        resource: 'sales-quotes',
        title: 'Penawaran Penjualan',
        placeholder: 'Cari/Pilih Penawaran...',
        tabs: ['Rincian Barang', 'Biaya Lainnya'],
    },
    'Pesanan': {
        resource: 'sales-orders',
        title: 'Pesanan Penjualan',
        placeholder: 'Cari/Pilih Pesanan...',
        tabs: ['Rincian Barang', 'Biaya Lainnya', 'Uang Muka'],
    },
    'Pengiriman': {
        resource: 'sales-deliveries',
        title: 'Pengiriman Penjualan',
        placeholder: 'Cari/Pilih Pengiriman...',
        tabs: ['Rincian Barang', 'Biaya Lainnya', 'Uang Muka'],
    },
    'Pembelian': {
        resource: 'purchase-orders',
        title: 'Pesanan Pembelian',
        placeholder: 'Cari/Pilih Pesanan Pembelian...',
        tabs: ['Rincian Barang'],
    },
    'Permintaan': {
        resource: 'item-requests',
        title: 'Permintaan Barang',
        placeholder: 'Cari/Pilih Permintaan Barang...',
        tabs: ['Rincian Barang'],
    },
};

export function getItemKey(item, index) {
    return String(item.id ?? `${item.__docId ?? 'doc'}_${index}`);
}

export function getCostKey(c, index) {
    return String(c.id ?? `${c.__docId ?? 'doc'}_${index}`);
}

export function getAdvanceKey(a, index) {
    return String(a.id ?? `${a.__docId ?? 'doc'}_${index}`);
}

export function extractDocumentItems(docDetails, allDocs) {
    if (docDetails) {
        return docDetails.lines ?? [];
    }
    return allDocs.flatMap((d) =>
        (d.lines ?? []).map((l) => ({
            ...l,
            __docNumber: d.document_number,
            __docId: d.id,
        }))
    );
}

export function extractDocumentCosts(docDetails, allDocs) {
    if (docDetails) {
        return docDetails.metadata?.additional_costs ?? [];
    }
    return allDocs.flatMap((d) =>
        (d.metadata?.additional_costs ?? []).map((c, i) => ({
            ...c,
            id: c.id ?? i,
            __docNumber: d.document_number,
            __docId: d.id,
        }))
    );
}

export function extractDocumentAdvances(docDetails, allDocs) {
    if (docDetails) {
        return docDetails.metadata?.advance_payments ?? [];
    }
    return allDocs.flatMap((d) =>
        (d.metadata?.advance_payments ?? []).map((a, i) => ({
            ...a,
            id: a.id ?? i,
            __docNumber: d.document_number,
            __docId: d.id,
        }))
    );
}

export function filterItemsByQuery(items, itemQuery) {
    const q = itemQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
        (item) =>
            (item.name ?? '').toLowerCase().includes(q) ||
            (item.code ?? '').toLowerCase().includes(q) ||
            (item.__docNumber ?? '').toLowerCase().includes(q)
    );
}
