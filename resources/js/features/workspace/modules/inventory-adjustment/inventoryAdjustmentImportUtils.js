export function fuzzyMatchHeader(targetKey, headers) {
    const rules = {
        name: ['nama', 'barang', 'name', 'item', 'produk', 'product'],
        code: ['kode', 'code', 'sku', 'barcode', 'id'],
        adjustmentType: ['tipe', 'type', 'jenis', 'action', 'kategori'],
        quantity: ['kuantitas', 'qty', 'quantity', 'jumlah', 'stok', 'stock', 'vol'],
        unit: ['satuan', 'unit', 'uom', 'pcs'],
        unitCost: ['harga', 'price', 'biaya', 'cost', 'modal', 'unitcost'],
    };

    const words = rules[targetKey] || [];
    for (const header of headers) {
        const hLower = String(header).toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const word of words) {
            if (hLower.includes(word)) {
                return header;
            }
        }
    }
    return '';
}

export function autoDetectMappings(headers) {
    return {
        name: fuzzyMatchHeader('name', headers),
        code: fuzzyMatchHeader('code', headers),
        adjustmentType: fuzzyMatchHeader('adjustmentType', headers),
        quantity: fuzzyMatchHeader('quantity', headers),
        unit: fuzzyMatchHeader('unit', headers),
        unitCost: fuzzyMatchHeader('unitCost', headers),
    };
}
