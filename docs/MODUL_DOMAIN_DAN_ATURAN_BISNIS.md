# Domain Modules and Business Rules

Dokumen ini merangkum target produk, modul inti, aturan bisnis, alur minimum, dan prioritas MVP.

## Target Produk

Sistem ini ditujukan untuk toko bangunan yang membutuhkan:

- penjualan POS cepat
- pembelian ke supplier
- kontrol stok multi-satuan
- kontrol stok per gudang
- retur penjualan dan pembelian
- pembayaran tunai, transfer, QRIS, dan tempo
- pelacakan piutang dan hutang
- laporan stok, penjualan, pembelian, margin, dan kas

## Modul Inti

### Master Data

- cabang
- gudang
- kategori barang
- brand atau merk
- barang
- satuan dan konversi satuan
- barcode per satuan
- supplier
- customer
- metode pembayaran
- level harga

### Inventory

- saldo stok per gudang
- kartu stok
- mutasi stok
- penyesuaian stok
- stok opname
- transfer antar gudang

### Purchasing

- purchase order
- penerimaan barang
- faktur pembelian
- retur pembelian
- pembayaran hutang supplier

### Sales / POS

- transaksi POS
- invoice penjualan
- retur penjualan
- penerimaan pembayaran customer
- shift kasir

### Finance Lite

- kas dan bank
- hutang usaha
- piutang usaha
- pembayaran dan penerimaan
- biaya operasional sederhana

### Reporting

- penjualan harian
- penjualan per barang
- margin kotor
- pembelian
- stok dan mutasi
- stok minimum
- piutang
- hutang
- kas
- audit aktivitas

## Aturan Bisnis Penting

1. Barang bisa dibeli dan dijual dalam satuan berbeda, tetapi stok harus konsisten pada satuan dasar.
2. Harga jual dan harga beli tidak boleh ditimpa tanpa histori.
3. Semua transaksi stok harus menghasilkan record di `inventory_movements`.
4. Retur penjualan hanya menambah stok jika barang benar-benar kembali fisik.
5. Retur pembelian hanya mengurangi stok jika barang benar-benar dikembalikan ke supplier.
6. Invoice tempo wajib menyimpan `due_date` dan `outstanding_amount`.
7. Pembayaran boleh dialokasikan ke lebih dari satu invoice.
8. Stok tidak boleh negatif kecuali ada aturan eksplisit.
9. Transaksi final sebaiknya tidak dihapus; gunakan cancel atau reversal.
10. Nomor dokumen harus unik per tipe transaksi.

## Alur Bisnis Minimum

### Pembelian

1. Buat `purchase_order`
2. Barang datang, buat `goods_receipt`
3. Stok masuk ke `inventory_movements`
4. Tagihan supplier dibuat sebagai `purchase_invoice`
5. Pembayaran dicatat di `payments`

### Penjualan POS

1. Kasir buka `cash_session`
2. Buat `sales_invoice`
3. Simpan item, harga, diskon, pajak, dan snapshot biaya
4. Saat final, stok keluar ke `inventory_movements`
5. Pembayaran dicatat
6. Jika belum lunas, tersimpan sebagai piutang

### Transfer Gudang

1. Buat `stock_transfer`
2. Gudang asal keluarkan stok
3. Gudang tujuan terima stok

### Stock Opname

1. Mulai `stock_opname`
2. Simpan hasil hitung fisik
3. Review selisih
4. Posting hasilnya ke penyesuaian stok

## Prioritas MVP

### Cakupan awal

- autentikasi dan role dasar
- master barang, kategori, satuan, supplier, customer, gudang
- transaksi penjualan POS
- transaksi pembelian sederhana
- stok masuk dan keluar otomatis
- retur sederhana
- laporan penjualan dan stok dasar

### Tunda dulu

- multi-cabang kompleks
- promosi kompleks
- bundling
- konsinyasi
- serial number
- batch atau expiry yang kompleks
- akuntansi penuh
- approval workflow bertingkat
