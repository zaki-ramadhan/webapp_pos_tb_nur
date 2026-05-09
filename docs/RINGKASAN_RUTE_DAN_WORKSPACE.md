# UI Routes and Workspace Overview

Dokumen ini merangkum route utama, input global dashboard, dan status umum halaman workspace.

## Route Utama

### `/` - Login

- `Bahasa`
- `Email atau No Handphone`
- `Password`

### `/register` - Register

- `Bahasa`
- `Nama Lengkap`
- `Email`
- `No Handphone`
- `Password`
- checkbox persetujuan `Syarat & Ketentuan` dan `Kebijakan Privasi`

### `/dashboard/{sample?}` - Workspace Demo

- parameter `sample`
  - `retail`
  - `trade-portal`
  - `manufacture`

## Input Global di Dashboard

### Modal pencarian menu

- `Cari...`

### Modal tambah/ubah dashboard

- `Nama Dashboard`

### Modal widget

- `Ketik kata kunci`

## Ringkasan Workspace

- Total route utama: `3`
- Total halaman workspace di blueprint: `96`
- Halaman dengan input global dashboard:
  - login
  - register
  - dashboard
  - modal cari menu
  - modal dashboard
  - modal widget

## Halaman Placeholder / Belum Ada Input Konten

Halaman berikut sudah ada di navigasi, tetapi area kontennya masih placeholder sehingga belum punya input form khusus:

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

## Status Implementasi Singkat

- Halaman workspace yang sudah punya implementasi konten nyata:
  - master data
  - transaksi penjualan
  - transaksi pembelian
  - stok
  - aset
  - laporan
  - beberapa inquiry

- Halaman yang masih placeholder:
  - area SmartLink
  - e-Faktur
  - beberapa report pajak
  - kalender
  - analisa AI
