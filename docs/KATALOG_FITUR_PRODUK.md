# Katalog Fitur Produk

Dokumen ini merangkum kemampuan produk dari level yang paling mudah dibaca: tujuan bisnis, kelompok fitur, halaman terkait, entitas utama, dan status implementasi saat ini.

## Status yang Dipakai

- `UI implemented`: halaman dan view component sudah ada.
- `Shell only`: halaman sudah bisa dibuka, tetapi kontennya masih placeholder.
- `Domain partial`: kebutuhan bisnisnya jelas, tetapi model backend formalnya belum lengkap.

## A. Product Goal

Produk ini mengarah ke sistem POS toko bangunan dengan cakupan:

- penjualan cepat
- pembelian ke supplier
- kontrol stok multi-gudang dan multi-satuan
- kas, bank, pembayaran, piutang, hutang
- aset tetap
- laporan operasional
- integrasi pajak dan channel SmartLink pada tahap lanjut

## B. Feature Groups

| Kelompok Fitur | Tujuan | Halaman Kunci | Entitas Utama | Status |
| --- | --- | --- | --- | --- |
| Auth dan Entry | masuk ke sistem dan memilih sample dashboard | `Login`, `Register`, `Dashboard` | `users` | UI implemented |
| Workspace Shell | navigasi sidebar, tab page, dashboard widget, search modal | `Dashboard`, modal global | tidak langsung ke entitas domain | UI implemented |
| Identity and Access | kelola user, grup akses, approval transaksi, numbering | `Pengguna`, `Akses Grup`, `Penyetuju Transaksi`, `Penomoran` | `users`, `roles`, kandidat `approval_rules`, `numbering_sequences` | UI implemented, Domain partial |
| Company Setup | setup cabang, departemen, preferensi, mata uang, pajak, syarat bayar, pengiriman | `Preferensi`, `Cabang`, `Departemen`, `Mata Uang`, `Pajak`, `Syarat Pembayaran`, `Pengiriman`, `FOB` | `branches`, `warehouses`, kandidat `preferences`, `taxes`, `payment_terms`, `shipping_methods` | UI implemented, Domain partial |
| Master Partner | data pelanggan, pemasok, kontak, kategori | `Pelanggan`, `Pemasok`, `Kontak`, `Kategori Pelanggan`, `Kategori Pemasok` | `customers`, `suppliers`, kandidat `contacts`, `customer_categories`, `supplier_categories` | UI implemented, Domain partial |
| Master Produk | barang, kategori, satuan, harga, stok per gudang | `Barang & Jasa`, `Kategori Barang`, `Satuan Barang`, `Harga Pemasok`, `Barang per Gudang` | `products`, `product_categories`, `units`, `product_prices`, `stock_balances` | UI implemented |
| General Ledger dan Expense | akun, jurnal, pencatatan beban, anggaran, histori akun | `Akun Perkiraan`, `Jurnal Umum`, `Pencatatan Beban`, `Anggaran`, `Monitor Anggaran` | kandidat `accounts`, `journals`, `expense_entries`, `budgets` | UI implemented, Domain partial |
| Cash and Bank | penerimaan, pembayaran, transfer bank, bank inquiry, supplier transfer | `Pembayaran`, `Penerimaan`, `Transfer Bank`, `Rekening Koran`, `Histori Bank`, `Rekonsiliasi Bank`, `Transfer Pemasok` | `payments`, `payment_methods`, `cash_accounts`, kandidat `bank_statements`, `bank_reconciliations` | UI implemented, Domain partial |
| Sales Flow | penawaran, pesanan, pengiriman, invoice, uang muka, penerimaan, retur | seluruh halaman `Penjualan` | `sales_invoices`, `sales_returns`, kandidat `sales_quotes`, `sales_orders`, `sales_deliveries`, `sales_deposits` | UI implemented, Domain partial |
| Purchase Flow | pesanan, penerimaan barang, invoice, uang muka, pembayaran, retur | seluruh halaman `Pembelian` | `purchase_orders`, `goods_receipts`, `purchase_invoices`, `purchase_returns`, kandidat `purchase_deposits` | UI implemented, Domain partial |
| Inventory Flow | permintaan barang, transfer, penyesuaian, opname, fulfillment | `Permintaan Barang`, `Pemindahan Barang`, `Penyesuaian Persediaan`, `Perintah Stok Opname`, `Hasil Stok Opname`, `Pemenuhan Pesanan` | `inventory_movements`, `stock_balances`, `stock_adjustments`, `stock_transfers`, `stock_opnames` | UI implemented |
| Work Order / Manufacturing Lite | pekerjaan pesanan, penambahan bahan baku, penyelesaian | `Pekerjaan Pesanan`, `Penambahan Bahan Baku`, `Penyelesaian Pesanan` | kandidat `work_orders`, `material_additions`, `work_completions` | UI implemented, Domain partial |
| Fixed Assets | master aset, kategori, perubahan, disposisi, perpindahan | seluruh halaman `Aset Tetap` | kandidat `fixed_assets`, `asset_categories`, `asset_changes`, `asset_moves`, `asset_disposals` | UI implemented, Domain partial |
| Reporting | daftar laporan operasional | `Daftar Laporan` | kandidat `report_definitions` | UI implemented, Domain partial |
| Tax SmartLink | e-Faktur dan email faktur pajak | `e-Faktur CTAS`, `Email Faktur Pajak`, `e-Faktur Legacy` | belum diformalisasi | Shell only |
| SmartLink Channels | e-Banking, virtual account, e-Payment, e-Commerce | halaman `SmartLink` | belum diformalisasi | Shell only |
| Tax Reports and AI | SPT PPN, SPT PPh 21, bukti potong, analisa AI | halaman pajak dan AI | belum diformalisasi | Shell only |

## C. Fitur Inti per Proses Bisnis

### 1. Penjualan

Rangkaian fitur yang sudah terlihat jelas di UI:

1. penawaran penjualan
2. pesanan penjualan
3. pengiriman pesanan
4. faktur penjualan
5. penerimaan pembayaran
6. retur penjualan
7. komisi penjual
8. target penjualan

Kondisi saat ini:

- shell UI sudah kuat
- mapping entitas final untuk pra-penjualan belum tertulis formal di dokumen domain

### 2. Pembelian

Rangkaian fitur yang sudah terlihat jelas di UI:

1. pesanan pembelian
2. penerimaan barang
3. faktur pembelian
4. pembayaran pembelian
5. retur pembelian
6. harga pemasok

Kondisi saat ini:

- entity inti pembelian sudah cukup tercatat
- `uang muka pembelian` masih butuh entitas formal terpisah

### 3. Persediaan

Rangkaian fitur yang sudah terlihat jelas di UI:

1. master barang dan gudang
2. stok per gudang
3. mutasi dan penyesuaian
4. transfer antar gudang
5. stok opname
6. permintaan barang
7. fulfillment pesanan

Kondisi saat ini:

- domain stok paling dekat dengan kebutuhan nyata
- hubungan `movement source` lintas transaksi sudah terlihat jelas

### 4. Akses dan Kontrol

Rangkaian fitur:

1. user
2. grup akses
3. approval transaksi
4. numbering
5. log aktifitas

Kondisi saat ini:

- sisi UI sudah siap
- backend access matrix dan approval engine belum terlihat sebagai kelas domain nyata

## D. Area yang Sudah Paling Siap

- navigasi dan shell workspace
- master data dasar
- transaksi penjualan dan pembelian dari sisi UI
- inventory control dasar
- fixed assets dari sisi form dan inquiry

## E. Area yang Masih Punya Gap Dokumentasi Domain

- pra-penjualan dan pra-pembelian
- budgeting
- expense entry
- approval rules
- print design
- recurring/favorite transaction
- fixed assets sebagai model backend nyata
- SmartLink dan pajak lanjutan

## F. Rekomendasi Urutan Analisis

Jika nanti butuh analisis yang rapi per lapisan, urutannya paling efektif adalah:

1. baca `KATALOG_FITUR_PRODUK.md` untuk memahami cakupan produk
2. baca `PETA_HALAMAN_ENTITAS_DAN_FITUR.md` untuk melihat fitur itu hidup di halaman mana
3. baca `MATRIKS_RELASI_ENTITAS.md` untuk melihat kebutuhan data dan relasi
4. baca `INDEKS_KELAS_DAN_KOMPONEN.md` untuk mencari lokasi implementasinya di codebase
