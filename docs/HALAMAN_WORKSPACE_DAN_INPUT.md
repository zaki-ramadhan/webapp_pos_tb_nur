# UI Workspace Pages and Inputs

Dokumen ini mendata halaman workspace yang saat ini sudah terhubung beserta input yang sudah ter-render di UI.

Catatan:

- Fokus daftar ini adalah input yang terlihat di halaman: field teks, select, checkbox, radio, lookup/search, tanggal, tab detail, dan modal input.
- Tombol aksi murni seperti `refresh`, `print`, atau `download` tidak dihitung sebagai input kecuali tombol itu membuka area input lain.
- Untuk halaman yang sangat panjang atau bertab banyak, input diringkas pada level section/tab supaya tetap mudah dipindai.

## A. Pengaturan Umum dan Akses

### `Dashboard`

- tidak punya form khusus di area konten
- input hanya ada di modal global dashboard

### `Preferensi`

- sidebar section:
  - `Perusahaan`
  - `Fitur`
  - `Pajak`
  - `Penjualan`
  - `Pembelian`
  - `Pembatasan`
  - `Persetujuan`
  - `Lampiran`
  - `Atribut Tambahan`
  - `Akun Perkiraan`
  - `Lain-lain`
- tab `Perusahaan > Info Perusahaan`
  - `Nama`
  - `Kategori Usaha`
  - `Bidang Usaha`
  - `Telepon`
  - `Faksimili`
  - `Email`
  - `Tgl Mulai Data`
  - `Periode Akuntansi`
  - `Mata Uang`
- tab `Perusahaan > Alamat`
  - `Alamat`
  - `Kota`
  - `Provinsi`
  - `K.Pos`
  - `Negara`
  - token alamat / chip lookup
- section lain:
  - campuran `select`, `text input`, `date`, `search`, `checkbox`, `chip-search`, dan checklist per modul

### `Akses Grup`

- tab `Umum` dan `Hak Akses`
- input utama:
  - `Nama Grup`
  - pembatasan akses
  - pemilihan pengguna anggota grup
  - matriks hak akses per menu dengan checkbox `active/create/update/delete/view`
- mode tabel:
  - `Cari...`

### `Pengguna`

- form:
  - `No Handphone/Email`
  - `Jenis Akses`
  - `Akses Grup`
- tabel:
  - `Cari...`

### `Penomoran`

- tab `Penomoran` dan `Daftar Pengguna`
- form tab `Penomoran`
  - `Nama`
  - `Tipe Transaksi`
  - `Tipe Penomoran`
  - `Jumlah Digit Counter`
  - `Komponen Penomoran`
- form tab `Daftar Pengguna`
  - checkbox `semua pengguna`
- tabel:
  - filter `tipe transaksi`
  - `Cari...`

### `Transaksi Berulang`

- view list saja
- pola input saat ini: search/filter di area header sesuai config inquiry

### `Transaksi Favorit`

- view list saja
- pola input saat ini: search/filter di area header sesuai config inquiry

### `Log Aktifitas`

- view list saja
- pola input saat ini: search/filter di area header sesuai config inquiry

### `Log Aktifitas Jurnal`

- view list/detail log
- pola input saat ini: search tabel dan pembukaan tab detail dari row

### `Desain Cetakan`

- daftar desain / template di tabel
- pencarian tabel
- form pengaturan desain cetak saat buat/detail

### `Penyetuju Transaksi`

- daftar setup approval di tabel
- pencarian tabel
- form aturan penyetujuan transaksi

## B. Master Data

### `Mata Uang`

- pencarian tabel
- form master mata uang dan atribut kurs/status

### `Cabang`

- tab form:
  - `Cabang`
  - `Daftar Pengguna`
- tabel:
  - `Cari...`

### `Departemen`

- tab form:
  - `Departemen`
  - `Saldo Awal`
  - `Daftar Pengguna`
- tabel:
  - `Cari...`

### `Pajak`

- tabel:
  - filter `Tipe Pajak`
  - `Cari...`
- form:
  - `Tipe Pajak`
  - `Keterangan`
  - `Persentase`
  - `Akun Pajak Keluaran`
  - `Akun Pajak Masukan`

### `Syarat Pembayaran`

- pencarian tabel
- field syarat pembayaran dan status penggunaan

### `Pengiriman`

- pencarian tabel
- field master pengiriman

### `FOB`

- form:
  - `Nama`
- tabel:
  - `Cari...`

### `Karyawan`

- tab form:
  - `Karyawan`
  - `Alamat`
  - `Pajak Penghasilan`
  - `Rekening Gaji`
- tabel:
  - `Cari...`

### `Akun Perkiraan`

- form:
  - `Tipe Akun`
  - `Sub Akun`
  - `Kode Perkiraan`
  - `Nama`
  - `Mata Uang`
  - `Saldo`
  - `Cabang`
  - `Saldo Awal > Nilai`
  - `Saldo Awal > per Tgl`
  - `Catatan`
  - `Semua Pengguna`
  - `No. Bukti Kas/Bank`
- tabel:
  - filter sesuai tipe/kelompok akun
  - `Cari...`

### `Kontak`

- search/header control sesuai config inquiry
- tabel hasil

### `Pelanggan`

- form ringkas per tab:
  - data umum: `Nama`, `Kategori`, `No. Telp. Bisnis`, `Handphone`, `No. WhatsApp`, `Email`, `Faximili`, `Website`
  - alamat tagihan dan alamat kirim
  - `Dipakai di Cabang`
  - `Mata Uang Utama`
  - tabel `Kontak`
  - tabel `Alamat lainnya`
  - pengaturan penjualan/piutang
  - data pajak
  - batas piutang
  - `Catatan`
- tabel:
  - search/filter pelanggan

### `Pemasok`

- form ringkas per tab:
  - data umum: `Nama`, `Kategori`, `No. Telp. Bisnis`, `Handphone`, `No. WhatsApp`, `Email`, `Faximili`, `Website`
  - alamat tagihan
  - `Dipakai di Cabang`
  - `Mata Uang Utama`
  - tabel `Kontak`
  - pengaturan pembelian
  - tabel `Rekening Bank`
  - info pajak
  - `Catatan`
- tabel:
  - search/filter pemasok

### `Kategori Pelanggan`

- form:
  - `Nama Kategori`
  - `Kategori Default`
  - `Sub Kategori`
- tabel:
  - `Cari...`

### `Kategori Pemasok`

- form:
  - `Nama Kategori`
  - `Kategori Default`
  - `Sub Kategori`
- tabel:
  - `Cari...`

### `Kategori Penjualan`

- form:
  - `Nama Kategori`
  - `Keterangan`
- tabel:
  - `Cari...`

### `Gudang`

- pencarian tabel
- field master gudang, cabang, dan pengguna

### `Barang & Jasa`

- tab form:
  - `Umum`
  - `Penjualan / Pembelian`
  - `Stok`
  - `Akun`
  - `Gambar`
  - `Lain-lain`
- input inti:
  - `Nama`
  - `Kategori`
  - `Jenis Barang`
  - `Kode Barang`
  - `Barcode`
  - `Satuan`
  - konversi satuan
  - `Merek`
  - pemasok utama
  - harga jual/beli
  - stok minimum
  - pajak
  - saldo awal stok
  - mapping akun
  - gambar
  - dimensi / berat / catatan
- tabel:
  - filter kategori/jenis
  - `Cari...`

### `Satuan Barang`

- form:
  - `Nama`
  - `Pajak`
  - `Ref Kode Pajak`
- tabel:
  - `Cari...`

### `Kategori Barang`

- pencarian tabel
- field kategori barang induk/anak dan atribut dasar

### `Barang per Gudang`

- search/header control
- tabel stok per gudang

## C. Keuangan, Kas, dan Bank

### `Monitor Anggaran`

- masih placeholder internal

### `Transfer Anggaran`

- pencarian tabel
- field sumber anggaran, tujuan anggaran, nilai transfer, tanggal, keterangan

### `Anggaran`

- pencarian tabel
- field data anggaran utama dan detail alokasi

### `Histori Akun`

- kontrol inquiry seperti tanggal / akun / keyword

### `Transfer Bank`

- akun/bank asal
- akun/bank tujuan
- tanggal
- nilai transfer
- kurs / biaya
- keterangan
- rekonsiliasi
- tabel daftar transaksi

### `Pembayaran`

- pihak yang dibayar
- kas/bank
- nilai pembayaran
- no bukti
- tanggal bayar
- metode bayar
- jatuh tempo / cek
- cabang
- keterangan
- tabel faktur yang dibayar
- tabel:
  - filter tanggal/metode/bank/pihak
  - `Cari...`

### `Penerimaan`

- penerima/sumber dana
- kas/bank
- nilai pembayaran
- no bukti
- tanggal bayar
- metode bayar
- tanggal cek
- cabang
- keterangan
- tabel faktur yang diterima
- tabel:
  - filter tanggal/metode/bank/pihak
  - `Cari...`

### `Rekening Koran`

- kontrol inquiry select/date/search

### `Histori Bank`

- kontrol inquiry select/date/search

### `Rekonsiliasi Bank`

- kontrol inquiry select/date/search

### `Pembayaran Pembelian`

- `Pembayaran ke`
- `Bank`
- `Nilai Pembayaran`
- `No Bukti #`
- `Tgl Bayar`
- `Metode Bayar`
- `Jth Tempo PPh`
- `Keterangan`
- `Cabang`
- tabel `Faktur`
- tabel:
  - filter tanggal / tanggal cek / metode bayar / bank / pemasok
  - `Cari...`

### `Perintah Pembayaran`

- pencarian tabel
- setup perintah pembayaran dan daftar transaksi yang diambil

### `Transfer Pemasok`

- input header:
  - select `Belum Dibayar`
  - select `7 hari terakhir`
  - `Cari Nomor/Nama bank/Rek..`
- footer:
  - select pilihan aksi
- tabel:
  - checkbox per row
  - daftar transfer pemasok

## D. Penjualan

### `Penawaran Penjualan`

- header form:
  - `Dipesan oleh`
  - `Tanggal`
  - `Nomor #`
  - `Syarat Pembayaran`
  - `Alamat`
  - `Cabang`
  - `Keterangan`
- section:
  - `Rincian Barang`
  - `Info lainnya`
  - `Biaya Lainnya`
  - `Informasi Penawaran`
- tabel:
  - filter `Tanggal`, `Pelanggan`, `Status`, `Sudah dicetak`
  - `Cari...`

### `Pesanan Penjualan`

- header form:
  - `Dipesan oleh`
  - `Tanggal`
  - `No Pesanan #`
  - `Syarat Pembayaran`
  - `No. PO`
  - `Alamat`
  - `Cabang`
  - `Keterangan`
  - `Pajak`
  - `Tgl Pengiriman`
  - `Pengiriman`
  - `FOB`
- section:
  - `Rincian Barang`
  - `Info lainnya`
  - `Biaya Lainnya`
  - `Informasi Pesanan`

### `Pengiriman Pesanan`

- header form:
  - `Kirim ke`
  - `Tanggal`
  - `No Pengiriman #`
  - `Alamat`
  - `Cabang`
  - `Keterangan`
- section:
  - `Rincian Barang`
  - `Info lainnya`
  - `Informasi Pengiriman`
- item modal:
  - `Kode`
  - `Nama`
  - `Kuantitas`
  - `Satuan`
  - `Gudang`
  - `Departemen`
  - `Keterangan`
  - `No Penawaran`
  - `No Pesanan`

### `Faktur Penjualan`

- header form:
  - `Pelanggan`
  - `Tanggal`
  - `No Faktur #`
  - `Faktur Dimuka`
  - `Syarat Pembayaran`
  - `No. PO`
  - `Alamat`
  - `Cabang`
  - `Keterangan`
  - `Kontak`
- info pajak:
  - `Tgl Faktur Pajak`
  - `Tipe Transaksi`
  - `Detail Transaksi`
  - `Data Wajib Pajak`
  - `ID TKU`
  - `No. Faktur Pajak`
- info pengiriman:
  - `Tgl Pengiriman`
  - `Pengiriman`
  - `FOB`
- section lain:
  - `Rincian Barang`
  - `Biaya Lainnya`
  - `Uang Muka`
  - `Informasi Faktur`

### `Uang Muka Penjualan`

- `Pelanggan`
- `Tanggal`
- `No Faktur #`
- `Uang Muka`
- `No. PO`
- `Pajak`
- `Syarat Pembayaran`
- `Alamat`
- `Cabang`
- `Keterangan`

### `Penerimaan Penjualan`

- `Terima dari`
- `Bank`
- `Nilai Pembayaran`
- `No Bukti #`
- `Tgl Bayar`
- `Metode Bayar`
- `Tanggal Cek`
- `Cabang`
- `Keterangan`
- tabel invoice penerimaan

### `Retur Penjualan`

- pelanggan
- tanggal retur
- nomor retur
- sumber retur
- rincian barang
- pajak
- keterangan

### `Komisi Penjual`

- form tab `Komisi`
  - `Periode`
  - `Nama`
  - `Penjual`
  - `Order`
  - `Cakupan Produk`
  - `Cakupan Pemasok`
  - `Kondisi`
  - `Reward`
- form tab `Lainnya`
  - `Catatan`
  - `Nonaktif`
- tabel:
  - `Cari...`

### `Target Penjualan`

- header form:
  - `Nama`
  - `Tipe`
  - `Cabang`
  - `Tanggal Mulai`
  - `Tanggal Selesai`
- section detail:
  - `Cari...`
  - tabel rincian target
  - modal detail row target
- section `Info lainnya`
  - `Catatan`
  - `Analis`

### `Check In`

- search tabel
- filter bila ada dari config halaman

## E. Pembelian

### `Pesanan Pembelian`

- pemasok
- tanggal
- `No. PO`
- syarat pembayaran
- alamat
- cabang
- keterangan
- pajak
- pengiriman
- FOB
- rincian barang
- biaya lainnya

### `Penerimaan Barang`

- `Terima dari`
- `Tanggal`
- `No Form #`
- `No Terima #`
- `Alamat`
- `Cabang`
- `Keterangan`
- `Tgl Kirim`
- `Pengiriman`
- `FOB`
- `Rincian Barang`

### `Uang Muka Pembelian`

- `Pemasok`
- `Tanggal`
- `No Form #`
- `No. PO`
- `Total Pesanan`
- `Uang Muka`
- `Pajak`
- `Syarat Pembayaran`
- `No Faktur #`
- `Rekening Bank`
- `Alamat`
- `Cabang`
- `Keterangan`
- `Tgl Faktur Pajak`
- `Tipe Transaksi`
- `Detail Transaksi`
- `No. Faktur Pajak`

### `Faktur Pembelian`

- `Pemasok`
- `Tanggal`
- `No Form #`
- `Tagihan Dimuka`
- `Syarat Pembayaran`
- `No Faktur #`
- `Alamat`
- `Cabang`
- `Keterangan`
- `Pajak`
- `Tgl Pengiriman`
- `Pengiriman`
- `FOB`
- `Kurs`
- `Rekening Bank`
- `Rincian Barang`
- `Biaya Lainnya`

### `Retur Pembelian`

- `Pemasok`
- `Tanggal`
- `No Retur #`
- `Retur dari`
- `Ke Alamat`
- `Cabang`
- `Keterangan`
- `Pajak`
- `Kurs`
- `Rincian Barang`
- `Biaya Lainnya`
- `Dicetak/email`

### `Harga Pemasok`

- lookup pemasok/barang
- harga dan periode harga

## F. Persediaan dan Fulfillment

### `Permintaan Barang`

- `Tanggal Permintaan`
- `Tipe Permintaan`
- `Nomor Dokumen`
- `Cabang`
- `Keterangan`
- `Rincian Barang`

### `Pemindahan Barang`

- `Proses`
- `Gudang`
- `Gudang Tujuan` atau `Gudang Pengirim`
- `No. Pemindahan #`
- `Tanggal`
- `Keterangan`
- `Cabang`
- `Dicetak/email`
- `Rincian Barang`

### `Penyesuaian Persediaan`

- `Tanggal`
- `No Penyesuaian #`
- `Akun Penyesuaian`
- `Keterangan`
- `Cabang`
- `Rincian Barang`

### `Penyesuaian Harga/Diskon`

- `Tanggal`
- `No Penyesuaian #`
- `Akun Penyesuaian`
- `Keterangan`
- `Cabang`
- `Rincian Barang`

### `Pekerjaan Pesanan`

- `Tanggal`
- `No Batch #`
- `Referensi Pelanggan`
- `Akun Biaya`
- `Akun Selisih Biaya`
- `Cabang`
- `Keterangan`
- `Tutup Pekerjaan`
- `Rincian Barang`
- `Biaya Lainnya`
- `Informasi Pekerjaan`

### `Penambahan Bahan Baku`

- `Tanggal`
- `Tipe`
- `No Pekerjaan #`
- `No Batch #`
- `Cabang`
- `Keterangan`
- `Rincian Barang`
- `Biaya Lainnya`

### `Penyelesaian Pesanan`

- `Tanggal`
- `No Pekerjaan #`
- `Tipe Penyelesaian`
- `No Dokumen`
- `Cabang`
- `Keterangan`
- `Rincian Barang`

### `Perintah Stok Opname`

- `Tanggal SPK`
- `No. SPK`
- `Status`
- `Cabang`
- `Departemen`
- `Tanggal Mulai`
- `Penanggung Jawab`
- `Dikerjakan oleh`
- `Keterangan`
- `Gudang`
- `Kategori Barang`
- `Pemasok Barang`
- `Merek Barang`
- tabel hasil hitung opname

### `Hasil Stok Opname`

- `Tanggal Opname`
- `No. Opname`
- `Perintah Opname`
- `Keterangan`
- `Rincian Barang`

### `Pemenuhan Pesanan`

- input header:
  - `Cabang`
  - `Gudang`
- tabel:
  - `Pelanggan`
  - `No Pesanan`
  - `Tanggal`
  - `Tgl Pengiriman`
  - `Terkirim`
  - `Dapat Dikirim`

### `Barang Stok Minimum`

- search/filter tabel sesuai config halaman

## G. Aset Tetap

### `Aset Tetap`

- `Nama`
- `Kode Aset`
- `Tanggal Beli`
- `Tanggal Pakai`
- `Aset Tidak Berwujud`
- `Metode Penyusutan`
- `Akun Aset`
- `Akun Akumulasi Penyusutan`
- `Akun Beban Penyusutan`
- `Kuantitas`
- `Umur Aset`
- `Rasio`
- `Nilai Sisa`
- `Kategori Aset`
- `Cabang`
- `Departemen`
- `Lokasi Awal Aset`
- `Catatan`
- `Pajak`
- `Penyusutan Terakhir`
- `Kategori Pajak`
- `Akun Pengeluaran`
- `Lokasi Aset`

### `Kategori Aset`

- nama kategori aset
- akun-akun terkait
- pencarian tabel

### `Kategori Aset Tetap Pajak`

- `Nama`
- `Metode Penyusutan`
- `Perkiraan Umur`
- `Tarif Penyusutan`

### `Perubahan Aset Tetap`

- lookup `Aset`
- tipe perubahan
- tanggal
- nomor
- akun aset
- cabang
- departemen
- biaya/expense table
- keterangan

### `Disposisi Aset Tetap`

- `Aset`
- `Penyusutan Terakhir`
- `Nilai Sisa Buku`
- `Nomor #`
- `Tanggal`
- `Kuantitas`
- `Akun Laba Rugi`
- `Lokasi Aset`
- `Catatan`
- `Aset Dijual`

### `Pindah Aset`

- `Nomor #`
- `Tanggal`
- `Keterangan`
- `Alamat Asal`
- `Alamat Tujuan`
- `Detail Aset`

### `Aset per Lokasi`

- kontrol search/select/date sesuai config inquiry
- tabel aset per lokasi

## H. Laporan dan Administrasi Lain

### `Gaji/Tunjangan`

- form:
  - `Nama`
  - `Tipe`
  - `Penghasilan/Potongan`
  - `Akun Beban`
  - `Nonaktif`
- tabel:
  - filter `Tipe`
  - filter `Nonaktif`
  - `Cari...`

### `Daftar Laporan`

- pilih kategori laporan
- `Cari...`

### `Proses Akhir Bulan`

- periode/proses akhir bulan
- pencarian tabel
