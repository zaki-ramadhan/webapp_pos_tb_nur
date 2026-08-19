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

    if (/semen|pasir|besi|batu|bata|cor|beton|material|pondasi|mortar|koral|split/i.test(text)) {
        return `Tempatkan pasir/batu di pekarangan samping luar & tumpukan semen di atas palet kering area depan muat barang agar kuli/armada toko cepat bongkar muat.`;
    }
    if (/kayu|kaso|balok|reng|papan|bambu/i.test(text)) {
        return `Susun kayu secara horizontal di rak gudang samping, dan gantung aksesoris (paku kayu, gergaji, meteran) di tiang penyangga rak.`;
    }
    if (/pipa|pvc|seng|baja|hollow|atap|asbes|triplek|alumunium|talang/i.test(text)) {
        return `Taruh material panjang pada rak besi bertingkat area samping, dan pasang keranjang gantung aksesoris (lem PVC, paku seng, klem) di ujung rak.`;
    }
    if (/cat|kuas|thinner|amplas|lakban|rol|compound|dempul|plamir/i.test(text)) {
        return `Pajang kaleng cat di rak display utama toko, dan gantungkan aksesoris (kuas, roll cat, bak cat, amplas, thinner) tepat di samping kaleng cat setinggi pandangan mata.`;
    }
    if (/kran|keran|lem|fitting|keni|tee|stop|seal|flange/i.test(text)) {
        return `Pajang kran dan fitting di etalase perlengkapan pipa dekat kasir, dan gantungkan seal tape serta lem PVC di rak samping etalase.`;
    }
    if (/kawat|paku|engsel|gembok|baut|sekrup|tang|palu|gergaji|meteran|cangkul|sekop/i.test(text)) {
        return `Taruh paku/baut dalam kotak sekat di bawah meja kasir, dan gantung perkakas pada papan pegboard dinding toko.`;
    }
    if (/listrik|kabel|saklar|isolatip|stop kontak|fitting lampu|lampu/i.test(text)) {
        return `Pajang di etalase alat listrik depan kasir, dan posisikan produk pelengkap/isolatip di gantungannya.`;
    }

    return `Posisikan kedua barang berdampingan setinggi pandangan mata di rak display toko.`;
}

export function getBuildingStoreCashierRecommendation(itemA = '', itemB = '', antecedentAbc = 'A', consequentAbc = 'C') {
    const text = (itemA + ' ' + itemB).toLowerCase();

    if (/semen|pasir|besi|batu|bata|cor|beton|material|pondasi|mortar|koral|split/i.test(text)) {
        return `Tawarkan 'Paket Proyek Cor/Pondasi' langsung saat pembeli memesan armada muatan (Pick Up) atau zak semen di faktur kasir.`;
    }
    if (/kayu|kaso|balok|reng|papan/i.test(text)) {
        return `Tawarkan paku kayu, paku reng, atau gergaji potong saat pembeli memesan kayu kaso/balok.`;
    }
    if (/pipa|pvc|talang/i.test(text)) {
        return `Tawarkan lem pipa PVC, seal tape, atau sambungan keni/tee saat pelanggan memesan pipa air.`;
    }
    if (/cat|kuas|thinner|amplas|lakban|rol/i.test(text)) {
        return `Tawarkan 'Paket Pengecatan Hemat' (Cat + Roll + Bak Cat/Thinner) dengan potongan diskon langsung di kasir.`;
    }
    if (/kran|keran/i.test(text)) {
        return `Tawarkan seal tape atau klem pipa otomatis saat konsumen membeli kran air.`;
    }
    if (/kawat|paku|baut|sekrup/i.test(text)) {
        return `Tawarkan kawat bendrat atau paku tambahan sebelum transaksi difinalisasi di kasir.`;
    }

    if (antecedentAbc === 'A' && consequentAbc === 'A') {
        return `Berikan penawaran diskon potongan langsung jika kedua produk utama dibeli secara bersamaan.`;
    }

    return `Tawarkan produk pelengkap ini sebagai opsi hemat saat pelanggan membayar di kasir.`;
}
