# Dokumentasi Daftar Tabel Database POS TB NUR

> **Tanggal Pencatatan**: Sabtu, 8 Agustus 2026  
> **Total Tabel Fungsional**: 39 Tabel  
> **Total Tabel Internal Laravel (Dikecualikan dari Laporan)**: 8 Tabel  
> **Total Tabel Keseluruhan Database**: 47 Tabel  

---

## 📋 Daftar 39 Tabel Fungsional Aplikasi POS TB NUR

### 👤 1. Modul Otorisasi & Pengguna (Identity)
1. **`users`** – Data akun pengguna (Kasir & Owner).
2. **`roles`** – Data peran hak akses (`super_admin` / Owner, `kasir`).
3. **`role_user`** – Tabel jembatan relasi akun pengguna $\leftrightarrow$ peran.
4. **`access_groups`** – Data grup pembatasan jam kerja kasir.
5. **`access_group_user`** – Tabel jembatan relasi akun pengguna $\leftrightarrow$ grup jam kerja.

### 🏢 2. Modul Organisasi & Karyawan (Organization & HR)
6. **`branches`** – Master cabang toko TB NUR.
7. **`branch_user`** – Relasi akun pengguna per cabang.
8. **`employees`** – Master data karyawan toko.
9. **`employee_bank_accounts`** – Rekening bank transfer gaji karyawan.
10. **`salary_allowances`** – Master komponen gaji & tunjangan karyawan.

### 📦 3. Modul Katalog, Produk & Persediaan (Catalog & Inventory)
11. **`products`** – Master data barang & jasa bangunan.
12. **`product_categories`** – Master kategori barang (Semen, Cat, Kayu, Besi).
13. **`product_group_items`** – Racikan item paket/bundling barang.
14. **`brands`** – Master merek barang (Tiga Roda, Dulux, Holcim).
15. **`units`** – Master satuan barang (Pcs, Sak, Kg, Dus, Batang).
16. **`warehouses`** – Master lokasi gudang/toko.
17. **`inventory_documents`** – Dokumen penyesuaian stok opname & transfer barang.
18. **`inventory_document_lines`** – Baris rincian item barang stok opname/transfer.
19. **`inventory_document_user`** – Data operator pemroses dokumen persediaan.
20. **`inventory_batches`** – Pelacakan stok per batch / tanggal kedaluwarsa.

### 🤝 4. Modul Mitra Bisnis (Partners)
21. **`customers`** – Master data pelanggan toko.
22. **`customer_categories`** – Kategori kelompok pelanggan (Grosir/Eceran).
23. **`customer_branch`** – Relasi data pelanggan per cabang.
24. **`suppliers`** – Master data pemasok/vendor bahan bangunan.
25. **`supplier_categories`** – Kategori kelompok pemasok.
26. **`branch_supplier`** – Relasi pemasok per cabang.

### 💰 5. Modul Transaksi Operasional & Akuntansi (Operation & Finance)
27. **`operation_documents`** – Dokumen utama transaksi (Faktur Penjualan, Penerimaan Kas, Faktur Pembelian, Pembayaran Kas, Pencatatan Beban, & Pencatatan Gaji).
28. **`operation_document_lines`** – Baris rincian item & nilai debit/kredit transaksi.
29. **`operation_document_user`** – Operator/Kasir pencatat transaksi.
30. **`accounts`** – Chart of Accounts (Akun Perkiraan Kas, Bank, Beban, Modal, Pendapatan).
31. **`account_branch`** – Relasi akun perkiraan per cabang.
32. **`account_user`** – Hak penanggungjawab akun perkiraan.
33. **`currencies`** – Master referensi mata uang.
34. **`taxes`** – Master referensi pajak.

### ⚙️ 6. Modul Pengaturan & Log Sistem (Settings & Audit Logs)
35. **`preference_settings`** – Pengaturan preferensi toko & nota.
36. **`numbering_sequences`** – Pengaturan penomoran otomatis transaksi (Faktur/Nota).
37. **`numbering_sequence_components`** – Komponen penyusun format nomor transaksi.
38. **`attachments`** – Berkas lampiran file/foto nota transaksi.
39. **`activity_logs`** – Log riwayat jejak audit aktivitas pengguna.

---

## ⚙️ 8 Tabel Internal Framework Laravel (Dikecualikan dari Laporan Skripsi)

1. `migrations` – Riwayat migrasi skema database.
2. `sessions` – Sesi login aktif pengguna di browser.
3. `password_reset_tokens` – Token keamanan reset kata sandi.
4. `jobs` – Antrean pekerjaan latar belakang.
5. `job_batches` – Penanganan batch pekerjaan.
6. `failed_jobs` – Log pekerjaan antrean yang gagal.
7. `cache` – Penyimpanan cache performa backend.
8. `cache_locks` – Mekanisme penguncian cache.
