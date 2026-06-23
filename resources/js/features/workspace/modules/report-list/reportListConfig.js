function createCategory(id, label, icon) {
    return { id, label, icon };
}

function createReport(id, categoryId, section, title, description, icon = 'reports') {
    return { id, categoryId, section, title, description, icon };
}

const categories = [
    createCategory('fixed-assets', 'Aset Tetap', 'asset'),
    createCategory('ledger', 'Buku Besar', 'ledger'),
    createCategory('warehouse', 'Gudang', 'warehouse'),
    createCategory('cash-bank', 'Kas & Bank', 'bank'),
    createCategory('finance', 'Keuangan', 'budget'),
    createCategory('others', 'Lain-lain', 'info'),
    createCategory('manufacture', 'Manufaktur', 'manufacture'),
    createCategory('memorize', 'Memorize', 'save'),
    createCategory('tax', 'Pajak', 'tax'),
    createCategory('work-order', 'Pekerjaan Pesanan', 'box'),
    createCategory('purchase', 'Pembelian', 'purchase'),
    createCategory('inspection', 'Pemeriksaan', 'activity'),
    createCategory('sales', 'Penjualan', 'sales'),
    createCategory('inventory', 'Persediaan', 'inventory'),
    createCategory('receivable', 'Piutang', 'customer'),
    createCategory('salesperson', 'Tenaga Penjual', 'employee'),
    createCategory('payable', 'Utang', 'payment'),
];

const reports = [
    // Laporan tersimpan
    createReport(
        'memorize-sales-by-customer',
        'memorize',
        'Penjualan',
        'Penjualan Barang per Pelanggan',
        'Menampilkan nilai penjualan barang per pelanggan.',
        'ledger'
    ),
    // Keuangan
    createReport(
        'finance-cashflow',
        'finance',
        'Keuangan',
        'Arus Kas Ringkas',
        'Ringkasan arus kas masuk dan keluar per periode.',
        'reports'
    ),
    createReport(
        'finance-profit-loss',
        'finance',
        'Keuangan',
        'Laba Rugi Standar',
        'Menampilkan laporan laba rugi standar periode ini.',
        'ledger'
    ),
    createReport(
        'finance-balance-sheet',
        'finance',
        'Keuangan',
        'Neraca Standar',
        'Menampilkan neraca saldo standar untuk menilai posisi keuangan.',
        'ledger'
    ),
    // Pusat laba & biaya
    createReport(
        'profit-center-summary',
        'profit-center',
        'Analisa',
        'Laba Rugi per Departemen',
        'Memantau kontribusi laba rugi berdasarkan departemen dan pusat biaya.',
        'ledger'
    ),
    createReport(
        'profit-center-distribution',
        'profit-center',
        'Analisa',
        'Distribusi Beban Departemen',
        'Menganalisis distribusi beban operasional untuk setiap departemen.',
        'reports'
    ),
    // Buku besar
    createReport(
        'ledger-account-mutation',
        'ledger',
        'Buku Besar',
        'Mutasi Akun Perkiraan',
        'Menampilkan histori mutasi akun perkiraan lengkap dengan saldo berjalan.',
        'ledger'
    ),
    createReport(
        'ledger-general-journal',
        'ledger',
        'Buku Besar',
        'Jurnal Umum Lengkap',
        'Daftar semua jurnal transaksi keuangan per periode.',
        'document'
    ),
    createReport(
        'ledger-detail',
        'ledger',
        'Buku Besar',
        'Buku Besar Rincian',
        'Rincian mutasi debit dan kredit seluruh akun perkiraan secara kronologis.',
        'ledger'
    ),
    // Kas & bank
    createReport(
        'cash-bank-daily-balance',
        'cash-bank',
        'Kas & Bank',
        'Saldo Harian Bank',
        'Memantau saldo dan mutasi kas/bank per hari.',
        'ledger'
    ),
    createReport(
        'cash-bank-history-report',
        'cash-bank',
        'Kas & Bank',
        'Histori Transaksi Bank',
        'Daftar mutasi kas masuk dan keluar secara rinci.',
        'document'
    ),
    // Piutang
    createReport(
        'receivable-aging',
        'receivable',
        'Piutang',
        'Umur Piutang Pelanggan',
        'Membantu menilai jatuh tempo piutang dan tagihan tertunda.',
        'ledger'
    ),
    createReport(
        'receivable-outstanding',
        'receivable',
        'Piutang',
        'Rincian Piutang Belum Lunas',
        'Menampilkan daftar piutang aktif yang belum terselesaikan.',
        'document'
    ),
    // Penjualan
    createReport(
        'sales-by-customer',
        'sales',
        'Penjualan',
        'Penjualan per Pelanggan',
        'Menampilkan daftar nilai penjualan per pelanggan',
        'ledger'
    ),
    createReport(
        'sales-by-item',
        'sales',
        'Penjualan',
        'Penjualan per Barang',
        'Menampilkan daftar nilai penjualan per barang',
        'ledger'
    ),
    createReport(
        'sales-by-brand',
        'sales',
        'Penjualan',
        'Penjualan per Merek',
        'Menampilkan nilai penjualan per merk barang',
        'ledger'
    ),
    createReport(
        'sales-item-by-customer',
        'sales',
        'Penjualan',
        'Penjualan Barang per Pelanggan',
        'Menampilkan daftar nilai penjualan barang per pelanggan',
        'ledger'
    ),
    createReport(
        'sales-item-by-warehouse',
        'sales',
        'Penjualan',
        'Penjualan Barang per gudang',
        'Menampilkan nilai penjualan barang per gudang',
        'ledger'
    ),
    createReport(
        'sales-customer-by-item',
        'sales',
        'Penjualan',
        'Penjualan Pelanggan per Barang',
        'Menampilkan nilai penjualan pelanggan per barang',
        'ledger'
    ),
    createReport(
        'sales-process-history',
        'sales',
        'Penjualan',
        'Histori Proses Penjualan',
        'Menampilkan rantai proses penjualan dari penawaran hingga pembayaran',
        'activity'
    ),
    createReport(
        'sales-detail-by-customer',
        'sales',
        'Penjualan',
        'Rincian Penjualan per Pelanggan',
        'Menampilkan rincian nilai penjualan per pelanggan',
        'document'
    ),
    createReport(
        'sales-detail-by-item',
        'sales',
        'Penjualan',
        'Rincian Penjualan per Barang',
        'Menampilkan rincian nilai penjualan per barang',
        'document'
    ),
    createReport(
        'sales-by-branch',
        'sales',
        'Penjualan',
        'Penjualan per Cabang',
        'Menampilkan daftar nilai penjualan per cabang',
        'ledger'
    ),
    createReport(
        'sales-item-by-branch',
        'sales',
        'Penjualan',
        'Penjualan Barang per Cabang',
        'Menampilkan nilai penjualan barang per cabang',
        'ledger'
    ),
    createReport(
        'sales-return-by-item',
        'sales',
        'Penjualan',
        'Retur Penjualan per Barang',
        'Menampilkan nilai retur penjualan per barang',
        'ledger'
    ),
    createReport(
        'sales-monthly-chart',
        'sales',
        'Penjualan',
        'Grafik Penjualan Bulanan',
        'Menampilkan grafik batang penjualan per bulan',
        'reports'
    ),
    createReport(
        'sales-share-by-customer',
        'sales',
        'Penjualan',
        'Porsi Penjualan per Pelanggan',
        'Menampilkan porsi penjualan dari pelanggan',
        'reports'
    ),
    createReport(
        'sales-share-by-item',
        'sales',
        'Penjualan',
        'Porsi Penjualan per Barang',
        'Menampilkan porsi penjualan dari barang',
        'reports'
    ),
    createReport(
        'sales-quote-by-customer-unprocessed',
        'sales',
        'Penjualan',
        'Penawaran per Pelanggan (Belum Proses)',
        'Menampilkan nilai penawaran penjualan yang belum di proses per pelanggan',
        'ledger'
    ),
    createReport(
        'sales-quote-by-item-unprocessed',
        'sales',
        'Penjualan',
        'Penawaran per Barang (Belum Proses)',
        'Menampilkan nilai penawaran penjualan yang belum di proses per barang',
        'ledger'
    ),
    createReport(
        'sales-order-by-customer-unprocessed',
        'sales',
        'Penjualan',
        'Pesanan per Pelanggan (Belum Proses)',
        'Menampilkan nilai pesanan penjualan yang belum di proses per pelanggan',
        'ledger'
    ),
    createReport(
        'sales-order-by-item-unprocessed',
        'sales',
        'Penjualan',
        'Pesanan per Barang (Belum Proses)',
        'Menampilkan nilai pesanan penjualan yang belum di proses per barang',
        'ledger'
    ),
    createReport(
        'sales-advance-payment',
        'sales',
        'Penjualan',
        'Uang Muka Penjualan',
        'Menampilkan daftar uang muka penjualan grup per pelanggan',
        'document'
    ),
    createReport(
        'sales-target-item',
        'sales',
        'Penjualan',
        'Target Penjualan Barang',
        'Target Penjualan Barang',
        'document'
    ),
    createReport(
        'sales-target-category',
        'sales',
        'Penjualan',
        'Target Penjualan per Kategori',
        'Target Penjualan per Kategori',
        'document'
    ),
    // Salesperson
    createReport(
        'salesperson-performance',
        'salesperson',
        'Tenaga Penjual',
        'Kinerja Tenaga Penjual',
        'Menampilkan pencapaian omzet, margin, dan target per tenaga penjual.',
        'reports'
    ),
    // Utang
    createReport(
        'payable-aging',
        'payable',
        'Utang',
        'Umur Utang Pemasok',
        'Membantu memetakan tagihan pemasok yang segera jatuh tempo.',
        'ledger'
    ),
    // Pembelian
    createReport(
        'purchase-by-supplier',
        'purchase',
        'Pembelian',
        'Pembelian per Pemasok',
        'Meringkas total pembelian, retur, dan saldo pembelian per pemasok.',
        'ledger'
    ),
    // Persediaan
    createReport(
        'inventory-movement',
        'inventory',
        'Persediaan',
        'Pergerakan Stok Barang',
        'Melihat stok masuk, keluar, dan saldo akhir per barang.',
        'ledger'
    ),
    // Gudang
    createReport(
        'warehouse-stock-value',
        'warehouse',
        'Gudang',
        'Nilai Stok per Gudang',
        'Ringkasan kuantitas dan nilai stok per gudang.',
        'ledger'
    ),
    // Aset tetap
    createReport(
        'fixed-assets-depreciation',
        'fixed-assets',
        'Aset Tetap',
        'Penyusutan Aset Tetap',
        'Menampilkan nilai buku, penyusutan, dan umur aset tetap.',
        'ledger'
    ),
    // Pajak
    createReport(
        'tax-vat-summary',
        'tax',
        'Pajak',
        'Ringkasan PPN Keluaran dan Masukan',
        'Meringkas perhitungan PPN untuk kebutuhan pelaporan pajak.',
        'ledger'
    ),
    // Pemeriksaan
    createReport(
        'inspection-audit-trail',
        'inspection',
        'Pemeriksaan',
        'Jejak Audit Transaksi',
        'Menampilkan aktivitas perubahan transaksi untuk kebutuhan pemeriksaan.',
        'document'
    ),
    // Lain-lain
    createReport(
        'others-custom-form',
        'others',
        'Lain-lain',
        'Daftar Form Kustom',
        'Kumpulan laporan pendukung dan utilitas tambahan.',
        'document'
    ),
];

export function buildReportListConfig() {
    return {
        topActions: [],
        title: 'Laporan Tersimpan',
        searchPlaceholder: 'Cari...',
        categories,
        reports,
        emptyState: {
            title: 'Laporan tidak ditemukan',
            description: 'Coba ubah kata kunci pencarian atau pilih kategori laporan lain.',
        },
    };
}
