# Web App POS TB Nur

Aplikasi POS (Point of Sale) versi web untuk Toko Bangunan "TB Nur". Web app ini digunakan oleh **owner** dan **karyawan back-office** untuk mengelola data master, stok gudang, pembelian supplier, penjualan tempo/piutang, pencatatan kas/bank, serta melihat laporan keuangan.

## 🛠️ Stack Teknologi
* **Backend:** Laravel 11
* **Frontend:** React 19 + Inertia.js (Single Page Application)
* **Styling:** CSS + Tailwind CSS v4
* **Database:** MySQL

## 📂 Fitur Utama
1. **Pengaturan & Akses**: Kelola data user, hak akses (role & permissions), cabang, dan log audit.
2. **Katalog Produk**: Kelola data barang (satuan, konversi unit, barcode, dan tiering harga grosir/eceran).
3. **Pembelian (Purchasing)**: Input faktur pembelian dari supplier, pembayaran utang, dan retur pembelian.
4. **Penjualan (Sales)**: Input faktur penjualan (mendukung impor item dari Excel/CSV), pelunasan piutang pelanggan, retur penjualan, dan sales check-in.
5. **Persediaan (Inventory)**: Permintaan barang antar gudang (mendukung impor item dari Excel/CSV), penyesuaian stok, stock opname, dan cek stok per gudang.
6. **Kas & Bank**: Pencatatan uang masuk/keluar non-dagang, transfer bank, dan rekonsiliasi bank.
7. **Laporan**: Laporan laba rugi, neraca, arus kas, mutasi stok, serta history penjualan/pembelian.

## 🚀 Cara Menjalankan Aplikasi

1. **Install Dependencies:**
   ```bash
   composer install
   npm install
   ```

2. **Konfigurasi Database:**
   Salin `.env.example` menjadi `.env` dan sesuaikan settingan database. Kemudian jalankan migrasi & seeder:
   ```bash
   php artisan migrate --seed
   ```

3. **Jalankan Dev Server:**
   ```bash
   # Terminal 1: Laravel Server
   php artisan serve
   
   # Terminal 2: Frontend Dev Server
   npm run dev
   ```

4. **Testing:**
   ```bash
   composer test
   ```
