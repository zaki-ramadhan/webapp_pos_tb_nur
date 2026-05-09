# Indeks Dokumentasi Referensi

Dokumen ini sekarang menjadi pintu masuk untuk referensi proyek yang dipisah berdasarkan topik.

## File Referensi

### Halaman dan Tampilan

- `RINGKASAN_RUTE_DAN_WORKSPACE.md`
  - ringkasan route utama
  - input global dashboard
  - statistik halaman workspace
  - daftar halaman placeholder

- `HALAMAN_WORKSPACE_DAN_INPUT.md`
  - inventaris halaman workspace
  - input per halaman
  - pengelompokan berdasarkan area modul

- `PETA_HALAMAN_ENTITAS_DAN_FITUR.md`
  - peta `halaman -> fitur -> entitas -> komponen`
  - status sudah diterapkan vs placeholder
  - ringkasan total coverage halaman

### Domain dan Data

- `ENTITAS_DAN_RELASI_DOMAIN.md`
  - entitas inti
  - field utama tiap entitas
  - relasi utama antar entitas

- `MATRIKS_RELASI_ENTITAS.md`
  - relasi per entitas yang lebih operasional
  - kaitan entitas dengan halaman
  - daftar kandidat entitas yang sudah muncul di UI tetapi belum formal di domain docs

- `MODUL_DOMAIN_DAN_ATURAN_BISNIS.md`
  - target produk
  - modul inti
  - aturan bisnis penting
  - alur bisnis minimum
  - prioritas MVP

- `KATALOG_FITUR_PRODUK.md`
  - katalog kapabilitas produk
  - kelompok fitur per area bisnis
  - status implementasi tiap area

### Struktur Implementasi

- `INDEKS_KELAS_DAN_KOMPONEN.md`
  - inventaris kelas dan komponen yang benar-benar ada di codebase
  - pengelompokan per layer
  - peta komponen tampilan per modul

## Urutan Baca yang Disarankan

1. `MODUL_DOMAIN_DAN_ATURAN_BISNIS.md`
2. `KATALOG_FITUR_PRODUK.md`
3. `RINGKASAN_RUTE_DAN_WORKSPACE.md`
4. `HALAMAN_WORKSPACE_DAN_INPUT.md`
5. `PETA_HALAMAN_ENTITAS_DAN_FITUR.md`
6. `ENTITAS_DAN_RELASI_DOMAIN.md`
7. `MATRIKS_RELASI_ENTITAS.md`
8. `INDEKS_KELAS_DAN_KOMPONEN.md`

## Cakupan yang Sudah Bisa Dijawab

Dengan set dokumen terbaru, kebutuhan berikut sudah lebih siap dilacak:

- daftar halaman dan input per halaman
- daftar fitur per modul
- entitas inti dan relasi utamanya
- relasi praktis per entitas terhadap halaman
- kelas atau komponen tempat implementasi UI berada
- gap antara halaman yang sudah ada dengan entitas backend yang belum diformalisasi

## Catatan

- `POS_AI_GUIDE.md` tetap menjadi acuan utama untuk instruksi AI dan arah engineering.
- File-file di atas dipisah agar konteks operasional lebih mudah dicari tanpa harus membuka guide utama yang panjang.
- Untuk analisis teknis yang presisi, `PosBlueprint.php` dan `DashboardView.jsx` masih menjadi source of truth utama untuk struktur halaman workspace.
