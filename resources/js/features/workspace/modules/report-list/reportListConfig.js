function createCategory(id, label, icon) {
    return { id, label, icon };
}

function createReport(id, categoryId, section, title, description, icon = 'reports') {
    return { id, categoryId, section, title, description, icon };
}

const categories = [
    createCategory('memorize', 'Memorize', 'save'),
    createCategory('finance', 'Keuangan', 'budget'),
    createCategory('profit-center', 'Pusat Laba & Biaya', 'building'),
    createCategory('ledger', 'Buku Besar', 'ledger'),
    createCategory('cash-bank', 'Kas & Bank', 'bank'),
    createCategory('receivable', 'Piutang', 'customer'),
    createCategory('sales', 'Penjualan', 'sales'),
    createCategory('salesperson', 'Tenaga Penjual', 'employee'),
    createCategory('payable', 'Utang', 'payment'),
    createCategory('purchase', 'Pembelian', 'purchase'),
    createCategory('inventory', 'Persediaan', 'inventory'),
    createCategory('warehouse', 'Gudang', 'warehouse'),
    createCategory('work-order', 'Pekerjaan Pesanan', 'box'),
    createCategory('manufacture', 'Manufaktur', 'manufacture'),
    createCategory('fixed-assets', 'Aset Tetap', 'asset'),
    createCategory('tax', 'Pajak', 'tax'),
    createCategory('inspection', 'Pemeriksaan', 'activity'),
    createCategory('others', 'Lain-lain', 'info'),
];

const reports = [
    createReport(
        'memorize-sales-by-customer',
        'memorize',
        'Penjualan',
        'Penjualan Barang per Pelanggan',
        'Menampilkan nilai penjualan barang per pelanggan.',
    ),
    createReport(
        'finance-cashflow',
        'finance',
        'Keuangan',
        'Arus Kas Ringkas',
        'Ringkasan arus kas masuk dan keluar per periode.',
    ),
    createReport(
        'profit-center-summary',
        'profit-center',
        'Analisa',
        'Laba Rugi per Pusat Biaya',
        'Memantau kontribusi laba rugi berdasarkan pusat laba dan biaya.',
    ),
    createReport(
        'ledger-account-mutation',
        'ledger',
        'Buku Besar',
        'Mutasi Akun Perkiraan',
        'Menampilkan histori mutasi akun perkiraan lengkap dengan saldo berjalan.',
        'account',
    ),
    createReport(
        'cash-bank-daily-balance',
        'cash-bank',
        'Kas & Bank',
        'Saldo Harian Bank',
        'Memantau saldo dan mutasi kas/bank per hari.',
        'bank',
    ),
    createReport(
        'receivable-aging',
        'receivable',
        'Piutang',
        'Umur Piutang Pelanggan',
        'Membantu menilai jatuh tempo piutang dan tagihan tertunda.',
    ),
    createReport(
        'sales-margin',
        'sales',
        'Penjualan',
        'Margin Penjualan per Barang',
        'Membandingkan omzet, HPP, dan margin untuk setiap barang terjual.',
    ),
    createReport(
        'salesperson-performance',
        'salesperson',
        'Tenaga Penjual',
        'Kinerja Tenaga Penjual',
        'Menampilkan pencapaian omzet, margin, dan target per tenaga penjual.',
        'employee',
    ),
    createReport(
        'payable-aging',
        'payable',
        'Utang',
        'Umur Utang Pemasok',
        'Membantu memetakan tagihan pemasok yang segera jatuh tempo.',
        'payment',
    ),
    createReport(
        'purchase-by-supplier',
        'purchase',
        'Pembelian',
        'Pembelian per Pemasok',
        'Meringkas total pembelian, retur, dan saldo pembelian per pemasok.',
        'purchase',
    ),
    createReport(
        'inventory-movement',
        'inventory',
        'Persediaan',
        'Pergerakan Stok Barang',
        'Melihat stok masuk, keluar, dan saldo akhir per barang.',
        'inventory',
    ),
    createReport(
        'warehouse-stock-value',
        'warehouse',
        'Gudang',
        'Nilai Stok per Gudang',
        'Ringkasan kuantitas dan nilai stok per gudang.',
        'warehouse',
    ),
    createReport(
        'work-order-progress',
        'work-order',
        'Pekerjaan Pesanan',
        'Progress Pekerjaan Pesanan',
        'Memantau status pekerjaan pesanan dari awal hingga penyelesaian.',
        'box',
    ),
    createReport(
        'manufacture-material-usage',
        'manufacture',
        'Manufaktur',
        'Pemakaian Bahan Baku',
        'Menganalisa konsumsi bahan baku terhadap hasil produksi.',
        'manufacture',
    ),
    createReport(
        'fixed-assets-depreciation',
        'fixed-assets',
        'Aset Tetap',
        'Penyusutan Aset Tetap',
        'Menampilkan nilai buku, penyusutan, dan umur aset tetap.',
        'asset',
    ),
    createReport(
        'tax-vat-summary',
        'tax',
        'Pajak',
        'Ringkasan PPN Keluaran dan Masukan',
        'Meringkas perhitungan PPN untuk kebutuhan pelaporan pajak.',
        'tax',
    ),
    createReport(
        'inspection-audit-trail',
        'inspection',
        'Pemeriksaan',
        'Jejak Audit Transaksi',
        'Menampilkan aktivitas perubahan transaksi untuk kebutuhan pemeriksaan.',
        'activity',
    ),
    createReport(
        'others-custom-form',
        'others',
        'Lain-lain',
        'Daftar Form Kustom',
        'Kumpulan laporan pendukung dan utilitas tambahan.',
        'info',
    ),
];

export function buildReportListConfig() {
    return {
        topActions: [
            {
                id: 'tips',
                label: 'Petunjuk',
                icon: 'idea',
                tone: 'warning',
            },
        ],
        title: 'Memorize',
        searchPlaceholder: 'Cari...',
        categories,
        reports,
        emptyState: {
            title: 'Laporan tidak ditemukan',
            description: 'Coba ubah kata kunci pencarian atau pilih kategori laporan lain.',
        },
    };
}
