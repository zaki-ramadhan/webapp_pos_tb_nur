# Daftar Model Controller View

Dokumen ini adalah audit backend yang diturunkan dari UI `Data Baru` dan halaman detail.

Sumber audit:

- `resources/js/features/workspace/modules/*`
- `resources/js/features/workspace/modules/shared/*`
- `app/Support/Presentation/PosBlueprint.php`
- [HALAMAN_WORKSPACE_DAN_INPUT.md](./HALAMAN_WORKSPACE_DAN_INPUT.md)
- [PETA_HALAMAN_ENTITAS_DAN_FITUR.md](./PETA_HALAMAN_ENTITAS_DAN_FITUR.md)
- [ENTITAS_DAN_RELASI_DOMAIN.md](./ENTITAS_DAN_RELASI_DOMAIN.md)

## Status Audit

- dokumen ini `lebih aman` daripada draft awal karena sudah menggabungkan:
  - input create/detail
  - section/tab form
  - tabel child row
  - modal item/detail
  - lookup relation antar halaman
- dokumen ini `belum final 100%` untuk migration database
- alasan belum final:
  - beberapa field UI masih placeholder
  - beberapa modul masih reuse view/config yang sama
  - sebagian relasi approval, attachment, dan audit belum formal di backend

## Cara Baca

Format tiap modul:

- `Model utama`: tabel/header entity utama
- `Child model`: tabel detail/row/modal turunan
- `Lookup ke`: entity lain yang dipilih dari field lookup/select/chip
- `Field inti`: field yang paling jelas terlihat dari halaman create/detail
- `Relasi inti`: arah relasi yang paling mungkin
- `Confidence`: `tinggi`, `menengah`, atau `rendah`

## Pola Bersama yang Hampir Pasti Dipakai

### Child / nested yang berulang

- `..._items`
- `..._additional_charges`
- `..._attachments`
- `..._tax_details`
- `..._approvals`
- `..._branch_scopes`
- `..._contacts`
- `..._addresses`

### Lookup yang sering muncul

- `branches`
- `departments`
- `warehouses`
- `accounts`
- `currencies`
- `taxes`
- `payment_terms`
- `shipping_methods`
- `fob_terms`
- `customers`
- `suppliers`
- `products`
- `units`
- `users`

### Controller pattern yang disarankan

- `index`
- `store`
- `show`
- `update`
- `destroy`

Untuk dokumen transaksi, hampir pasti butuh tambahan:

- `submit`
- `approve`
- `cancel`
- `attach`
- `syncItems`

## A. Sistem dan Akses

### Preferensi

- Model utama: `preferences`, `company_profiles`
- Child model: `preference_sections`, `preference_flags`, `preference_account_mappings`
- Lookup ke: `branches`, `accounts`, `users`
- Field inti: nama perusahaan, kategori usaha, telepon, email, tanggal mulai data, periode akuntansi, mata uang, setting penjualan/pembelian/pajak/pembatasan/approval/lampiran
- Relasi inti:
  - `company_profiles` one-to-one `preferences`
  - `preferences` has-many `preference_flags`
  - `preferences` has-many `preference_account_mappings`
- Controller: `PreferenceController`
- View: `PreferencesView`
- Confidence: `menengah`

### Akses Grup

- Model utama: `access_groups`
- Child model: `access_group_permissions`, `access_group_users`
- Lookup ke: `users`, `workspace_pages` atau `menu_keys`
- Field inti: nama grup, daftar user, matrix `active/create/update/delete/view`
- Relasi inti:
  - `access_groups` many-to-many `users`
  - `access_groups` has-many `access_group_permissions`
- Controller: `GroupAccessController`
- View: `GroupAccessView`
- Confidence: `tinggi`

### Pengguna

- Model utama: `users`
- Child model: `user_roles`, `user_branch_access`
- Lookup ke: `access_groups`, `roles`, `branches`
- Field inti: no handphone/email, jenis akses, grup akses
- Relasi inti:
  - `users` belongs-to-many `access_groups`
  - `users` belongs-to-many `roles`
  - `users` belongs-to-many `branches`
- Controller: `UserController`
- View: `UsersManagementView`
- Confidence: `tinggi`

### Penomoran

- Model utama: `numbering_sequences`
- Child model: `numbering_sequence_components`, `numbering_sequence_users`
- Lookup ke: `users`, `transaction_types`
- Field inti: nama, tipe transaksi, tipe penomoran, digit counter, komponen penomoran, daftar pengguna
- Relasi inti:
  - `numbering_sequences` has-many `numbering_sequence_components`
  - `numbering_sequences` belongs-to-many `users`
- Controller: `NumberingController`
- View: `NumberingView`
- Confidence: `tinggi`

### Desain Cetakan

- Model utama: `print_designs`
- Child model: `print_design_fields`, `print_design_layouts`
- Lookup ke: `transaction_types`
- Field inti: metadata template dan setting cetak
- Relasi inti:
  - `print_designs` has-many `print_design_fields`
- Controller: `PrintDesignController`
- View: `PrintDesignView`
- Confidence: `menengah`

### Penyetuju Transaksi

- Model utama: `transaction_approval_rules`
- Child model: `transaction_approval_rule_steps`
- Lookup ke: `branches`, `users`, `roles`, `transaction_types`
- Field inti: tipe transaksi, nilai ambang, cabang, rule approval
- Relasi inti:
  - `transaction_approval_rules` has-many `transaction_approval_rule_steps`
  - tiap step belongs-to `users` atau `roles`
- Controller: `TransactionApprovalController`
- View: `TransactionApprovalView`
- Confidence: `tinggi`

## B. Master Dasar

### Cabang

- Model utama: `branches`
- Child model: `branch_users`, `branch_addresses`
- Lookup ke: `users`
- Field inti: nama, telepon, jalan, kota, kode pos, provinsi, negara, daftar pengguna
- Relasi inti:
  - `branches` belongs-to-many `users`
  - `branches` has-many `warehouses`
- Controller: `BranchController`
- View: `BranchView`
- Confidence: `tinggi`

### Departemen

- Model utama: `departments`
- Child model: `department_opening_balances`, `department_users`
- Lookup ke: `users`, `accounts`
- Field inti: nama departemen, saldo awal, daftar pengguna
- Relasi inti:
  - `departments` belongs-to-many `users`
  - `departments` has-many `department_opening_balances`
- Controller: `DepartmentController`
- View: `DepartmentView`
- Confidence: `tinggi`

### Mata Uang

- Model utama: `currencies`
- Child model: `currency_rates`
- Lookup ke: none atau base currency
- Field inti: kode, simbol, nama, kurs, status
- Relasi inti:
  - `currencies` has-many `currency_rates`
- Controller: `CurrencyController`
- View: `CurrencyView`
- Confidence: `menengah`

### Akun Perkiraan

- Model utama: `accounts`
- Child model: `account_opening_balances`, `account_users`
- Lookup ke: `currencies`, `branches`, `accounts` parent, `users`
- Field inti: tipe akun, sub akun, kode, nama, mata uang, saldo, cabang, per tanggal, catatan, semua pengguna, no bukti kas/bank
- Relasi inti:
  - `accounts` self-reference parent-child
  - `accounts` belongs-to `currencies`
  - `accounts` belongs-to-many `branches`
  - `accounts` belongs-to-many `users`
- Controller: `AccountController`
- View: `AccountsView`
- Confidence: `tinggi`

### Pajak

- Model utama: `taxes`
- Child model: `tax_accounts`
- Lookup ke: `accounts`
- Field inti: tipe pajak, keterangan, persentase, akun pajak keluaran, akun pajak masukan
- Relasi inti:
  - `taxes` belongs-to `accounts` untuk keluaran/masukan
- Controller: `TaxController`
- View: `TaxView`
- Confidence: `tinggi`

### Syarat Pembayaran

- Model utama: `payment_terms`
- Child model: none atau `payment_term_rules`
- Lookup ke: none
- Field inti: nama termin, hari jatuh tempo, aktif/nonaktif
- Relasi inti:
  - direferensikan oleh customer, supplier, sales, purchase
- Controller: `PaymentTermController`
- View: `PaymentTermsView`
- Confidence: `menengah`

### Pengiriman

- Model utama: `shipping_methods`
- Child model: none
- Lookup ke: none
- Field inti: nama pengiriman
- Relasi inti:
  - direferensikan dokumen sales/purchase
- Controller: `ShippingController`
- View: `ShippingView`
- Confidence: `menengah`

### FOB

- Model utama: `fob_terms`
- Child model: none
- Lookup ke: none
- Field inti: nama FOB
- Relasi inti:
  - direferensikan dokumen sales/purchase
- Controller: `FobController`
- View: `SimpleMasterView`
- Confidence: `menengah`

### Gaji/Tunjangan

- Model utama: `salary_allowances`
- Child model: none
- Lookup ke: `accounts`
- Field inti: nama, tipe, penghasilan/potongan, akun beban, nonaktif
- Relasi inti:
  - `salary_allowances` belongs-to `accounts`
- Controller: `SalaryAllowanceController`
- View: `SalaryAllowanceView`
- Confidence: `tinggi`

### Karyawan

- Model utama: `employees`
- Child model: `employee_addresses`, `employee_tax_profiles`, `employee_bank_accounts`
- Lookup ke: `branches`, `departments`, `salary_allowances`, `accounts`
- Field inti:
  - identitas: sapaan, nama lengkap, jabatan, email, HP, telepon, WhatsApp, website
  - status: kewarganegaraan, tipe ID karyawan, tanggal bergabung, status kerja
  - pajak: status PTKP, bulan/tahun mulai pajak, catatan perhitungan
  - payroll: rekening gaji
- Relasi inti:
  - `employees` belongs-to `branches`
  - `employees` belongs-to `departments`
  - `employees` has-one `employee_tax_profiles`
  - `employees` has-many `employee_bank_accounts`
- Controller: `EmployeeController`
- View: `EmployeeView`
- Confidence: `tinggi`

### Kontak

- Model utama: `contacts`
- Child model: none
- Lookup ke: `customers`, `suppliers`, `branches`
- Field inti: identitas kontak dan relasi owner
- Relasi inti:
  - paling aman polymorphic: `contacts` morph-to `contactable`
- Controller: `ContactController`
- View: `ContactView`
- Confidence: `menengah`

## C. Partner Bisnis

### Pelanggan

- Model utama: `customers`
- Child model: `customer_addresses`, `customer_contacts`, `customer_branch_scopes`, `customer_bank_accounts`, `customer_tax_profiles`
- Lookup ke: `customer_categories`, `currencies`, `payment_terms`, `branches`, `contacts`, `price_tiers`
- Field inti:
  - nama, kategori, telepon bisnis, handphone, WhatsApp, email, fax, website
  - alamat tagihan dan alamat kirim
  - dipakai di cabang
  - mata uang utama
  - kontak
  - pengaturan penjualan/piutang
  - data pajak
  - batas piutang
  - catatan
- Relasi inti:
  - `customers` belongs-to `customer_categories`
  - `customers` belongs-to `currencies`
  - `customers` belongs-to `payment_terms`
  - `customers` belongs-to-many `branches`
  - `customers` has-many `customer_addresses`
  - `customers` has-many `customer_contacts`
- Controller: `CustomerController`
- View: `BusinessPartnerView`
- Confidence: `tinggi`

### Pemasok

- Model utama: `suppliers`
- Child model: `supplier_addresses`, `supplier_contacts`, `supplier_branch_scopes`, `supplier_bank_accounts`, `supplier_tax_profiles`
- Lookup ke: `supplier_categories`, `currencies`, `payment_terms`, `branches`, `contacts`
- Field inti:
  - nama, kategori, telepon bisnis, handphone, WhatsApp, email, fax, website
  - alamat tagihan
  - dipakai di cabang
  - mata uang utama
  - kontak
  - pengaturan pembelian
  - rekening bank
  - info pajak
  - catatan
- Relasi inti:
  - `suppliers` belongs-to `supplier_categories`
  - `suppliers` belongs-to `currencies`
  - `suppliers` belongs-to `payment_terms`
  - `suppliers` belongs-to-many `branches`
  - `suppliers` has-many `supplier_bank_accounts`
  - `suppliers` has-many `supplier_contacts`
- Controller: `SupplierController`
- View: `BusinessPartnerView`
- Confidence: `tinggi`

### Kategori Partner

- Model utama:
  - `customer_categories`
  - `supplier_categories`
  - `sales_categories`
- Child model: none
- Lookup ke: parent category jika bertingkat
- Field inti:
  - customer/supplier category: nama, default, subkategori
  - sales category: nama, keterangan
- Relasi inti:
  - masing-masing has-many ke entity pemakainya
- Controller:
  - `CustomerCategoryController`
  - `SupplierCategoryController`
  - `SalesCategoryController`
- View: `SimpleMasterView`
- Confidence: `tinggi`

## D. Barang, Gudang, dan Persediaan

### Gudang

- Model utama: `warehouses`
- Child model: `warehouse_users`
- Lookup ke: `branches`, `users`
- Field inti: nama gudang, cabang, daftar pengguna, atribut gudang
- Relasi inti:
  - `warehouses` belongs-to `branches`
  - `warehouses` belongs-to-many `users`
- Controller: `WarehouseController`
- View: `WarehouseView`
- Confidence: `tinggi`

### Satuan Barang

- Model utama: `units`
- Child model: none
- Lookup ke: `taxes`
- Field inti: nama, pajak, ref kode pajak
- Relasi inti:
  - `units` direferensikan `products` dan item transaksi
- Controller: `ItemUnitController`
- View: `SimpleMasterView`
- Confidence: `menengah`

### Kategori Barang

- Model utama: `product_categories`
- Child model: self child categories
- Lookup ke: parent category
- Field inti: nama kategori, parent/anak kategori
- Relasi inti:
  - `product_categories` self-reference parent-child
  - `product_categories` has-many `products`
- Controller: `ItemCategoryController`
- View: `ItemCategoryView`
- Confidence: `tinggi`

### Barang & Jasa

- Model utama: `products`
- Child model:
  - `product_unit_conversions`
  - `product_prices`
  - `product_opening_stocks`
  - `product_images`
  - `product_account_mappings`
  - `supplier_products`
- Lookup ke: `product_categories`, `units`, `brands`, `suppliers`, `taxes`, `accounts`, `warehouses`
- Field inti:
  - nama barang, kategori barang, jenis barang
  - kode barang, barcode
  - satuan dasar, konversi satuan
  - merek
  - pemasok utama
  - harga jual/beli
  - stok minimum
  - pajak
  - saldo awal stok
  - akun-akun
  - gambar
  - dimensi, berat, catatan
- Relasi inti:
  - `products` belongs-to `product_categories`
  - `products` belongs-to `brands`
  - `products` belongs-to `units` sebagai base unit
  - `products` has-many `product_unit_conversions`
  - `products` has-many `product_prices`
  - `products` has-many `product_images`
  - `products` belongs-to-many `suppliers`
- Controller: `ItemController`
- View: `ItemsServicesView`
- Confidence: `tinggi`

### Harga Pemasok

- Model utama: `supplier_prices`
- Child model: none
- Lookup ke: `suppliers`, `products`, `units`
- Field inti: pemasok, barang, harga, periode harga
- Relasi inti:
  - `supplier_prices` belongs-to `suppliers`
  - `supplier_prices` belongs-to `products`
  - `supplier_prices` belongs-to `units`
- Controller: `SupplierPriceController`
- View: `SupplierPriceView`
- Confidence: `tinggi`

### Penyesuaian Persediaan

- Model utama: `stock_adjustments`
- Child model: `stock_adjustment_items`
- Lookup ke: `accounts`, `branches`, `warehouses`, `products`, `units`
- Field inti: tanggal, nomor penyesuaian, akun penyesuaian, keterangan, cabang, rincian barang
- Relasi inti:
  - `stock_adjustments` belongs-to `accounts`
  - `stock_adjustments` belongs-to `branches`
  - `stock_adjustments` belongs-to `warehouses`
  - `stock_adjustments` has-many `stock_adjustment_items`
- Controller: `InventoryAdjustmentController`
- View: `InventoryAdjustmentView`
- Confidence: `tinggi`

### Penyesuaian Harga/Diskon

- Model utama: `price_adjustments` atau reuse `stock_adjustments`
- Child model: `price_adjustment_items`
- Lookup ke: `accounts`, `branches`, `products`
- Field inti: tanggal, nomor penyesuaian, akun penyesuaian, keterangan, cabang, rincian barang
- Relasi inti:
  - bila aturan bisnis berbeda dari stok, lebih aman pisah dari `stock_adjustments`
- Controller: `PriceAdjustmentController`
- View: `InventoryAdjustmentView`
- Confidence: `menengah`

### Permintaan Barang

- Model utama: `item_requests`
- Child model: `item_request_items`
- Lookup ke: `branches`, `products`, `units`, `departments`, `warehouses`
- Field inti: tanggal permintaan, tipe permintaan, nomor dokumen, cabang, keterangan, rincian barang
- Relasi inti:
  - `item_requests` belongs-to `branches`
  - `item_requests` has-many `item_request_items`
- Controller: `ItemRequestController`
- View: `ItemRequestView`
- Confidence: `tinggi`

### Pemindahan Barang

- Model utama: `stock_transfers`
- Child model: `stock_transfer_items`
- Lookup ke: `warehouses`, `branches`, `products`, `units`
- Field inti: proses, gudang asal/tujuan, nomor pemindahan, tanggal, keterangan, cabang, rincian barang
- Relasi inti:
  - `stock_transfers` belongs-to `warehouses` asal dan tujuan
  - `stock_transfers` belongs-to `branches`
  - `stock_transfers` has-many `stock_transfer_items`
- Controller: `StockTransferController`
- View: `StockTransferView`
- Confidence: `tinggi`

### Pekerjaan Pesanan

- Model utama: `work_orders`
- Child model: `work_order_items`, `work_order_charges`, `work_order_infos`
- Lookup ke: `customers`, `accounts`, `branches`, `products`, `units`
- Field inti: tanggal, nomor batch, referensi pelanggan, akun biaya, akun selisih biaya, cabang, keterangan, tutup pekerjaan, rincian barang, biaya lainnya, informasi pekerjaan
- Relasi inti:
  - `work_orders` belongs-to `customers`
  - `work_orders` belongs-to `branches`
  - `work_orders` belongs-to `accounts` biaya dan selisih
  - `work_orders` has-many `work_order_items`
  - `work_orders` has-many `work_order_charges`
- Controller: `WorkOrderController`
- View: `WorkOrderView`
- Confidence: `tinggi`

### Penambahan Bahan Baku

- Model utama: `material_additions`
- Child model: `material_addition_items`, `material_addition_charges`
- Lookup ke: `work_orders`, `branches`, `products`, `units`
- Field inti: tanggal, tipe, nomor pekerjaan, nomor batch, cabang, keterangan, rincian barang, biaya lainnya
- Relasi inti:
  - `material_additions` belongs-to `work_orders`
  - `material_additions` belongs-to `branches`
  - `material_additions` has-many `material_addition_items`
  - `material_additions` has-many `material_addition_charges`
- Controller: `MaterialAdditionController`
- View: `MaterialAdditionView`
- Confidence: `tinggi`

### Penyelesaian Pesanan

- Model utama: `work_completions`
- Child model: `work_completion_items`
- Lookup ke: `work_orders`, `branches`, `products`, `units`
- Field inti: tanggal, nomor pekerjaan, tipe penyelesaian, nomor dokumen, cabang, keterangan, rincian barang
- Relasi inti:
  - `work_completions` belongs-to `work_orders`
  - `work_completions` belongs-to `branches`
  - `work_completions` has-many `work_completion_items`
- Controller: `WorkCompletionController`
- View: `WorkCompletionView`
- Confidence: `tinggi`

### Perintah Stok Opname

- Model utama: `stock_opname_orders` atau reuse `stock_opnames`
- Child model: `stock_opname_order_items`, `stock_opname_order_assignees`
- Lookup ke: `branches`, `departments`, `warehouses`, `users`, `suppliers`, `brands`, `product_categories`
- Field inti: tanggal SPK, nomor SPK, status, cabang, departemen, tanggal mulai, penanggung jawab, dikerjakan oleh, keterangan, gudang, kategori barang, pemasok barang, merek barang
- Relasi inti:
  - `stock_opname_orders` belongs-to `warehouses`
  - `stock_opname_orders` belongs-to `branches`
  - `stock_opname_orders` belongs-to `departments`
  - `stock_opname_orders` belongs-to `users`
  - `stock_opname_orders` has-many `stock_opname_order_items`
- Controller: `StockOpnameOrderController`
- View: `StockOpnameOrderView`
- Confidence: `menengah`

### Hasil Stok Opname

- Model utama: `stock_opname_results` atau reuse `stock_opnames`
- Child model: `stock_opname_result_items`
- Lookup ke: `stock_opname_orders`, `products`, `units`
- Field inti: tanggal opname, nomor opname, perintah opname, keterangan, rincian barang
- Relasi inti:
  - `stock_opname_results` belongs-to `stock_opname_orders`
  - `stock_opname_results` has-many `stock_opname_result_items`
- Controller: `StockOpnameResultController`
- View: `StockOpnameResultView`
- Confidence: `menengah`

## E. Penjualan

### Penawaran Penjualan

- Model utama: `sales_quotes`
- Child model: `sales_quote_items`, `sales_quote_additional_charges`, `sales_quote_attachments`
- Lookup ke: `customers`, `payment_terms`, `branches`, `products`, `units`
- Field inti: dipesan oleh, tanggal, nomor, syarat pembayaran, alamat, cabang, keterangan, rincian barang, biaya lainnya, info penawaran
- Relasi inti:
  - `sales_quotes` belongs-to `customers`
  - `sales_quotes` belongs-to `payment_terms`
  - `sales_quotes` belongs-to `branches`
  - `sales_quotes` has-many `sales_quote_items`
  - `sales_quotes` has-many `sales_quote_additional_charges`
- Controller: `SalesQuoteController`
- View: `SalesQuoteView`
- Confidence: `tinggi`

### Pesanan Penjualan

- Model utama: `sales_orders`
- Child model: `sales_order_items`, `sales_order_additional_charges`, `sales_order_shipments`, `sales_order_tax_details`
- Lookup ke: `customers`, `payment_terms`, `branches`, `shipping_methods`, `fob_terms`, `products`, `units`, `taxes`
- Field inti: customer, tanggal, nomor pesanan, syarat pembayaran, nomor PO, alamat, cabang, keterangan, pajak, tanggal pengiriman, pengiriman, FOB, rincian barang, biaya lainnya, info pesanan
- Relasi inti:
  - `sales_orders` belongs-to `customers`
  - `sales_orders` belongs-to `payment_terms`
  - `sales_orders` belongs-to `branches`
  - `sales_orders` belongs-to `shipping_methods`
  - `sales_orders` belongs-to `fob_terms`
  - `sales_orders` has-many `sales_order_items`
  - `sales_orders` has-many `sales_order_additional_charges`
- Controller: `SalesOrderController`
- View: `SalesOrderView`
- Confidence: `tinggi`

### Pengiriman Pesanan

- Model utama: `sales_deliveries`
- Child model: `sales_delivery_items`
- Lookup ke: `customers`, `sales_quotes`, `sales_orders`, `branches`, `warehouses`, `departments`, `shipping_methods`, `products`, `units`
- Field inti: kirim ke, tanggal, nomor pengiriman, alamat, cabang, keterangan, tanggal kirim, pengiriman, rincian barang
- Relasi inti:
  - `sales_deliveries` belongs-to `customers`
  - `sales_deliveries` belongs-to `sales_orders`
  - `sales_deliveries` belongs-to `branches`
  - `sales_deliveries` has-many `sales_delivery_items`
- Controller: `SalesDeliveryController`
- View: `SalesDeliveryView`
- Confidence: `tinggi`

### Faktur Penjualan

- Model utama: `sales_invoices`
- Child model:
  - `sales_invoice_items`
  - `sales_invoice_additional_charges`
  - `sales_invoice_tax_details`
  - `sales_invoice_advance_payments`
  - `sales_invoice_attachments`
- Lookup ke: `customers`, `contacts`, `payment_terms`, `branches`, `shipping_methods`, `fob_terms`, `taxes`, `products`, `units`, `sales_orders`, `sales_deliveries`
- Field inti: customer, tanggal, nomor faktur, faktur dimuka, syarat pembayaran, nomor PO, alamat, cabang, keterangan, kontak, info pajak, info pengiriman, rincian barang, biaya lainnya, uang muka, informasi faktur
- Relasi inti:
  - `sales_invoices` belongs-to `customers`
  - `sales_invoices` belongs-to `payment_terms`
  - `sales_invoices` belongs-to `branches`
  - `sales_invoices` belongs-to `contacts`
  - `sales_invoices` has-many `sales_invoice_items`
  - `sales_invoices` has-many `sales_invoice_additional_charges`
  - `sales_invoices` has-many `sales_invoice_tax_details`
  - `sales_invoices` has-many `sales_invoice_advance_payments`
- Controller: `SalesInvoiceController`
- View: `SalesInvoiceView`
- Confidence: `tinggi`

### Uang Muka Penjualan

- Model utama: `sales_deposits`
- Child model: `sales_deposit_tax_details`, `sales_deposit_allocations`
- Lookup ke: `customers`, `payment_terms`, `branches`, `taxes`
- Field inti: customer, tanggal, nomor, uang muka, nomor PO, pajak, syarat pembayaran, alamat, cabang, keterangan
- Relasi inti:
  - `sales_deposits` belongs-to `customers`
  - `sales_deposits` belongs-to `payment_terms`
  - `sales_deposits` belongs-to `branches`
- Controller: `SalesDepositController`
- View: `SalesDepositView`
- Confidence: `tinggi`

### Penerimaan Penjualan

- Model utama: `sales_receipts` atau general `payments`
- Child model: `sales_receipt_allocations`
- Lookup ke: `customers`, `cash_accounts`, `payment_methods`, `branches`, `sales_invoices`
- Field inti: terima dari, bank, nilai pembayaran, nomor bukti, tanggal bayar, metode bayar, tanggal cek, cabang, keterangan, tabel invoice
- Relasi inti:
  - `sales_receipts` belongs-to `customers`
  - `sales_receipts` belongs-to `cash_accounts`
  - `sales_receipts` belongs-to `payment_methods`
  - `sales_receipts` has-many `sales_receipt_allocations`
- Controller: `SalesReceiptController`
- View: `SalesReceiptView`
- Confidence: `tinggi`

### Retur Penjualan

- Model utama: `sales_returns`
- Child model: `sales_return_items`, `sales_return_tax_details`, `sales_return_additional_charges`
- Lookup ke: `customers`, `sales_invoices`, `branches`, `warehouses`, `products`, `units`
- Field inti: pelanggan, tanggal retur, nomor retur, sumber retur, rincian barang, pajak, keterangan
- Relasi inti:
  - `sales_returns` belongs-to `customers`
  - `sales_returns` belongs-to `sales_invoices`
  - `sales_returns` belongs-to `branches`
  - `sales_returns` belongs-to `warehouses`
  - `sales_returns` has-many `sales_return_items`
- Controller: `SalesReturnController`
- View: `SalesReturnView`
- Confidence: `tinggi`

### Komisi Penjual

- Model utama: `sales_commissions`
- Child model: `sales_commission_conditions`, `sales_commission_rewards`, `sales_commission_product_scopes`, `sales_commission_supplier_scopes`
- Lookup ke: `employees`, `products`, `suppliers`
- Field inti: periode, nama, penjual, order, cakupan produk, cakupan pemasok, kondisi, reward, catatan, nonaktif
- Relasi inti:
  - `sales_commissions` belongs-to `employees`
  - `sales_commissions` has-many `sales_commission_conditions`
  - `sales_commissions` has-many `sales_commission_rewards`
- Controller: `SalesCommissionController`
- View: `SalesCommissionView`
- Confidence: `menengah`

### Target Penjualan

- Model utama: `sales_targets`
- Child model: `sales_target_lines`
- Lookup ke: `branches`, `employees`, `products`
- Field inti: nama, tipe, cabang, tanggal mulai, tanggal selesai, rincian target, catatan, analis
- Relasi inti:
  - `sales_targets` belongs-to `branches`
  - `sales_targets` has-many `sales_target_lines`
  - line bisa belongs-to `employees` atau `products` tergantung tipe target
- Controller: `SalesTargetController`
- View: `SalesTargetView`
- Confidence: `tinggi`

## F. Pembelian

### Pesanan Pembelian

- Model utama: `purchase_orders`
- Child model: `purchase_order_items`, `purchase_order_additional_charges`, `purchase_order_tax_details`
- Lookup ke: `suppliers`, `payment_terms`, `branches`, `shipping_methods`, `fob_terms`, `products`, `units`, `taxes`
- Field inti: pemasok, tanggal, nomor PO, syarat pembayaran, alamat, cabang, keterangan, pajak, pengiriman, FOB, rincian barang, biaya lainnya
- Relasi inti:
  - `purchase_orders` belongs-to `suppliers`
  - `purchase_orders` belongs-to `payment_terms`
  - `purchase_orders` belongs-to `branches`
  - `purchase_orders` has-many `purchase_order_items`
  - `purchase_orders` has-many `purchase_order_additional_charges`
- Controller: `PurchaseOrderController`
- View: `PurchaseOrderView`
- Confidence: `tinggi`

### Penerimaan Barang

- Model utama: `goods_receipts`
- Child model: `goods_receipt_items`
- Lookup ke: `suppliers`, `purchase_orders`, `branches`, `warehouses`, `shipping_methods`, `fob_terms`, `products`, `units`
- Field inti: terima dari, tanggal, nomor form, nomor terima, alamat, cabang, keterangan, tanggal kirim, pengiriman, FOB, rincian barang
- Relasi inti:
  - `goods_receipts` belongs-to `suppliers`
  - `goods_receipts` belongs-to `purchase_orders`
  - `goods_receipts` belongs-to `branches`
  - `goods_receipts` belongs-to `warehouses`
  - `goods_receipts` has-many `goods_receipt_items`
- Controller: `GoodsReceiptController`
- View: `GoodsReceiptView`
- Confidence: `tinggi`

### Uang Muka Pembelian

- Model utama: `purchase_deposits`
- Child model: `purchase_deposit_tax_details`, `purchase_deposit_allocations`
- Lookup ke: `suppliers`, `purchase_orders`, `payment_terms`, `cash_accounts`, `branches`, `taxes`
- Field inti: pemasok, tanggal, nomor, nomor PO, total pesanan, uang muka, pajak, syarat pembayaran, nomor faktur, rekening bank, alamat, cabang, keterangan, data pajak
- Relasi inti:
  - `purchase_deposits` belongs-to `suppliers`
  - `purchase_deposits` belongs-to `purchase_orders`
  - `purchase_deposits` belongs-to `cash_accounts`
  - `purchase_deposits` belongs-to `branches`
- Controller: `PurchaseDepositController`
- View: `PurchaseDepositView`
- Confidence: `tinggi`

### Faktur Pembelian

- Model utama: `purchase_invoices`
- Child model: `purchase_invoice_items`, `purchase_invoice_additional_charges`, `purchase_invoice_tax_details`
- Lookup ke: `suppliers`, `purchase_orders`, `goods_receipts`, `payment_terms`, `cash_accounts`, `branches`, `shipping_methods`, `fob_terms`, `taxes`, `products`, `units`
- Field inti: pemasok, tanggal, nomor invoice, tagihan dimuka, syarat pembayaran, nomor faktur, alamat, cabang, keterangan, pajak, tanggal pengiriman, pengiriman, FOB, kurs, rekening bank, rincian barang, biaya lainnya
- Relasi inti:
  - `purchase_invoices` belongs-to `suppliers`
  - `purchase_invoices` belongs-to `purchase_orders`
  - `purchase_invoices` belongs-to `goods_receipts`
  - `purchase_invoices` belongs-to `cash_accounts`
  - `purchase_invoices` has-many `purchase_invoice_items`
  - `purchase_invoices` has-many `purchase_invoice_additional_charges`
- Controller: `PurchaseInvoiceController`
- View: `PurchaseInvoiceView`
- Confidence: `tinggi`

### Pembayaran Pembelian

- Model utama: `purchase_payments` atau general `payments`
- Child model: `purchase_payment_allocations`
- Lookup ke: `suppliers`, `cash_accounts`, `payment_methods`, `branches`, `purchase_invoices`
- Field inti: supplier, bank, nilai pembayaran, nomor bukti, tanggal bayar, metode bayar, jatuh tempo PPh/cek, keterangan, cabang, tabel faktur
- Relasi inti:
  - `purchase_payments` belongs-to `suppliers`
  - `purchase_payments` belongs-to `cash_accounts`
  - `purchase_payments` belongs-to `payment_methods`
  - `purchase_payments` has-many `purchase_payment_allocations`
- Controller: `PurchasePaymentController`
- View: `PurchasePaymentView`
- Confidence: `tinggi`

### Retur Pembelian

- Model utama: `purchase_returns`
- Child model: `purchase_return_items`, `purchase_return_additional_charges`, `purchase_return_tax_details`
- Lookup ke: `suppliers`, `purchase_invoices`, `branches`, `warehouses`, `products`, `units`, `taxes`
- Field inti: pemasok, tanggal, nomor retur, retur dari, alamat, cabang, keterangan, pajak, kurs, rincian barang, biaya lainnya
- Relasi inti:
  - `purchase_returns` belongs-to `suppliers`
  - `purchase_returns` belongs-to `purchase_invoices`
  - `purchase_returns` belongs-to `branches`
  - `purchase_returns` belongs-to `warehouses`
  - `purchase_returns` has-many `purchase_return_items`
- Controller: `PurchaseReturnController`
- View: `PurchaseReturnView`
- Confidence: `tinggi`

### Perintah Pembayaran

- Model utama: `payment_orders`
- Child model: `payment_order_items`
- Lookup ke: `suppliers`, `purchase_invoices`, `cash_accounts`, `payment_methods`
- Field inti: batch pembayaran dan daftar transaksi yang diambil
- Relasi inti:
  - `payment_orders` has-many `payment_order_items`
- Controller: `PaymentOrderController`
- View: `PaymentOrderView`
- Confidence: `menengah`

### Transfer Pemasok

- Model utama: `supplier_transfers`
- Child model: `supplier_transfer_items`
- Lookup ke: `suppliers`, `cash_accounts`, `branches`
- Field inti: filter bank/rek, daftar transfer supplier, aksi batch
- Relasi inti:
  - `supplier_transfers` has-many `supplier_transfer_items`
- Controller: `SupplierTransferController`
- View: `SupplierTransferView`
- Confidence: `menengah`

## G. Kas, Bank, Anggaran, dan Jurnal

### Pembayaran

- Model utama: `cash_payments` atau general `payments`
- Child model: `cash_payment_allocations`
- Lookup ke: `cash_accounts`, `payment_methods`, `suppliers`, `accounts`, `branches`
- Field inti: pihak dibayar, kas/bank, nilai, nomor bukti, tanggal, metode bayar, jatuh tempo/cek, cabang, keterangan, tabel faktur
- Relasi inti:
  - `cash_payments` belongs-to `cash_accounts`
  - `cash_payments` belongs-to `payment_methods`
  - `cash_payments` morphs-to partner atau reference document
- Controller: `CashPaymentController`
- View: `CashPaymentView`
- Confidence: `menengah`

### Penerimaan

- Model utama: `cash_receipts` atau general `payments`
- Child model: `cash_receipt_allocations`
- Lookup ke: `cash_accounts`, `payment_methods`, `customers`, `accounts`, `branches`
- Field inti: penerima/sumber dana, kas/bank, nilai, nomor bukti, tanggal, metode bayar, cabang, keterangan, tabel faktur
- Relasi inti:
  - `cash_receipts` belongs-to `cash_accounts`
  - `cash_receipts` belongs-to `payment_methods`
  - `cash_receipts` morphs-to partner atau reference document
- Controller: `CashReceiptController`
- View: `CashReceiptView`
- Confidence: `menengah`

### Transfer Bank

- Model utama: `bank_transfers`
- Child model: `bank_transfer_charges`
- Lookup ke: `cash_accounts`, `branches`
- Field inti: rekening asal, rekening tujuan, tanggal, nilai transfer, kurs, biaya, keterangan, rekonsiliasi
- Relasi inti:
  - `bank_transfers` belongs-to `cash_accounts` asal dan tujuan
- Controller: `BankTransferController`
- View: `BankTransferView`
- Confidence: `tinggi`

### Anggaran

- Model utama: `budgets`
- Child model: `budget_lines`
- Lookup ke: `accounts`, `branches`, `departments`
- Field inti: header anggaran, periode, detail alokasi
- Relasi inti:
  - `budgets` has-many `budget_lines`
  - line belongs-to `accounts`, `branches`, `departments`
- Controller: `BudgetController`
- View: `BudgetView`
- Confidence: `menengah`

### Transfer Anggaran

- Model utama: `budget_transfers`
- Child model: none atau `budget_transfer_lines`
- Lookup ke: `budgets`, `accounts`, `branches`, `departments`
- Field inti: sumber anggaran, tujuan anggaran, nilai, tanggal, keterangan
- Relasi inti:
  - `budget_transfers` belongs-to source dan target budget scope
- Controller: `BudgetTransferController`
- View: `BudgetTransferView`
- Confidence: `menengah`

### Pencatatan Beban

- Model utama: `expense_entries`
- Child model: `expense_entry_lines`
- Lookup ke: `accounts`, `branches`, `departments`, `suppliers`, `cash_accounts`
- Field inti: akun biaya, tanggal, nilai, cabang, keterangan, detail biaya
- Relasi inti:
  - `expense_entries` has-many `expense_entry_lines`
  - line belongs-to `accounts`
- Controller: `ExpenseEntryController`
- View: `ExpenseEntryView`
- Confidence: `menengah`

### Pencatatan Gaji

- Model utama: `payroll_entries`
- Child model: `payroll_entry_lines`
- Lookup ke: `employees`, `salary_allowances`, `branches`, `accounts`
- Field inti: periode gaji, cabang, akun, nilai, detail komponen payroll
- Relasi inti:
  - `payroll_entries` has-many `payroll_entry_lines`
  - line belongs-to `employees`
- Controller: `PayrollEntryController`
- View: `PayrollEntryView`
- Confidence: `menengah`

### Jurnal Umum

- Model utama: `general_journals`
- Child model: `general_journal_lines`
- Lookup ke: `accounts`, `branches`, `departments`
- Field inti: nomor, tanggal, keterangan, debit/kredit, cabang
- Relasi inti:
  - `general_journals` has-many `general_journal_lines`
  - line belongs-to `accounts`
- Controller: `GeneralJournalController`
- View: `GeneralJournalView`
- Confidence: `tinggi`

## H. Aset Tetap

### Aset Tetap

- Model utama: `fixed_assets`
- Child model: `fixed_asset_locations`, `fixed_asset_tax_profiles`, `fixed_asset_opening_balances`
- Lookup ke: `asset_categories`, `asset_tax_categories`, `accounts`, `branches`, `departments`
- Field inti: nama aset, kode aset, tanggal beli, tanggal pakai, aset tidak berwujud, metode penyusutan, akun aset, akun akumulasi, akun beban penyusutan, kuantitas, umur aset, rasio, nilai sisa, kategori aset, cabang, departemen, lokasi awal, catatan, pajak, kategori pajak, akun pengeluaran
- Relasi inti:
  - `fixed_assets` belongs-to `asset_categories`
  - `fixed_assets` belongs-to `asset_tax_categories`
  - `fixed_assets` belongs-to `branches`
  - `fixed_assets` belongs-to `departments`
  - `fixed_assets` belongs-to `accounts` untuk banyak peran akun
- Controller: `FixedAssetController`
- View: `FixedAssetsView`
- Confidence: `tinggi`

### Kategori Aset

- Model utama: `asset_categories`
- Child model: `asset_category_accounts`
- Lookup ke: `accounts`
- Field inti: nama kategori aset, akun-akun terkait
- Relasi inti:
  - `asset_categories` has-many `fixed_assets`
- Controller: `AssetCategoryController`
- View: `AssetCategoryView`
- Confidence: `tinggi`

### Kategori Aset Tetap Pajak

- Model utama: `asset_tax_categories`
- Child model: none
- Lookup ke: none
- Field inti: nama, metode penyusutan, perkiraan umur, tarif penyusutan
- Relasi inti:
  - `asset_tax_categories` has-many `fixed_assets`
- Controller: `AssetTaxCategoryController`
- View: `AssetTaxCategoryView`
- Confidence: `tinggi`

### Perubahan Aset Tetap

- Model utama: `asset_changes`
- Child model: `asset_change_expense_lines`
- Lookup ke: `fixed_assets`, `accounts`, `branches`, `departments`
- Field inti: aset, tipe perubahan, tanggal, nomor, akun aset, cabang, departemen, pengeluaran, keterangan
- Relasi inti:
  - `asset_changes` belongs-to `fixed_assets`
  - `asset_changes` belongs-to `accounts`
  - `asset_changes` has-many `asset_change_expense_lines`
- Controller: `AssetChangeController`
- View: `AssetChangeView`
- Confidence: `tinggi`

### Disposisi Aset Tetap

- Model utama: `asset_disposals`
- Child model: none atau `asset_disposal_attachments`
- Lookup ke: `fixed_assets`, `accounts`, `branches`
- Field inti: aset, penyusutan terakhir, nilai sisa buku, nomor, tanggal, kuantitas, akun laba rugi, lokasi aset, catatan, aset dijual
- Relasi inti:
  - `asset_disposals` belongs-to `fixed_assets`
  - `asset_disposals` belongs-to `accounts`
- Controller: `AssetDisposalController`
- View: `AssetDisposalView`
- Confidence: `tinggi`

### Pindah Aset

- Model utama: `asset_moves`
- Child model: `asset_move_items`
- Lookup ke: `fixed_assets`, `branches`, `departments`, `asset_locations`
- Field inti: nomor, tanggal, keterangan, alamat/lokasi asal, alamat/lokasi tujuan, detail aset
- Relasi inti:
  - `asset_moves` has-many `asset_move_items`
  - item belongs-to `fixed_assets`
- Controller: `AssetMoveController`
- View: `AssetMoveView`
- Confidence: `tinggi`

## I. Relasi Alur Antar Dokumen

### Penjualan

- `sales_quotes` -> `sales_orders` -> `sales_deliveries` -> `sales_invoices` -> `sales_receipts`
- `sales_deposits` dapat dialokasikan ke `sales_invoices`
- `sales_returns` paling aman terkait ke `sales_invoices`

### Pembelian

- `purchase_orders` -> `goods_receipts` -> `purchase_invoices` -> `purchase_payments`
- `purchase_deposits` dapat dialokasikan ke `purchase_invoices`
- `purchase_returns` paling aman terkait ke `purchase_invoices`

### Persediaan

- `item_requests` dapat menjadi sumber `stock_transfers` atau dokumen pemenuhan lain
- `stock_transfers`, `stock_adjustments`, `goods_receipts`, `sales_invoices`, `sales_returns`, `purchase_returns`, `material_additions`, `work_completions`, `stock_opname_results`
  semuanya pada akhirnya harus menghasilkan `inventory_movements`

### Produksi

- `work_orders` -> `material_additions` -> `work_completions`

### Aset

- `fixed_assets` -> `asset_changes`
- `fixed_assets` -> `asset_moves`
- `fixed_assets` -> `asset_disposals`

## J. Yang Sudah Cukup Aman vs Yang Masih Hati-Hati

### Cukup aman dipakai mulai backend

- `users`
- `access_groups`
- `branches`
- `departments`
- `accounts`
- `customers`
- `suppliers`
- `products`
- `product_categories`
- `units`
- `warehouses`
- `sales_quotes`
- `sales_orders`
- `sales_deliveries`
- `sales_invoices`
- `sales_returns`
- `purchase_orders`
- `goods_receipts`
- `purchase_invoices`
- `purchase_returns`
- `stock_transfers`
- `stock_adjustments`
- `work_orders`
- `material_additions`
- `fixed_assets`
- `asset_changes`
- `asset_disposals`
- `asset_moves`

### Masih perlu validasi lagi sebelum final schema

- `preferences`
- `print_designs`
- `sales_commissions`
- `budgets`
- `budget_transfers`
- `expense_entries`
- `payroll_entries`
- `payment_orders`
- `supplier_transfers`
- `stock_opname_orders`
- `stock_opname_results`
- bentuk final apakah `cash_receipt / cash_payment / sales_receipt / purchase_payment`
  dipisah model sendiri atau diturunkan dari `payments`

## K. Prioritas Implementasi

1. master dasar dan akses
2. partner bisnis
3. item, gudang, stok dasar
4. penjualan
5. pembelian
6. kas/bank dan alokasi pembayaran
7. produksi dan aset tetap
8. budget, desain cetak, preference, dan modul pendukung lain
