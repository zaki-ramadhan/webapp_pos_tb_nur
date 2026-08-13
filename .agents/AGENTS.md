# Workspace Rules

- Jangan melakukan git commit atau push kecuali jika diperintahkan langsung secara spesifik oleh user. Jangan menawarkan atau meminta konfirmasi untuk melakukan commit/push.
- Ketika membuat atau memperbarui Rencana Implementasi (Implementation Plan), langsung lanjutkan to-the-point tanpa meminta persetujuan/review dari user, kecuali jika secara eksplisit diminta.
- Terapkan konsep DRY (Don't Repeat Yourself), SOLID, dan Clean Code yang ketat ala senior developer.
- Prioritaskan modularitas, kode yang reusable, mudah dibaca, serta penggunaan template/komponen/utilitas global untuk meminimalkan pengulangan logika.
- Hindari komentar inline yang berlebihan; pertahankan dokumentasi tetap minimal, ringkas, dan fokus pada penjelasan logika kompleks saja.
- Selalu jalankan `composer run dev` (di dalam folder `webapp`) untuk memulai server development/Vite, jangan gunakan `npm run dev`.
- **Gaya Komunikasi:** Jawab secara to-the-point, ringkas, dan langsung pada inti teknis tanpa penjelasan bertele-tele.
- **Responsivitas Krusial:** Semua modifikasi/pembuatan UI wajib mendukung penuh aspek responsif (mobile-first) secara nyata di berbagai ukuran layar.
- **Validasi Nyata (Anti Asal Claim):** Wajib melakukan audit kode secara menyeluruh pada file-file terkait sebelum mengklaim alur data, responsivitas, atau penyelesaian tugas.
- **Optimalisasi Token Respon:**
  * Gunakan format git diff pendek atau sebutkan baris kode spesifik saja yang berubah saat menampilkan revisi kode; jangan salin ulang seluruh file.
  * Hilangkan basa-basi pembuka/penutup, permohonan maaf saat terjadi error, dan penjelasan teoretis kode jika tidak diminta.
  * Gunakan tautan file GFM (GitHub Flavored Markdown) format `[basename](file:///path)` untuk merujuk file agar lebih ringkas.
- **Filosofi Ponytail (Anti Over-Engineering):**
  * Wajib meneliti dan menggunakan komponen UI serta utilitas global yang sudah terinstal/tersedia di projek (misal: `AccountLookupField`, `TextInput` terformat, helper `formatAmountInput`) sebelum membuat logic/komponen baru.
  * Hindari penambahan library NPM/Composer baru kecuali jika sangat mendesak dan disetujui user.
  * Terapkan YAGNI secara ketat: buat solusi dengan jumlah baris kode dan abstraksi seminimal mungkin yang terbukti bekerja secara fungsional.

- **Efisiensi Token Proyek (Token & Credit Saving):**
  * Setiap kali memulai sesi baru atau ketika menganalisis komponen baru, jalankan `python tools/map_project.py --summary` terlebih dahulu untuk melihat gambaran umum struktur kode proyek secara hemat token.
  * Gunakan perintah `python tools/map_project.py --find <keyword>` untuk melakukan pencarian instan pada Class, Method, atau Component React yang relevan sebelum membuka berkas kode secara manual.
  * Skrip ini memiliki fitur *self-healing* yang otomatis mendeteksi perubahan file di repositori dan menyegarkan peta proyek secara dinamis.
