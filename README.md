# Web App POS & ERP Toko Bangunan "TB Nur"

Aplikasi POS (Point of Sale) dan ERP (Enterprise Resource Planning) berbasis web yang dirancang khusus untuk Toko Bangunan **"TB Nur"**. Aplikasi ini digunakan oleh **Owner (Pemilik Toko)** dan **Karyawan Back-Office** untuk mengelola data master, stok gudang multi-cabang, pembelian supplier, penjualan tempo/piutang, pencatatan kas/bank, serta menghasilkan laporan keuangan real-time.

---

## 💡 CONTEKAN SIDANG TUGAS AKHIR (CHEAT SHEET)

Bagian ini dirancang khusus untuk membantu Anda menjawab pertanyaan dosen penguji dengan jawaban teknis yang berbobot dan profesional.

### 1. Daftar Integrasi API Eksternal & Optimasi (Upstream API)
Aplikasi ini melakukan pemanggilan (fetch) ke API luar, tetapi **dioptimalkan secara ketat** agar hemat kuota request dan tidak terkena rate limit:

*   **API Daftar Bank Indonesia (Upstream API)**
    *   **Endpoint Asli (GitHub Raw)**: `https://raw.githubusercontent.com/riod94/list-bank-indonesia/master/bank.json`
    *   **Endpoint Lokal Backend**: `/api/backend/banks`
    *   **Metode & Optimasi**: Backend Laravel mengambil data bank dari repositori open-source GitHub tersebut secara berkala dan menyimpannya ke memori cache server menggunakan `Cache::rememberForever('indonesian_banks_list', ...)`. 
    *   **Keuntungan (Alasan Sidang)**: Menghindari network latency (0ms response untuk frontend), bebas dari risiko server luar down, dan memiliki sistem *Fail-Safe Fallback* (jika koneksi internet terputus, backend otomatis memuat cadangan data lokal agar aplikasi tidak crash).

*   **API Nilai Tukar Mata Uang (Upstream API)**
    *   **Endpoint Asli (ExchangeRate-API)**: `https://open.er-api.com/v6/latest/USD`
    *   **Endpoint Lokal Backend**: `/api/backend/currencies/sync`
    *   **Metode & Optimasi**: Menggunakan `Cache::remember` dengan durasi **12 jam** (43.200 detik).
    *   **Keuntungan (Alasan Sidang)**: Karena kurs harian hanya diperbarui sekali sehari oleh penyedia API, membatasi request hanya setiap 12 jam sekali sangat menghemat resource server dan menjamin limit API gratis tidak akan pernah habis.

---

### 2. Fitur Unggulan & Algoritma Utama

#### A. Penilaian Persediaan & HPP (FIFO Costing Engine)
Aplikasi menggunakan metode **FIFO (First-In-First-Out)** untuk pencatatan arus barang dan perhitungan Harga Pokok Penjualan (HPP/COGS):
*   **Pencatatan Batch (Stock Entry)**: Setiap barang masuk (Faktur Pembelian, Retur Penjualan, Penyesuaian Positif) mendaftarkan batch baru di database lengkap dengan harga beli asli (`unit_cost`) dan tanggal masuk.
*   **Konsumsi FIFO (Stock Consumption)**: Ketika terjadi barang keluar (Faktur Penjualan, Retur Pembelian, Penyesuaian Negatif), sistem otomatis memotong stok dari batch tertua terlebih dahulu. HPP dihitung secara dinamis berdasarkan nilai beli batch yang terpotong tersebut.
*   **Rollback Costing**: Jika dokumen transaksi diperbarui (update) atau dibatalkan (void), sistem secara otomatis mengembalikan status konsumsi batch ke kondisi semula untuk mencegah ketidaksesuaian nilai buku stok.

#### B. Unified Document Model (Pola Desain Database)
Untuk transaksi keuangan dan stok, kami tidak membuat puluhan tabel transaksi terpisah. Kami menerapkan pola **Unified Document Model**:
*   Semua transaksi keuangan (Penawaran, Sales Order, Invoice, Pembayaran Kas/Bank) disimpan dalam tabel terpadu `operation_documents` dan detail item di `operation_document_lines`. Kolom `document_type` bertindak sebagai pembeda.
*   Semua pergerakan barang non-keuangan (Mutasi barang antar-gudang, stock opname, koreksi penyesuaian) disimpan dalam tabel `inventory_documents` dan `inventory_document_lines`.
*   **Alasan Teknis**: Mengurangi jumlah table join di database, menyederhanakan query, serta mempercepat proses audit transaksi.

#### C. Multitab Workspace SPA (Single Page Application)
*   Menggunakan **Inertia.js + React 19**.
*   Sistem tab workspace di frontend memungkinkan pengguna membuka banyak modul sekaligus (seperti browser tab di dalam aplikasi) tanpa melakukan reload halaman penuh. State form dan input yang sedang dikerjakan tidak akan hilang jika pengguna berpindah tab.

---

## 🛠️ Daftar Endpoint API Lokal (Backend Controller)

Semua endpoint dilindungi oleh middleware `auth` dan `throttle:api`:

| Method | Endpoint | Fungsi | Keterangan |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/backend/resources` | Mendapatkan daftar modul yang aktif | Membaca konfigurasi hak akses user |
| **GET** | `/api/backend/banks` | Mengambil daftar bank Indonesia | Terhubung ke Upstream API & Cache |
| **POST**| `/api/backend/currencies/sync` | Sinkronisasi kurs mata uang | Update database berbasis API kurs USD |
| **POST**| `/api/backend/attachments/upload`| Unggah lampiran berkas dokumen | Menyimpan bukti transaksi |
| **GET** | `/api/backend/{resource}` | List data (Read) | Mendukung pencarian, filter, & pagination |
| **POST**| `/api/backend/{resource}` | Buat data baru (Create) | Menjalankan validasi Form Request |
| **GET** | `/api/backend/{resource}/{id}`| Detail data (Read One) | Mengembalikan relasi data lengkap |
| **PUT** | `/api/backend/{resource}/{id}`| Edit/Update data | Memicu audit log & penyesuaian HPP |
| **DELETE**| `/api/backend/{resource}/{id}`| Hapus data | Soft delete / Hard delete |

*(Catatan: `{resource}` di atas dinamis, bernilai `products`, `customers`, `suppliers`, `employees`, `sales-invoices`, dll.)*

---

## 🗄️ Entitas Database Utama (Entity Relationship)

Berikut adalah ringkasan entitas utama di database MySQL `post_tb_nur`:

1.  **Grup Pengaturan & Organisasi**
    *   `users`: Autentikasi sistem (email, password).
    *   `roles` & `permissions`: Level otorisasi hak akses menu.
    *   `branches`: Kantor cabang operasional (Pusat, Cabang A).
    *   `warehouses`: Gudang penyimpanan barang (terikat ke cabang).
    *   `employees` & `employee_bank_accounts`: Data staf, gaji, dan rekening transfer.

2.  **Grup Katalog & Partner**
    *   `products`: Data barang & jasa (SKU, nama, stok minimal).
    *   `units` & `product_unit_conversions`: Satuan unit (Pcs, Sak, Kubik) dan konversinya.
    *   `product_prices`: Harga bertingkat (Tiering) untuk retail vs kontraktor.
    *   `customers` & `suppliers`: Data kontak pembeli dan pemasok tempo.

3.  **Grup Transaksi**
    *   `operation_documents` & `_lines`: Faktur penjualan/POS, retur, hutang-piutang, kas masuk/keluar.
    *   `inventory_documents` & `_lines`: Mutasi stok antar-gudang, stok opname, koreksi stok.

---

## 📂 Peta Halaman & Modul Aplikasi (Frontend Workspace)

Halaman diletakkan secara modular pada direktori `resources/js/features/workspace/modules`:

1.  **Pengaturan**: Preferensi toko, format penomoran nota, hak akses role & permission, manajemen user, approval transaksi keuangan.
2.  **Perusahaan**: Manajemen cabang, departemen, pajak perusahaan, penggajian karyawan (payroll), log aktivitas audit staf.
3.  **Buku Besar (Accounting)**: Chart of Accounts (COA) / rekening perkiraan, beban biaya, payroll bulanan, jurnal umum manual.
4.  **Kas & Bank**: Pencatatan uang masuk, uang keluar non-dagang, transfer saldo antar bank, rekonsiliasi laporan bank.
5.  **Penjualan (Sales)**: Uang muka penjualan, penawaran harga, order penjualan, faktur penjualan (POS/tempo), penerimaan pembayaran piutang, retur penjualan, database pelanggan, check-in kunjungan sales.
6.  **Pembelian (Purchasing)**: Permintaan pembelian, order pembelian, faktur pembelian (hutang), pembayaran hutang supplier, retur pembelian, master harga supplier.
7.  **Persediaan (Inventory)**: Permintaan mutasi barang antar gudang, penyesuaian stok selisih, opname stok fisik, kategori barang, cek kartu stok gudang.
8.  **Laporan**: Cetak Laporan Laba Rugi, Neraca Keuangan, Arus Kas, Buku Pembantu Piutang, Kartu Stok Barang.

---

## 🚀 Cara Menjalankan Aplikasi

1.  **Install Dependencies:**
    ```bash
    composer install
    npm install
    ```
2.  **Konfigurasi Database:**
    Salin `.env.example` menjadi `.env` dan sesuaikan settingan database (`DB_DATABASE=post_tb_nur`).
3.  **Migrasi & Seed Data:**
    ```bash
    php artisan migrate --seed
    ```
4.  **Jalankan Dev Server:**
    ```bash
    composer run dev
    ```
