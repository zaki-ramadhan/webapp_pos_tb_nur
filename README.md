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
5. **Persediaan & HPP (Inventory & Costing)**: Permintaan barang antar gudang (mutasi barang), penyesuaian stok, stock opname, cek stok per gudang, serta penilaian persediaan dan perhitungan HPP berbasis **FIFO (First-In-First-Out)**.
6. **Kas & Bank**: Pencatatan uang masuk/keluar non-dagang, transfer bank, dan rekonsiliasi bank.
7. **Laporan**: Laporan laba rugi, neraca, arus kas, mutasi stok, serta history penjualan/pembelian.

### 📈 Penilaian Persediaan & HPP (FIFO Costing Engine)
Aplikasi dilengkapi dengan sistem penilaian persediaan otomatis berbasis FIFO yang handal:
* **Pencatatan Batch Persediaan (Stock Entry)**: Setiap transaksi masuk (Goods Receipt, Sales Return, Work Completion, penyesuaian stok positif, dan hasil stock opname positif) otomatis mendaftarkan batch persediaan baru lengkap dengan data warehouse, kuantitas, tanggal masuk, dan harga beli asli (`unit_cost`).
* **Konsumsi FIFO Otomatis (Stock Consumption)**: Setiap transaksi keluar (Sales Delivery, Purchase Return, Material Addition, penyesuaian stok negatif, dan hasil stock opname negatif) otomatis memotong persediaan dari batch tertua terlebih dahulu, menghitung COGS/HPP dinamis berdasarkan harga beli batch tersebut, serta menyematkan rincian konsumsi pada baris transaksi.
* **Mutasi Stok Presisi (Stock Transfer)**: Transfer barang antar-gudang mengonsumsi stok gudang asal menggunakan alur FIFO, kemudian otomatis mendaftarkan batch baru di gudang tujuan dengan menggunakan harga beli rata-rata tertimbang dari batch yang dipindahkan.
* **Alur Koreksi Pintar (Rollback Costing)**: Jika dokumen transaksi diperbarui (update), dihapus (delete), atau dibatalkan (void/cancelled), sistem secara otomatis membatalkan konsumsi batch dan mengembalikan persediaan/batch ke kondisi semula guna mencegah terjadinya ketidaksesuaian nilai buku stok.

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
