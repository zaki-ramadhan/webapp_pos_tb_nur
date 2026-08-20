export function parsePercentValue(value = '0%') {
    const normalizedValue = String(value).replace('%', '').replace(',', '.').trim();
    const parsedValue = Number(normalizedValue);

    return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function formatCompactLabel(value = '') {
    const normalizedValue = String(value).trim();

    if (normalizedValue.length <= 36) {
        return normalizedValue;
    }

    return `${normalizedValue.slice(0, 36)}...`;
}

export function getMetric(metrics, label) {
    return (metrics ?? []).find((item) => item.label === label) ?? null;
}

export function getProductImageUrl(name, size = 120) {
    const lowerName = String(name ?? '').toLowerCase();
    
    if (lowerName.includes('semen') || lowerName.includes('cement') || lowerName.includes('portland') || lowerName.includes('mu-')) {
        return `https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=${size}&h=${size}&fit=crop&q=80`;
    }
    if (lowerName.includes('cat') || lowerName.includes('paint') || lowerName.includes('nippon') || lowerName.includes('dulux') || lowerName.includes('kuas')) {
        return `https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=${size}&h=${size}&fit=crop&q=80`;
    }
    if (lowerName.includes('kayu') || lowerName.includes('triplek') || lowerName.includes('papan') || lowerName.includes('lumber') || lowerName.includes('balok')) {
        return `https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=${size}&h=${size}&fit=crop&q=80`;
    }
    if (lowerName.includes('besi') || lowerName.includes('baja') || lowerName.includes('seng') || lowerName.includes('paku') || lowerName.includes('kawat') || lowerName.includes('rebar')) {
        return `https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=${size}&h=${size}&fit=crop&q=80`;
    }
    if (lowerName.includes('bata') || lowerName.includes('batako') || lowerName.includes('roster') || lowerName.includes('paving') || lowerName.includes('brick')) {
        return `https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=${size}&h=${size}&fit=crop&q=80`;
    }
    if (lowerName.includes('pipa') || lowerName.includes('pvc') || lowerName.includes('selang') || lowerName.includes('kran') || lowerName.includes('fitting')) {
        return `https://images.unsplash.com/photo-1542013936693-8848e574047a?w=${size}&h=${size}&fit=crop&q=80`;
    }
    if (lowerName.includes('palu') || lowerName.includes('obeng') || lowerName.includes('tang') || lowerName.includes('meteran') || lowerName.includes('gergaji') || lowerName.includes('alat') || lowerName.includes('tool')) {
        return `https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=${size}&h=${size}&fit=crop&q=80`;
    }
    if (lowerName.includes('genteng') || lowerName.includes('seng') || lowerName.includes('asbes') || lowerName.includes('atap')) {
        return `https://images.unsplash.com/photo-1632759162444-1107ffa59790?w=${size}&h=${size}&fit=crop&q=80`;
    }
    if (lowerName.includes('pasir') || lowerName.includes('batu') || lowerName.includes('kerikil') || lowerName.includes('seplit')) {
        return `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=${size}&h=${size}&fit=crop&q=80`;
    }
    
    return `https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=${size}&h=${size}&fit=crop&q=80`;
}

export function getBuildingStoreLayoutRecommendation(itemA = '', itemB = '') {
    const text = (itemA + ' ' + itemB).toLowerCase();

    // Specific tool check before raw bulk sand check (e.g. "Sekop Pasir" is a tool)
    if (/sekop|cangkul|perkakas|tang|palu|gergaji|meteran|kawat|paku|engsel|gembok|baut|sekrup/i.test(text) && !/cor|split|bata|batako|pondasi/i.test(text) && !/pasir\s+(cor|pasang|hitam|lumajang|merah|putih)/i.test(text)) {
        return `Simpan kawat bendrat dalam kotak sekat di bawah meja kasir kios depan, dan gantung sekop/perkakas pada papan display dinding kios.`;
    }
    if (/keramik|granit|tile|nat|perekat keramik/i.test(text)) {
        return `Simpan tumpukan dus keramik di gudang belakang rumah (area kering), dan sediakan kepingan sampel motif serta semen nat di rak display kios depan dekat kasir.`;
    }
    if (/pasir|batu|bata|batako|cor|split|koral|pondasi/i.test(text)) {
        return `Tempatkan pasir dan batu di halaman luar jalur mobil pick-up agar muat armada cepat, dan simpan semen/alat cor pada akses terdekat.`;
    }
    if (/kayu|kaso|balok|reng|papan|bambu/i.test(text)) {
        return `Susun kayu rapi di gudang samping rumah, dan sediakan paku kayu serta gergaji/meteran di akses pintu gudang samping atau meja kasir.`;
    }
    if (/pipa|pvc|seng|baja|hollow|atap|asbes|triplek|alumunium|talang/i.test(text)) {
        return `Taruh material panjang di rak besi gudang samping rumah, dan gantung keranjang aksesoris (lem PVC, paku seng, sekrup) pada tiang raknya.`;
    }
    if (/semen|mortar|kompon|plamir/i.test(text)) {
        return `Susun zak semen di atas palet kayu gudang belakang rumah agar terhindar dari lembap dan dekat dengan jalur muat mobil.`;
    }
    if (/cat|kuas|thinner|amplas|lakban|rol|dempul/i.test(text)) {
        return `Pajang kaleng cat di rak display kios depan, dan gantungkan aksesoris (kuas, roll cat, bak cat, amplas, thinner) tepat di samping kaleng cat.`;
    }
    if (/kran|keran|lem|fitting|keni|tee|stop|seal|flange/i.test(text)) {
        return `Pajang kran dan fitting di etalase kaca kios depan dekat kasir, serta gantungkan seal tape dan lem pipa di sisi etalase.`;
    }
    if (/listrik|kabel|saklar|isolatip|stop kontak|fitting lampu|lampu/i.test(text)) {
        return `Pajang di etalase alat listrik kios depan, dan posisikan produk pelengkap/isolatip di gantungannya.`;
    }

    return `Posisikan kedua barang berdampingan di rak display kios depan agar mudah dijangkau pembeli.`;
}

export function getBuildingStoreCashierRecommendation(itemA = '', itemB = '', antecedentAbc = 'A', consequentAbc = 'C') {
    const textA = (itemA || '').toLowerCase();
    const textB = (itemB || '').toLowerCase();
    const text = (itemA + ' ' + itemB).toLowerCase();

    // Tools pair (e.g. Sekop + Kawat Bendrat)
    if (/sekop|cangkul/i.test(text) && /kawat|paku/i.test(text)) {
        return `Tawarkan kawat bendrat atau paku tambahan sebelum transaksi kasir difinalisasi sebagai pelengkap alat pertukangan.`;
    }

    // Cross-category pairs first
    if ((/semen|mortar/i.test(textA) && /kuas|cat|thinner/i.test(textB)) || (/kuas|cat|thinner/i.test(textA) && /semen|mortar/i.test(textB))) {
        return `Tawarkan kuas cat atau alat finishing sebagai pelengkap persiapan plesteran dan pengecatan saat pembeli memesan semen di kasir.`;
    }
    if ((/pasir/i.test(textA) && /thinner|cat/i.test(textB)) || (/thinner|cat/i.test(textA) && /pasir/i.test(textB))) {
        return `Tawarkan bahan pelarut cat atau kuas pembersih saat konsumen memesan pasir untuk tahap penyelesaian renovasi bangunan di kasir kios.`;
    }
    if ((/semen|cor|pasir/i.test(textA) && /kawat|paku|besi/i.test(textB)) || (/kawat|paku|besi/i.test(textA) && /semen|cor|pasir/i.test(textB))) {
        return `Tawarkan kawat bendrat atau paku cor saat pembeli memesan semen/pasir untuk pekerjaan struktur.`;
    }
    if (/cat/i.test(text) && /kuas|rol|thinner|amplas/i.test(text)) {
        return `Tawarkan 'Paket Pengecatan Hemat' (${itemA} + ${itemB}) dengan potongan diskon langsung di meja kasir.`;
    }
    if (/keramik|granit|tile/i.test(text)) {
        return `Tawarkan semen nat keramik warna senada atau semen perekat langsung saat pelanggan memilih motif di kios kasir.`;
    }
    if (/pasir|batu|bata|batako|cor|pondasi/i.test(text)) {
        return `Tawarkan 'Paket Proyek Cor/Pondasi' (Pasir + Semen + Kawat) langsung saat nota muatan pick-up dibuat di kasir kios.`;
    }
    if (/kayu|kaso|balok|reng|papan/i.test(text)) {
        return `Tawarkan paku kayu, paku reng, atau mata gergaji saat pembeli memesan kayu di gudang samping.`;
    }
    if (/pipa|pvc|talang/i.test(text)) {
        return `Tawarkan lem pipa PVC, seal tape, atau sambungan keni/tee saat pembeli memesan pipa di kasir.`;
    }
    if (/kran|keran/i.test(text)) {
        return `Tawarkan seal tape atau klem pipa otomatis saat konsumen membeli kran air di etalase kasir.`;
    }
    if (/kawat|paku|baut|sekrup/i.test(text)) {
        return `Tawarkan kawat bendrat atau paku tambahan sebelum transaksi kasir difinalisasi.`;
    }

    if (antecedentAbc === 'A' && consequentAbc === 'A') {
        return `Berikan penawaran diskon potongan langsung jika kedua produk utama dibeli secara bersamaan.`;
    }

    return `Tawarkan ${itemB || 'produk pelengkap ini'} sebagai opsi hemat saat pelanggan membayar ${itemA || 'pesanan'} di meja kasir kios depan.`;
}
