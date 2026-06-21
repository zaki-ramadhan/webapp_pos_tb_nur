export const DEFAULT_COLUMN_MAPPING = Object.freeze({ code: -1, quantity: -1, price: -1, notes: -1 });

export function autoDetectMapping(headers) {
    const mapping = { ...DEFAULT_COLUMN_MAPPING };
    headers.forEach((header, index) => {
        const h = header.toLowerCase();
        if (mapping.code === -1 && (h.includes('kode') || h.includes('code') || h.includes('sku') || h.includes('barcode') || h.includes('id'))) {
            mapping.code = index;
        } else if (mapping.quantity === -1 && (h.includes('qty') || h.includes('jumlah') || h.includes('quantity') || h.includes('kuantitas'))) {
            mapping.quantity = index;
        } else if (mapping.price === -1 && (h.includes('harga') || h.includes('price') || h.includes('rate'))) {
            mapping.price = index;
        } else if (mapping.notes === -1 && (h.includes('note') || h.includes('ket') || h.includes('catatan') || h.includes('deskripsi'))) {
            mapping.notes = index;
        }
    });
    return mapping;
}
