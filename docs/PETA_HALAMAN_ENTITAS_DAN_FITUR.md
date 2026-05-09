# Peta Halaman, Entitas, dan Fitur

Dokumen ini memetakan halaman ke fitur, entitas utama, dan komponen yang merendernya.

## Catatan

- Kolom `Entitas Utama` adalah pemetaan praktis dari nama halaman, input UI, dan dokumen domain yang ada sekarang.
- Untuk beberapa halaman, entitasnya masih `kandidat` karena backend domain formalnya belum ditulis.
- Halaman placeholder memakai `ModulePageView`.

## A. Route Utama

| Route / Halaman | Fitur | Entitas Utama | Komponen | Status |
| --- | --- | --- | --- | --- |
| `/` - `Login` | autentikasi masuk | `users` | `HomePage` + `LoginFormPanel` | Implemented |
| `/register` - `Register` | registrasi akun | `users` | `RegisterPage` + `RegisterFormPanel` | Implemented |
| `/dashboard/{sample?}` - `Dashboard` | shell workspace, navigasi, widget, tab | tidak langsung ke entitas domain | `DashboardPage` + `DashboardView` | Implemented |

## B. Pengaturan

| Halaman | Page ID | Fitur | Entitas Utama | Komponen | Status |
| --- | --- | --- | --- | --- | --- |
| Preferensi | `preferences` | pengaturan perusahaan dan modul | kandidat `preferences` | `PreferencesView` | Implemented |
| Akses Grup | `group-access` | grup akses dan matrix hak menu | `users`, `roles`, `user_role` | `GroupAccessView` | Implemented |
| Pengguna | `users` | manajemen user database | `users`, `roles` | `UsersManagementView` | Implemented |
| Penomoran | `numbering` | nomor dokumen per transaksi | kandidat `numbering_sequences` | `NumberingView` | Implemented |
| Desain Cetakan | `print-design` | template cetak dokumen | kandidat `print_designs` | `PrintDesignView` | Implemented |
| Penyetuju Transaksi | `transaction-approval` | setup approval transaksi | kandidat `approval_rules` | `TransactionApprovalView` | Implemented |

## C. Perusahaan

| Halaman | Page ID | Fitur | Entitas Utama | Komponen | Status |
| --- | --- | --- | --- | --- | --- |
| Mata Uang | `currency-master` | master mata uang | kandidat `currencies` | `CurrencyView` | Implemented |
| Cabang | `branch` | master cabang | `branches` | `BranchView` | Implemented |
| Departemen | `department` | master departemen | kandidat `departments` | `DepartmentView` | Implemented |
| Pajak | `company-tax` | master pajak | kandidat `taxes` | `TaxView` | Implemented |
| Syarat Pembayaran | `payment-terms` | termin pembayaran | kandidat `payment_terms` | `PaymentTermsView` | Implemented |
| Pengiriman | `shipping-master` | metode pengiriman | kandidat `shipping_methods` | `ShippingView` | Implemented |
| FOB | `fob-master` | master FOB | kandidat `fob_terms` | `SimpleMasterView` | Implemented |
| Gaji/Tunjangan | `salary-allowance` | setup payroll benefit/deduction | kandidat `salary_allowances` | `SalaryAllowanceView` | Implemented |
| Karyawan | `employees` | master karyawan | kandidat `employees` | `EmployeeView` | Implemented |
| Transaksi Berulang | `recurring-transactions` | preset transaksi berulang | kandidat `recurring_transactions` | `SavedTransactionsView` | Implemented |
| Proses Akhir Bulan | `period-end` | closing period | kandidat `period_end_processes` | `PeriodEndView` | Implemented |
| Kontak | `contacts` | daftar kontak | kandidat `contacts` | `ContactView` | Implemented |
| Transaksi Favorit | `favorite-transactions` | preset transaksi favorit | kandidat `favorite_transactions` | `SavedTransactionsView` | Implemented |
| Kalender | `calendar-master` | kalender operasional | belum ditentukan | `ModulePageView` | Placeholder |
| Log Aktifitas | `activity-log` | audit log umum | kandidat `activity_logs` | `ActivityLogView` | Implemented |

## D. Buku Besar

| Halaman | Page ID | Fitur | Entitas Utama | Komponen | Status |
| --- | --- | --- | --- | --- | --- |
| Akun Perkiraan | `accounts` | chart of accounts | kandidat `accounts` | `AccountsView` | Implemented |
| Pencatatan Beban | `expense-entry` | entry biaya operasional | kandidat `expense_entries` | `ExpenseEntryView` | Implemented |
| Pencatatan Gaji | `payroll-entry` | entry payroll | kandidat `payroll_entries` | `PayrollEntryView` | Implemented |
| Jurnal Umum | `general-journal` | jurnal manual | kandidat `journals`, `journal_lines` | `GeneralJournalView` | Implemented |
| Monitor Anggaran | `budget-monitor` | monitoring budget | kandidat `budgets` | `BudgetMonitorView` | Implemented |
| Transfer Anggaran | `budget-transfer` | transfer budget | kandidat `budget_transfers` | `BudgetTransferView` | Implemented |
| Anggaran | `budget` | setup budget | kandidat `budgets` | `BudgetView` | Implemented |
| Histori Akun | `account-history` | inquiry histori akun | kandidat `journal_lines` | `BankInquiryView` | Implemented |
| Log Aktifitas Jurnal | `journal-activity-log` | audit log jurnal | kandidat `journal_activity_logs` | `JournalActivityLogView` | Implemented |

## E. Kas & Bank

| Halaman | Page ID | Fitur | Entitas Utama | Komponen | Status |
| --- | --- | --- | --- | --- | --- |
| Pembayaran | `cash-payment` | pembayaran keluar | `payments`, `payment_allocations`, `payment_methods`, `cash_accounts` | `CashPaymentView` | Implemented |
| Penerimaan | `cash-receipt` | penerimaan masuk | `payments`, `payment_allocations`, `payment_methods`, `cash_accounts` | `CashReceiptView` | Implemented |
| Transfer Bank | `bank-transfer` | perpindahan dana antar akun | `cash_accounts`, kandidat `bank_transfers` | `BankTransferView` | Implemented |
| SmartLink e-Banking | `smartlink-banking` | koneksi channel banking | belum ditentukan | `ModulePageView` | Placeholder |
| Rekening Koran | `bank-statement` | inquiry rekening koran | kandidat `bank_statements` | `BankInquiryView` | Implemented |
| Histori Bank | `bank-history` | inquiry histori transaksi bank | kandidat `bank_transactions` | `BankInquiryView` | Implemented |
| Rekonsiliasi Bank | `bank-reconciliation` | bank reconciliation | kandidat `bank_reconciliations` | `BankInquiryView` | Implemented |
| SmartLink Virtual Account | `smartlink-virtual-account` | virtual account | belum ditentukan | `ModulePageView` | Placeholder |
| SmartLink e-Payment | `smartlink-payment` | payment gateway | belum ditentukan | `ModulePageView` | Placeholder |

## F. Penjualan

| Halaman | Page ID | Fitur | Entitas Utama | Komponen | Status |
| --- | --- | --- | --- | --- | --- |
| Penawaran Penjualan | `sales-quote` | quotation | kandidat `sales_quotes`, `sales_quote_items` | `SalesQuoteView` | Implemented |
| Pesanan Penjualan | `sales-order` | sales order | kandidat `sales_orders`, `sales_order_items` | `SalesOrderView` | Implemented |
| Pengiriman Pesanan | `sales-delivery` | delivery order | kandidat `sales_deliveries`, `sales_delivery_items` | `SalesDeliveryView` | Implemented |
| Uang Muka Penjualan | `sales-deposit` | down payment penjualan | kandidat `sales_deposits` | `SalesDepositView` | Implemented |
| Faktur Penjualan | `sales-invoice` | invoice penjualan / POS | `sales_invoices`, `sales_invoice_items`, `cash_sessions` | `SalesInvoiceView` | Implemented |
| Penerimaan Penjualan | `sales-receipt` | penerimaan pembayaran customer | `payments`, `payment_allocations`, `customers` | `SalesReceiptView` | Implemented |
| Retur Penjualan | `sales-return` | retur customer | `sales_returns`, `sales_return_items`, `sales_invoices` | `SalesReturnView` | Implemented |
| Kategori Pelanggan | `customer-category` | kategori customer | kandidat `customer_categories` | `SimpleMasterView` | Implemented |
| Kategori Penjualan | `sales-category` | kategori penjualan | kandidat `sales_categories` | `SimpleMasterView` | Implemented |
| Pelanggan | `customers` | master customer | `customers`, kandidat `contacts`, `partner_addresses` | `BusinessPartnerView` | Implemented |
| Penyesuaian Harga/Diskon | `price-adjustment` | adjustment harga/diskon | `stock_adjustments` atau kandidat dokumen harga | `InventoryAdjustmentView` | Implemented |
| Komisi Penjual | `sales-commission` | komisi sales | kandidat `sales_commissions` | `SalesCommissionView` | Implemented |
| Target Penjualan | `sales-target` | target sales | kandidat `sales_targets` | `SalesTargetView` | Implemented |
| SmartLink e-Commerce | `smartlink-commerce` | channel commerce | belum ditentukan | `ModulePageView` | Placeholder |
| Check In | `sales-checkin` | activity/check-in sales | kandidat `sales_checkins` | `TableListView` | Implemented |

## G. Pembelian

| Halaman | Page ID | Fitur | Entitas Utama | Komponen | Status |
| --- | --- | --- | --- | --- | --- |
| Pesanan Pembelian | `purchase-order` | purchase order | `purchase_orders`, `purchase_order_items` | `PurchaseOrderView` | Implemented |
| Penerimaan Barang | `goods-receipt` | goods receipt | `goods_receipts`, `goods_receipt_items` | `GoodsReceiptView` | Implemented |
| Uang Muka Pembelian | `purchase-deposit` | down payment pembelian | kandidat `purchase_deposits` | `PurchaseDepositView` | Implemented |
| Faktur Pembelian | `purchase-invoice` | invoice pembelian | `purchase_invoices`, `purchase_invoice_items` | `PurchaseInvoiceView` | Implemented |
| Pembayaran Pembelian | `purchase-payment` | bayar hutang supplier | `payments`, `payment_allocations`, `suppliers` | `PurchasePaymentView` | Implemented |
| Retur Pembelian | `purchase-return` | retur ke supplier | `purchase_returns`, `purchase_return_items` | `PurchaseReturnView` | Implemented |
| Harga Pemasok | `supplier-price` | daftar harga supplier | kandidat `supplier_prices` | `SupplierPriceView` | Implemented |
| Kategori Pemasok | `supplier-category` | kategori supplier | kandidat `supplier_categories` | `SimpleMasterView` | Implemented |
| Pemasok | `suppliers` | master supplier | `suppliers`, kandidat `contacts`, `partner_addresses` | `BusinessPartnerView` | Implemented |
| Perintah Pembayaran | `payment-order` | batch payment instruction | kandidat `payment_orders` | `PaymentOrderView` | Implemented |
| Transfer Pemasok | `supplier-transfer` | transfer dana ke supplier | `payments`, `cash_accounts`, `suppliers` | `SupplierTransferView` | Implemented |

## H. Persediaan

| Halaman | Page ID | Fitur | Entitas Utama | Komponen | Status |
| --- | --- | --- | --- | --- | --- |
| Permintaan Barang | `item-request` | item request | kandidat `item_requests`, `item_request_items` | `ItemRequestView` | Implemented |
| Pemindahan Barang | `stock-transfer` | transfer gudang | `stock_transfers`, `stock_transfer_items` | `StockTransferView` | Implemented |
| Penyesuaian Persediaan | `inventory-adjustment` | adjustment stok | `stock_adjustments`, `stock_adjustment_items` | `InventoryAdjustmentView` | Implemented |
| Pekerjaan Pesanan | `work-order` | work order | kandidat `work_orders`, `work_order_items` | `WorkOrderView` | Implemented |
| Penambahan Bahan Baku | `material-addition` | issue material | kandidat `material_additions` | `MaterialAdditionView` | Implemented |
| Penyelesaian Pesanan | `work-completion` | completion hasil kerja | kandidat `work_completions` | `WorkCompletionView` | Implemented |
| Perintah Stok Opname | `stock-opname-order` | order/count instruction | `stock_opnames`, `stock_opname_items` | `StockOpnameOrderView` | Implemented |
| Hasil Stok Opname | `stock-opname-result` | hasil opname | `stock_opnames`, `stock_opname_items` | `StockOpnameResultView` | Implemented |
| Barang & Jasa | `items-services` | master item | `products`, `product_categories`, `brands`, `units`, `product_prices` | `ItemsServicesView` | Implemented |
| Gudang | `warehouse-master` | master gudang | `warehouses` | `WarehouseView` | Implemented |
| Satuan Barang | `item-unit` | master satuan | `units` | `SimpleMasterView` | Implemented |
| Kategori Barang | `item-category` | kategori item | `product_categories` | `ItemCategoryView` | Implemented |
| Pemenuhan Pesanan | `order-fulfillment` | delivery readiness | kandidat `sales_orders`, `sales_deliveries`, `stock_balances` | `OrderFulfillmentView` | Implemented |
| Barang per Gudang | `item-location` | stok per warehouse | `stock_balances`, `warehouses`, `products` | `InventoryInquiryView` | Implemented |
| Barang Stok Minimum | `minimum-stock` | monitor reorder | `stock_balances`, `products` | `InventoryInquiryView` | Implemented |

## I. Aset Tetap

| Halaman | Page ID | Fitur | Entitas Utama | Komponen | Status |
| --- | --- | --- | --- | --- | --- |
| Aset Tetap | `fixed-assets` | master aset | kandidat `fixed_assets` | `FixedAssetsView` | Implemented |
| Kategori Aset | `asset-category` | kategori aset | kandidat `asset_categories` | `AssetCategoryView` | Implemented |
| Kategori Aset Tetap Pajak | `asset-tax-category` | kategori pajak aset | kandidat `asset_tax_categories` | `AssetTaxCategoryView` | Implemented |
| Perubahan Aset Tetap | `asset-change` | perubahan nilai/atribut aset | kandidat `asset_changes` | `AssetChangeView` | Implemented |
| Disposisi Aset Tetap | `asset-disposal` | pelepasan aset | kandidat `asset_disposals` | `AssetDisposalView` | Implemented |
| Pindah Aset | `asset-move` | perpindahan aset | kandidat `asset_moves`, `asset_move_items` | `AssetMoveView` | Implemented |
| Aset per Lokasi | `asset-location` | inquiry aset per lokasi | kandidat `fixed_assets`, `asset_locations` | `AssetLocationView` | Implemented |

## J. SmartLink Tax

| Halaman | Page ID | Fitur | Entitas Utama | Komponen | Status |
| --- | --- | --- | --- | --- | --- |
| e-Faktur CTAS | `efaktur-ctas` | integrasi e-faktur | belum ditentukan | `ModulePageView` | Placeholder |
| Email Faktur Pajak | `tax-invoice-email` | email pajak | belum ditentukan | `ModulePageView` | Placeholder |
| e-Faktur Legacy | `efaktur-legacy` | legacy tax connector | belum ditentukan | `ModulePageView` | Placeholder |

## K. Daftar Laporan

| Halaman | Page ID | Fitur | Entitas Utama | Komponen | Status |
| --- | --- | --- | --- | --- | --- |
| Daftar Laporan | `report-list` | katalog laporan | kandidat `report_definitions` | `ReportListView` | Implemented |
| SPT PPN / PPNBM | `vat-report` | tax report VAT | belum ditentukan | `ModulePageView` | Placeholder |
| Analisa AI | `analysis-ai` | AI analysis | belum ditentukan | `ModulePageView` | Placeholder |
| SPT PPh Ps.21 | `income-tax-report` | payroll tax report | belum ditentukan | `ModulePageView` | Placeholder |
| Bukti Potong PPh Ps.21 | `withholding-slip` | withholding slip | belum ditentukan | `ModulePageView` | Placeholder |

## L. Ringkasan Status

| Kategori | Jumlah |
| --- | ---: |
| Route utama | 3 |
| Halaman workspace total | 96 |
| Halaman workspace implemented | 84 |
| Halaman workspace placeholder | 12 |

## M. Halaman Placeholder Saat Ini

- `Kalender`
- `SmartLink e-Banking`
- `SmartLink Virtual Account`
- `SmartLink e-Payment`
- `SmartLink e-Commerce`
- `e-Faktur CTAS`
- `Email Faktur Pajak`
- `e-Faktur Legacy`
- `SPT PPN / PPNBM`
- `Analisa AI`
- `SPT PPh Ps.21`
- `Bukti Potong PPh Ps.21`
