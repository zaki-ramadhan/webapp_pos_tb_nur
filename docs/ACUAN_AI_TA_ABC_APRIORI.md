# Acuan AI Tugas Akhir: Analisis ABC dan Apriori

Dokumen ini dipakai sebagai acuan saat perlu memulai ulang percakapan dengan AI dari nol, tanpa kehilangan konteks utama tugas akhir pada aplikasi POS ini.

## Konteks Singkat

- Proyek: aplikasi POS pada folder `webapp`
- Tujuan tugas akhir: menerapkan `algoritma Apriori` dan `analisis ABC` ke dalam aplikasi
- Harapan: fitur tidak hanya dihitung, tetapi juga terintegrasi ke aplikasi dalam bentuk halaman, proses, dan hasil analisis yang bisa dipakai

## Yang Diharapkan Dari AI

Jika diminta membantu tugas akhir ini, AI diharapkan mengerjakan hal-hal berikut:

1. Menganalisis struktur data aplikasi
- cek data transaksi penjualan
- cek detail item per transaksi
- cek data barang, kategori, stok, harga, dan data pendukung lain
- tentukan data mana yang bisa dipakai untuk ABC dan Apriori

2. Menerapkan analisis ABC
- kelompokkan barang ke kategori `A`, `B`, dan `C`
- dasar analisis bisa dari:
  - nilai penjualan
  - frekuensi penjualan
  - nilai persediaan
- tampilkan hasil analisis ke dalam aplikasi

3. Menerapkan algoritma Apriori
- cari pola barang yang sering dibeli bersama
- hitung `support`
- hitung `confidence`
- hasilkan `association rules`

4. Integrasi ke aplikasi
- buat atau tempatkan fitur pada halaman yang sesuai
- sediakan filter periode bila diperlukan
- tampilkan hasil perhitungan dalam tabel/laporan
- jika relevan, sediakan tombol proses analisis

5. Validasi
- pastikan logika perhitungan benar
- cocokkan hasil dengan data transaksi yang ada
- pastikan implementasi dapat dipakai sebagai bahan tugas akhir

## Ringkasan Sederhana

Kalau dijelaskan singkat:

`AI harus mengecek struktur data POS ini, lalu menambahkan fitur analisis ABC dan Apriori, kemudian menampilkan hasilnya di aplikasi.`

## Preferensi Cara AI Menjawab

Saat diminta menjelaskan rencana kerja, jawaban yang diinginkan:

- singkat
- sederhana
- langsung ke inti
- tidak terlalu panjang

## Prompt Siap Pakai

Gunakan prompt ini jika ingin memulai ulang dari awal:

```text
Saya sedang mengerjakan tugas akhir pada aplikasi POS di folder webapp.
Saya ingin menerapkan analisis ABC dan algoritma Apriori ke dalam aplikasi ini.

Tolong bantu saya dengan alur kerja berikut:
1. cek dulu struktur data yang sudah ada
2. tentukan data yang bisa dipakai untuk analisis ABC dan Apriori
3. rancang implementasi fitur di aplikasi
4. jika memungkinkan, langsung kerjakan implementasinya
5. jelaskan langkah yang akan dikerjakan dengan sederhana dan singkat

Tujuan saya: hasil analisis ABC dan Apriori terintegrasi ke aplikasi, bukan hanya teori.
```

## Prompt Versi Sangat Singkat

```text
Saya ingin menambahkan analisis ABC dan algoritma Apriori ke aplikasi POS ini untuk tugas akhir.
Tolong cek data yang tersedia, rancang fitur yang cocok, lalu bantu implementasikan ke aplikasi.
Jelaskan rencananya dengan singkat dan sederhana.
```

## Catatan Tambahan

- Jika percakapan dimulai ulang, arahkan AI untuk membaca codebase dulu sebelum memberi kesimpulan
- Utamakan implementasi yang sesuai struktur aplikasi yang sudah ada
- Hindari solusi teori murni yang tidak menyatu dengan aplikasi
