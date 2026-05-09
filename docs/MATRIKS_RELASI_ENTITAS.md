# Matriks Relasi Entitas

Dokumen ini memetakan entitas domain, relasi langsungnya, halaman yang memakainya, dan gap antara UI dengan model data yang sudah terdokumentasi.

## Cara Baca

- `Tercatat` berarti entitasnya sudah ada di `ENTITAS_DAN_RELASI_DOMAIN.md`.
- `Kandidat` berarti halaman/fiturnya sudah ada, tetapi entitas backend-nya belum diformalisasi di dokumen domain saat ini.
- Kolom `Halaman Terkait` adalah pemetaan praktis agar pencarian kebutuhan data bisa dimulai dari UI.

## A. Entitas Inti yang Sudah Tercatat

### Identity and Access

| Entitas | Relasi Langsung | Halaman Terkait | Status |
| --- | --- | --- | --- |
| `users` | many-to-many ke `roles` via `user_role`; one-to-many sebagai `created_by`, `approved_by`, `opened_by`, `closed_by` di transaksi | `Pengguna`, `Akses Grup`, `Cabang`, `Departemen`, `Gudang`, `Log Aktifitas` | Tercatat |
| `roles` | many-to-many ke `users` via `user_role` | `Akses Grup`, `Pengguna` | Tercatat |
| `user_role` | belongs-to `users`; belongs-to `roles` | `Akses Grup` | Tercatat |

### Organization

| Entitas | Relasi Langsung | Halaman Terkait | Status |
| --- | --- | --- | --- |
| `branches` | has-many `warehouses`; direferensikan transaksi penjualan, pembelian, kas, aset | `Cabang`, hampir semua halaman transaksi | Tercatat |
| `warehouses` | belongs-to `branches`; has-many `inventory_movements`, `stock_balances`, `goods_receipts`, `stock_transfers`, `stock_opnames` | `Gudang`, `Barang per Gudang`, `Pemindahan Barang`, `Perintah Stok Opname` | Tercatat |

### Product Catalog

| Entitas | Relasi Langsung | Halaman Terkait | Status |
| --- | --- | --- | --- |
| `product_categories` | self-reference via `parent_id`; has-many `products` | `Kategori Barang`, `Barang & Jasa` | Tercatat |
| `brands` | has-many `products` | `Barang & Jasa` | Tercatat |
| `units` | direferensikan `products`, `product_unit_conversions`, item transaksi | `Satuan Barang`, `Barang & Jasa` | Tercatat |
| `products` | belongs-to `product_categories`, `brands`, `units`; has-many `product_unit_conversions`, `product_barcodes`, `product_prices`; direferensikan hampir semua item transaksi | `Barang & Jasa`, `Harga Pemasok`, `Barang Stok Minimum`, seluruh transaksi barang | Tercatat |
| `product_unit_conversions` | belongs-to `products`; from/to `units` | `Barang & Jasa` | Tercatat |
| `product_barcodes` | belongs-to `products`; belongs-to `units` | `Barang & Jasa` | Tercatat |
| `price_tiers` | has-many `product_prices`; direferensikan `customers.default_price_tier_id` | `Pelanggan`, `Barang & Jasa` | Tercatat |
| `product_prices` | belongs-to `products`; belongs-to `price_tiers`; belongs-to `units` | `Barang & Jasa`, `Pelanggan` | Tercatat |

### Business Partners

| Entitas | Relasi Langsung | Halaman Terkait | Status |
| --- | --- | --- | --- |
| `suppliers` | has-many `purchase_orders`, `goods_receipts`, `purchase_invoices`, `purchase_returns`, `payments` | `Pemasok`, `Harga Pemasok`, seluruh transaksi pembelian | Tercatat |
| `customers` | has-many `sales_invoices`, `sales_returns`, `payments`; optional belongs-to `price_tiers` | `Pelanggan`, seluruh transaksi penjualan | Tercatat |

### Purchasing

| Entitas | Relasi Langsung | Halaman Terkait | Status |
| --- | --- | --- | --- |
| `purchase_orders` | belongs-to `suppliers`, `branches`, `warehouses`, `users`; has-many `purchase_order_items` | `Pesanan Pembelian` | Tercatat |
| `purchase_order_items` | belongs-to `purchase_orders`; belongs-to `products`; belongs-to `units` | `Pesanan Pembelian` | Tercatat |
| `goods_receipts` | belongs-to `purchase_orders` nullable; belongs-to `suppliers`; belongs-to `warehouses`; has-many `goods_receipt_items` | `Penerimaan Barang` | Tercatat |
| `goods_receipt_items` | belongs-to `goods_receipts`; belongs-to `products`; belongs-to `units` | `Penerimaan Barang` | Tercatat |
| `purchase_invoices` | belongs-to `suppliers`; optional ke `purchase_orders` dan `goods_receipts`; has-many `purchase_invoice_items` | `Faktur Pembelian` | Tercatat |
| `purchase_invoice_items` | belongs-to `purchase_invoices`; belongs-to `products`; belongs-to `units` | `Faktur Pembelian` | Tercatat |
| `purchase_returns` | belongs-to `suppliers`; belongs-to `warehouses`; optional ke `purchase_invoices`; has-many `purchase_return_items` | `Retur Pembelian` | Tercatat |
| `purchase_return_items` | belongs-to `purchase_returns`; belongs-to `products`; belongs-to `units` | `Retur Pembelian` | Tercatat |

### Sales and POS

| Entitas | Relasi Langsung | Halaman Terkait | Status |
| --- | --- | --- | --- |
| `cash_sessions` | belongs-to `branches`; belongs-to `users` sebagai pembuka/penutup; has-many `sales_invoices` | `Transaksi POS`, `Pembayaran`, `Penerimaan` | Tercatat |
| `sales_invoices` | belongs-to `branches`, `warehouses`, `cash_sessions`, `customers`, `users`; has-many `sales_invoice_items`; has-many `sales_returns` | `Faktur Penjualan`, `Penerimaan Penjualan`, `Retur Penjualan` | Tercatat |
| `sales_invoice_items` | belongs-to `sales_invoices`; belongs-to `products`; belongs-to `units` | `Faktur Penjualan` | Tercatat |
| `sales_returns` | optional belongs-to `sales_invoices`; belongs-to `branches`, `warehouses`, `customers`; has-many `sales_return_items` | `Retur Penjualan` | Tercatat |
| `sales_return_items` | belongs-to `sales_returns`; belongs-to `products`; belongs-to `units` | `Retur Penjualan` | Tercatat |

### Payments and Cash

| Entitas | Relasi Langsung | Halaman Terkait | Status |
| --- | --- | --- | --- |
| `payment_methods` | direferensikan `payments` | `Pembayaran`, `Penerimaan`, `Pembayaran Pembelian`, `Penerimaan Penjualan` | Tercatat |
| `cash_accounts` | optional belongs-to `branches`; direferensikan `payments` | `Transfer Bank`, `Pembayaran`, `Penerimaan` | Tercatat |
| `payments` | belongs-to `payment_methods`; optional belongs-to `cash_accounts`; polymorphic ringan ke partner lewat `partner_type` dan `partner_id`; has-many `payment_allocations` | `Pembayaran`, `Penerimaan`, `Pembayaran Pembelian`, `Penerimaan Penjualan` | Tercatat |
| `payment_allocations` | belongs-to `payments`; mengacu ke dokumen target via `reference_type` dan `reference_id` | `Pembayaran`, `Penerimaan` | Tercatat |

### Inventory Control

| Entitas | Relasi Langsung | Halaman Terkait | Status |
| --- | --- | --- | --- |
| `inventory_movements` | belongs-to `warehouses`, `products`, `units`; source polymorphic via `source_type` dan `source_id` | seluruh transaksi stok | Tercatat |
| `stock_balances` | belongs-to `warehouses`; belongs-to `products` | `Barang per Gudang`, `Barang Stok Minimum` | Tercatat |
| `stock_adjustments` | belongs-to `warehouses`; belongs-to `users`; has-many `stock_adjustment_items` | `Penyesuaian Persediaan`, `Penyesuaian Harga/Diskon` | Tercatat |
| `stock_adjustment_items` | belongs-to `stock_adjustments`; belongs-to `products`; belongs-to `units` | `Penyesuaian Persediaan`, `Penyesuaian Harga/Diskon` | Tercatat |
| `stock_transfers` | from/to `warehouses`; belongs-to `users`; has-many `stock_transfer_items` | `Pemindahan Barang` | Tercatat |
| `stock_transfer_items` | belongs-to `stock_transfers`; belongs-to `products`; belongs-to `units` | `Pemindahan Barang` | Tercatat |
| `stock_opnames` | belongs-to `warehouses`; belongs-to `users`; has-many `stock_opname_items` | `Perintah Stok Opname`, `Hasil Stok Opname` | Tercatat |
| `stock_opname_items` | belongs-to `stock_opnames`; belongs-to `products`; belongs-to `units` | `Perintah Stok Opname`, `Hasil Stok Opname` | Tercatat |

## B. Kandidat Entitas yang Sudah Terlihat dari UI

Entitas di bawah ini sangat kuat indikasinya dibutuhkan karena halamannya sudah ada dan inputnya sudah jelas, tetapi belum tercatat formal di dokumen domain saat ini.

| Kandidat Entitas | Indikasi dari Halaman | Kandidat Relasi Penting |
| --- | --- | --- |
| `sales_quotes` dan `sales_quote_items` | `Penawaran Penjualan` | customer, branch, items, tax, shipping |
| `sales_orders` dan `sales_order_items` | `Pesanan Penjualan`, `Pemenuhan Pesanan` | customer, branch, items, delivery schedule |
| `sales_deliveries` dan `sales_delivery_items` | `Pengiriman Pesanan` | sales order, warehouse, customer, items |
| `sales_deposits` | `Uang Muka Penjualan` | customer, payment, sales invoice atau sales order |
| `purchase_deposits` | `Uang Muka Pembelian` | supplier, payment, purchase order atau purchase invoice |
| `supplier_prices` | `Harga Pemasok` | supplier, product, unit, effective period |
| `customer_categories` | `Kategori Pelanggan` | has-many customers |
| `supplier_categories` | `Kategori Pemasok` | has-many suppliers |
| `sales_categories` | `Kategori Penjualan` | kemungkinan dipakai penjualan dan laporan |
| `contacts` dan `partner_addresses` | `Kontak`, tab kontak/alamat di pelanggan dan pemasok | polymorphic ke customer/supplier |
| `numbering_sequences` | `Penomoran` | dipakai banyak tipe transaksi |
| `approval_rules` | `Penyetuju Transaksi` | role/user, transaction type, threshold |
| `print_designs` | `Desain Cetakan` | transaction type, template metadata |
| `activity_logs` dan `journal_activity_logs` | `Log Aktifitas`, `Log Aktifitas Jurnal` | user, entity, action, timestamp |
| `recurring_transactions` | `Transaksi Berulang` | source transaction, schedule |
| `favorite_transactions` | `Transaksi Favorit` | user, transaction preset |
| `budgets` dan `budget_transfers` | `Anggaran`, `Transfer Anggaran`, `Monitor Anggaran` | account, branch, department, period |
| `expense_entries` | `Pencatatan Beban` | account, partner optional, payment status |
| `bank_reconciliations` dan `bank_statements` | `Rekening Koran`, `Histori Bank`, `Rekonsiliasi Bank` | cash account, statement line, journal |
| `fixed_assets` | `Aset Tetap` | branch, department, asset category, accounts |
| `asset_categories` | `Kategori Aset` | has-many fixed assets |
| `asset_tax_categories` | `Kategori Aset Tetap Pajak` | has-many fixed assets |
| `asset_changes` | `Perubahan Aset Tetap` | fixed asset, expense lines |
| `asset_disposals` | `Disposisi Aset Tetap` | fixed asset, gain/loss account |
| `asset_moves` dan `asset_move_items` | `Pindah Aset`, `Aset per Lokasi` | fixed asset, source/destination location |
| `salary_allowances` | `Gaji/Tunjangan` | payroll configuration |
| `employees` | `Karyawan` | branch, department, payroll account, tax setup |
| `work_orders`, `work_order_items` | `Pekerjaan Pesanan` | branch, customer ref, material issue, completion |
| `material_additions` | `Penambahan Bahan Baku` | work order, product, quantity |
| `work_completions` | `Penyelesaian Pesanan` | work order, finished goods, output quantity |
| `delivery_orders` | `Pengiriman Pesanan` atau `delivery-order` | sales order, shipping |
| `reports` atau `report_definitions` | `Daftar Laporan` | category, filters, output format |

## C. Relasi Praktis per Area Proses

### Penjualan

`customers` -> dokumen pra-penjualan kandidat (`sales_quotes`, `sales_orders`) -> `sales_invoices` -> `payments` / `payment_allocations` -> `sales_returns`

### Pembelian

`suppliers` -> `purchase_orders` -> `goods_receipts` -> `purchase_invoices` -> `payments` / `payment_allocations` -> `purchase_returns`

### Persediaan

`products` + `warehouses` -> `inventory_movements` -> `stock_balances`

`stock_adjustments`, `stock_transfers`, `stock_opnames`, `goods_receipts`, `sales_invoice_items`, `sales_return_items`, dan `purchase_return_items` semuanya pada akhirnya memengaruhi `inventory_movements`.

### Aset

`fixed_assets` -> `asset_changes` / `asset_moves` / `asset_disposals`

### Otorisasi

`users` <-> `roles` -> `approval_rules` kandidat -> dipakai oleh dokumen transaksi yang memerlukan persetujuan.

## D. Gap yang Masih Perlu Dilengkapi

- Relasi formal untuk entitas kandidat belum ditulis sebagai skema domain final.
- Belum ada daftar foreign key nullable vs mandatory per entitas.
- Belum ada aturan cardinality per transaksi turunan, misalnya `sales_order -> sales_delivery -> sales_invoice`.
- Belum ada pemetaan lifecycle status per entitas, padahal banyak halaman transaksi sudah memakai status.
- Belum ada matriks `entity -> controller/service/component` di backend karena backend domain masih minimal.
