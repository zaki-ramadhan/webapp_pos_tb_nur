export function getPurchaseInfo(id, label) {
    const map = {
        'purchase-order-auto-close': 'Menutup pesanan pembelian secara otomatis ketika kuantitas barang yang diterima telah terpenuhi.',
        'purchase-payment-temporary-account': 'Akun perantara untuk membukukan transaksi pembayaran sebelum rekonsiliasi bank selesai.',
    };
    return map[id] || `Informasi tentang ${label}`;
}
