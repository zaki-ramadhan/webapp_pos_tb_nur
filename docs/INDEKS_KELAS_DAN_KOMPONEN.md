# Indeks Kelas dan Komponen

Dokumen ini mendata kelas dan komponen utama yang benar-benar ada saat ini di proyek `webapp`, lalu mengelompokkannya berdasarkan layer.

## Snapshot Arsitektur Saat Ini

| Layer | Lokasi | Jumlah File | Catatan |
| --- | --- | ---: | --- |
| PHP app | `webapp/app` | 9 | backend masih sangat tipis |
| Inertia pages | `webapp/resources/js/pages` | 3 | titik masuk utama |
| Workspace module views/configs | `webapp/resources/js/features/workspace/modules` | 104 | pusat implementasi UI bisnis |
| Workspace module shared | `webapp/resources/js/features/workspace/modules/shared` | 18 | blok ulang pakai transaksi |
| Workspace dashboard shell | `webapp/resources/js/features/workspace/dashboard` | 11 | shell, tab, modal, sidebar |
| Auth components | `webapp/resources/js/features/auth/components` | 13 | komponen login/register |

## A. Backend PHP Classes

### HTTP Entry Layer

| Class | Path | Peran |
| --- | --- | --- |
| `Controller` | `app/Http/Controllers/Controller.php` | base controller Laravel |
| `HomeController` | `app/Http/Controllers/Web/HomeController.php` | render `HomePage` dengan data `PosBlueprint::forLogin()` |
| `RegisterController` | `app/Http/Controllers/Web/RegisterController.php` | render `RegisterPage` dengan data `PosBlueprint::forRegister()` |
| `DashboardController` | `app/Http/Controllers/Web/DashboardController.php` | render `DashboardPage` dengan data `PosBlueprint::forDashboard()` |
| `HandleInertiaRequests` | `app/Http/Middleware/HandleInertiaRequests.php` | middleware share data Inertia |

### Presentation and Bootstrapping

| Class | Path | Peran |
| --- | --- | --- |
| `PosBlueprint` | `app/Support/Presentation/PosBlueprint.php` | sumber utama blueprint UI: route auth, sample dashboard, modul navigasi, page config, placeholder, dan banyak data form |
| `AppServiceProvider` | `app/Providers/AppServiceProvider.php` | bootstrapping Laravel app |

### Model Aktual

| Class | Path | Peran |
| --- | --- | --- |
| `User` | `app/Models/User.php` | model user default Laravel, satu-satunya model backend nyata yang sudah ada |

### Struktur Domain yang Baru Disiapkan

`app/Domain/README.md` sudah mendefinisikan target bounded context:

- `Catalog`
- `Inventory`
- `Purchasing`
- `Sales`
- `Finance`
- `Identity`

Catatan:

- Saat ini folder domain tersebut belum berisi kelas konkret.
- Jadi, inventaris `class` backend riil masih jauh lebih kecil dibanding cakupan UI.

## B. Frontend Entry Pages

| Komponen | Path | Peran |
| --- | --- | --- |
| `HomePage` | `resources/js/pages/HomePage.jsx` | halaman login |
| `RegisterPage` | `resources/js/pages/RegisterPage.jsx` | halaman register |
| `DashboardPage` | `resources/js/pages/DashboardPage.jsx` | entry untuk seluruh workspace demo |

## C. Workspace Shell dan Orkestrasi

### Dashboard Shell

| Komponen/File | Peran |
| --- | --- |
| `DashboardView` | orkestrator utama page tabs, sidebar, widget, modal, dan rendering page view |
| `DashboardTopBar` | top bar workspace |
| `DashboardToolbar` | toolbar dashboard dan action widget |
| `DashboardSidebar` | sidebar modul dan panel menu |
| `DashboardPageTabs` | tab level halaman workspace |
| `DashboardWidgetGrid` | konten dashboard default |
| `DashboardFormModal` | modal tambah/ubah dashboard |
| `WidgetLibraryModal` | modal daftar widget |
| `WorkspaceSearchModal` | modal pencarian menu |
| `buildWorkspaceSearchItems` | membangun item hasil pencarian dari blueprint |
| `mergeWorkspacePageConfigs` | menyuntik override page config tambahan di atas `PosBlueprint` |

### Shared Workspace Building Blocks

| Komponen/File | Peran |
| --- | --- |
| `implementedWorkspacePageIds` | daftar page id yang sudah punya implementasi nyata |
| `DockActionButton` | tombol aksi dock |
| `DockSaveButton` | tombol simpan dock |
| `AttachmentDockButton` | tombol lampiran |
| `PanelActions` | action bar panel |
| `SectionTab` | tab section konten |
| `SecondaryTabs` | tab sekunder |
| `TableToolbar` | toolbar tabel |
| `SortableTableHeaderCell` | header tabel sortable |
| `ChipLookupField` | field lookup berbasis chip |
| `LoadingOverlay` | loading overlay |
| `UserAvatar` | avatar user |
| `Icons` | icon set workspace |
| `formatTableTextValue` | helper formatting sel tabel |

### Navigation

| Komponen | Peran |
| --- | --- |
| `NavigationIcon` | ikon item navigasi |
| `NavigationTile` | tile/menu navigasi |
| `SidebarFlyout` | flyout sidebar |

## D. Preferences Components

Semua kelas di bawah dipakai oleh halaman `Preferensi`:

- `PreferencesView`
- `PreferencesTabs`
- `PreferencesSectionHeading`
- `PreferencesLookupField`
- `PreferencesChecklistView`
- `PreferencesFeatureView`
- `PreferencesTaxView`
- `PreferencesSalesView`
- `PreferencesPurchaseView`
- `PreferencesLimitationsView`
- `PreferencesApprovalView`
- `PreferencesAttachmentsView`
- `PreferencesOthersView`

## E. Workspace Module Views

### Pengaturan dan Administrasi

| Komponen | Dipakai Oleh |
| --- | --- |
| `UsersManagementView` | `Pengguna` |
| `GroupAccessView` | `Akses Grup` |
| `NumberingView` | `Penomoran` |
| `PrintDesignView` | `Desain Cetakan` |
| `TransactionApprovalView` | `Penyetuju Transaksi` |
| `ActivityLogView` | `Log Aktifitas` |
| `JournalActivityLogView` | `Log Aktifitas Jurnal` |
| `SavedTransactionsView` | `Transaksi Berulang`, `Transaksi Favorit` |

### Master Data dan Referensi

| Komponen | Dipakai Oleh |
| --- | --- |
| `CurrencyView` | `Mata Uang` |
| `BranchView` | `Cabang` |
| `DepartmentView` | `Departemen` |
| `TaxView` | `Pajak` |
| `PaymentTermsView` | `Syarat Pembayaran` |
| `ShippingView` | `Pengiriman` |
| `EmployeeView` | `Karyawan` |
| `AccountsView` | `Akun Perkiraan` |
| `ContactView` | `Kontak` |
| `BusinessPartnerView` | `Pelanggan`, `Pemasok` |
| `WarehouseView` | `Gudang` |
| `ItemsServicesView` | `Barang & Jasa` |
| `SimpleMasterView` | `FOB`, `Satuan Barang`, `Kategori Pelanggan`, `Kategori Pemasok`, `Kategori Penjualan` |
| `ItemCategoryView` | `Kategori Barang` |
| `InventoryInquiryView` | `Barang per Gudang`, `Barang Stok Minimum` |
| `SupplierPriceView` | `Harga Pemasok` |

### Buku Besar, Kas, dan Bank

| Komponen | Dipakai Oleh |
| --- | --- |
| `BudgetMonitorView` | `Monitor Anggaran` |
| `BudgetTransferView` | `Transfer Anggaran` |
| `BudgetView` | `Anggaran` |
| `BankTransferView` | `Transfer Bank` |
| `BankInquiryView` | `Histori Akun`, `Rekening Koran`, `Histori Bank`, `Rekonsiliasi Bank` |
| `CashPaymentView` | `Pembayaran` |
| `CashReceiptView` | `Penerimaan` |
| `PaymentOrderView` | `Perintah Pembayaran` |
| `SupplierTransferView` | `Transfer Pemasok` |
| `ExpenseEntryView` | `Pencatatan Beban` |
| `GeneralJournalView` | `Jurnal Umum` |
| `PayrollEntryView` | `Pencatatan Gaji` |
| `SalaryAllowanceView` | `Gaji/Tunjangan` |
| `PeriodEndView` | `Proses Akhir Bulan` |

### Penjualan

| Komponen | Dipakai Oleh |
| --- | --- |
| `SalesQuoteView` | `Penawaran Penjualan` |
| `SalesOrderView` | `Pesanan Penjualan` |
| `SalesDeliveryView` | `Pengiriman Pesanan` |
| `SalesInvoiceView` | `Faktur Penjualan` |
| `SalesDepositView` | `Uang Muka Penjualan` |
| `SalesReceiptView` | `Penerimaan Penjualan` |
| `SalesReturnView` | `Retur Penjualan` |
| `SalesCommissionView` | `Komisi Penjual` |
| `SalesTargetView` | `Target Penjualan` |
| `TableListView` | `Check In` |
| `SalesDocumentView` | basis umum form dokumen penjualan |

### Pembelian

| Komponen | Dipakai Oleh |
| --- | --- |
| `PurchaseOrderView` | `Pesanan Pembelian` |
| `GoodsReceiptView` | `Penerimaan Barang` |
| `PurchaseDepositView` | `Uang Muka Pembelian` |
| `PurchaseInvoiceView` | `Faktur Pembelian` |
| `PurchasePaymentView` | `Pembayaran Pembelian` |
| `PurchaseReturnView` | `Retur Pembelian` |

### Persediaan dan Fulfillment

| Komponen | Dipakai Oleh |
| --- | --- |
| `ItemRequestView` | `Permintaan Barang` |
| `StockTransferView` | `Pemindahan Barang` |
| `InventoryAdjustmentView` | `Penyesuaian Persediaan`, `Penyesuaian Harga/Diskon` |
| `WorkOrderView` | `Pekerjaan Pesanan` |
| `MaterialAdditionView` | `Penambahan Bahan Baku` |
| `WorkCompletionView` | `Penyelesaian Pesanan` |
| `StockOpnameOrderView` | `Perintah Stok Opname` |
| `StockOpnameResultView` | `Hasil Stok Opname` |
| `OrderFulfillmentView` | `Pemenuhan Pesanan` |

### Aset Tetap

| Komponen | Dipakai Oleh |
| --- | --- |
| `FixedAssetsView` | `Aset Tetap` |
| `AssetCategoryView` | `Kategori Aset` |
| `AssetTaxCategoryView` | `Kategori Aset Tetap Pajak` |
| `AssetChangeView` | `Perubahan Aset Tetap` |
| `AssetDisposalView` | `Disposisi Aset Tetap` |
| `AssetMoveView` | `Pindah Aset` |
| `AssetLocationView` | `Aset per Lokasi` |

### Pelaporan dan Placeholder

| Komponen | Dipakai Oleh |
| --- | --- |
| `ReportListView` | `Daftar Laporan` |
| `ModulePageView` | semua halaman placeholder yang belum punya implementasi konten |

## F. Shared Components untuk Halaman Transaksi

Komponen ini tidak langsung tampil sebagai halaman, tetapi menjadi fondasi banyak form transaksi:

- `TransactionWorkspaceShared`
- `TransferBatchWorkspaceView`
- `InquiryWorkspaceView`
- `DepositWorkspaceShared`
- `SalesDocumentSections`
- `SalesDocumentItemModal`
- `SalesReceiptInvoiceModal`
- `PurchasePaymentInvoiceModal`
- `InventoryAdjustmentWorkspace`
- `InventoryAdjustmentItemModal`
- `StockTransferItemModal`
- `StockOpnameOrderItemModal`
- `StockOpnameResultItemModal`
- `ItemRequestItemModal`
- `WorkOrderItemModal`
- `TargetDetailEntryModal`
- `FixedAssetExpenseModal`
- `AssetMoveItemModal`

## G. Auth Components

Semua kelas di bawah dipakai pada halaman login/register:

- `AuthCarouselPanel`
- `AuthFooterPrompt`
- `AuthHeading`
- `AuthInput`
- `AuthPanelShell`
- `BrandMark`
- `CarouselProgressDots`
- `CarouselSlideFrame`
- `LocaleSwitcher`
- `LoginFormPanel`
- `PasswordField`
- `RegisterFormPanel`
- `SocialButton`

## H. Config Builders dan Data Config Files

Pola implementasi workspace saat ini cukup konsisten:

- halaman kompleks memakai file `*Config.js` untuk data field, row, filter, modal, atau section
- komponen `*View.jsx` membaca config tersebut lalu merender form/tabel
- sebagian page override tambahan disuntik melalui `mergeWorkspacePageConfigs.js`

Contoh file config yang aktif:

- `accountsConfig.js`
- `businessPartnerConfig.js`
- `goodsReceiptConfig.js`
- `itemsServicesConfig.js`
- `salesOrderConfig.js`
- `purchaseInvoiceConfig.js`
- `stockTransferConfig.js`
- `workOrderConfig.js`

## I. Batasan Inventaris Saat Ini

- Dokumen ini mencatat kelas dan komponen yang benar-benar ada di repo saat ini.
- Backend domain class untuk katalog, inventory, purchasing, sales, finance, dan identity belum terimplementasi penuh.
- Karena itu, inventaris kelas paling lengkap sekarang memang berada di sisi React workspace, bukan di model/service backend.
