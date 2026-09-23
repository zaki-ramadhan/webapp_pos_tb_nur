import { Head, Link } from '@inertiajs/react';

export default function PrivacyPolicyPage({ appName = 'Point of Sale TB NUR', supportEmail = 'zakiram4dhan@gmail.com', lastUpdated = '19 September 2026' }) {
    return (
        <>
            <Head title={`Kebijakan Privasi - ${appName}`} />

            <div className="min-h-screen bg-slate-50 text-slate-700">
                {/* Header Nav */}
                <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
                        <div className="flex items-center gap-3">
                            <img
                                src="/assets/images/logo%20tb%20nur%20new.svg"
                                alt="Logo TB Nur"
                                className="h-7 w-auto"
                            />
                            <span className="text-sm font-semibold text-slate-800 tracking-tight">
                                {appName}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs sm:text-sm">
                            <Link
                                href="/login"
                                className="font-medium text-slate-600 hover:text-slate-900"
                            >
                                Masuk ke Aplikasi
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Sub-header Navigation Tabs */}
                <div className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-4xl gap-6 px-4 sm:px-6 text-xs sm:text-sm">
                        <Link
                            href="/privacy-policy"
                            className="border-b-2 border-slate-900 py-3 font-semibold text-slate-900"
                        >
                            Kebijakan Privasi
                        </Link>
                        <Link
                            href="/terms-of-service"
                            className="border-b-2 border-transparent py-3 font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700"
                        >
                            Syarat dan Ketentuan
                        </Link>
                    </div>
                </div>

                {/* Main Content */}
                <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
                    <div className="border border-slate-200 bg-white p-6 sm:p-10 rounded-sm">
                        <div className="border-b border-slate-200 pb-6 mb-8">
                            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                                Kebijakan Privasi
                            </h1>
                            <p className="mt-2 text-xs sm:text-sm text-slate-500">
                                Terakhir diperbarui: {lastUpdated}
                            </p>
                        </div>

                        <div className="space-y-8 text-xs sm:text-sm leading-relaxed text-slate-600">
                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    1. Pendahuluan
                                </h2>
                                <p>
                                    Kebijakan Privasi ini menjelaskan bagaimana {appName} (&quot;kami&quot;, &quot;aplikasi&quot;) mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi pengguna (&quot;Anda&quot;) saat mengakses layanan Point of Sale (POS) dan sistem manajemen inventaris melalui situs tb-nur.shop.
                                </p>
                                <p>
                                    Kami berkomitmen untuk menjaga kerahasiaan dan keamanan data pribadi Anda sesuai dengan peraturan perundang-undangan perlindungan data yang berlaku serta kebijakan privasi layanan pihak ketiga yang terintegrasi.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    2. Informasi yang Kami Kumpulkan
                                </h2>
                                <p>
                                    Kami mengumpulkan informasi yang diperlukan untuk memastikan operasional sistem kasir dan akun pengguna berjalan secara aman dan akurat:
                                </p>
                                <div className="space-y-2 pl-4 border-l border-slate-200">
                                    <p>
                                        <span className="font-semibold text-slate-700">a. Data Pendaftaran Akun:</span> Nama lengkap, alamat email, nomor telepon, dan kata sandi yang dienkripsi saat Anda mendaftar secara langsung.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">b. Data Akun Google (Google OAuth):</span> Ketika Anda masuk menggunakan tombol Masuk dengan Google, kami menerima identitas profil dasar dari Google Identity Services yang mencakup nama lengkap, alamat email terverifikasi, dan tautan foto profil publik Anda.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">c. Data Operasional &amp; Transaksi:</span> Pencatatan transaksi penjualan, pembaruan stok material bangunan, data pelanggan/supplier toko, dan log aktivitas kasir yang dilakukan di dalam sistem POS.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">d. Data Teknis &amp; Log Perangkat:</span> Alamat IP, jenis peramban web (browser), sistem operasi, dan waktu akses untuk keperluan audit keamanan dan kestabilan sistem.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    3. Penggunaan Informasi
                                </h2>
                                <p>
                                    Informasi yang kami kumpulkan digunakan secara eksklusif untuk tujuan-tujuan berikut:
                                </p>
                                <div className="space-y-2 pl-4 border-l border-slate-200">
                                    <p>
                                        <span className="font-semibold text-slate-700">a. Autentikasi Pengguna:</span> Memverifikasi identitas Anda saat login ke sistem dan mencegah akses yang tidak sah.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">b. Manajemen Hak Akses:</span> Menentukan peran pengguna (seperti Kasir, Admin, atau Pemilik Toko) agar fitur POS dan laporan keuangan terlindungi sesuai wewenang.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">c. Audit dan Riwayat Transaksi:</span> Menautkan setiap transaksi kasir dan mutasi inventaris dengan akun petugas yang bertanggung jawab.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">d. Komunikasi Sistem:</span> Mengirimkan pemberitahuan penting terkait keamanan, reset kata sandi, atau pembaruan operasional sistem POS.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    4. Kepatuhan Kebijakan Data Pengguna Google API
                                </h2>
                                <p>
                                    Penggunaan dan transfer informasi yang diterima oleh {appName} dari Google API ke aplikasi lain akan sepenuhnya mematuhi 
                                    <a
                                        href="https://developers.google.com/terms/api-services-user-data-policy"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-medium text-slate-800 underline ml-1 hover:text-slate-950"
                                    >
                                        Kebijakan Data Pengguna Layanan Google API (Google API Services User Data Policy)
                                    </a>, termasuk persyaratan Penggunaan Terbatas (Limited Use requirements).
                                </p>
                                <p>
                                    Kami hanya meminta cakupan profil dasar (Google Profile &amp; Email) yang mutlak diperlukan untuk otentikasi akun dan tidak meminta akses ke file Google Drive, kontak pribadi, atau data sensitif Google lainnya.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    5. Pembagian dan Pengungkapan Data
                                </h2>
                                <p>
                                    Kami menjunjung tinggi privasi Anda. Kami <span className="font-semibold text-slate-700">tidak menjual, menyewakan, memperdagangkan, atau membagikan</span> informasi pribadi maupun data akun Google Anda kepada pihak ketiga atau pengiklan mana pun.
                                </p>
                                <p>
                                    Data hanya dapat diungkapkan jika diwajibkan secara sah oleh peraturan hukum yang berlaku di Republik Indonesia atas permintaan resmi dari aparat penegak hukum.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    6. Keamanan &amp; Penyimpanan Data
                                </h2>
                                <p>
                                    Semua data ditransmisikan menggunakan protokol enkripsi standar industri HTTPS/TLS. Kata sandi akun disimpan dalam bentuk hash yang aman (tidak dapat dibaca dalam bentuk teks biasa). Akses ke basis data server dilindungi dengan otentikasi berlapis dan hanya dapat diakses oleh administrator sistem yang berwenang.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    7. Retensi dan Penghapusan Data (Data Deletion)
                                </h2>
                                <p>
                                    Kami menyimpan data akun selama akun Anda berstatus aktif dalam sistem {appName}.
                                </p>
                                <p>
                                    Jika Anda ingin menghapus akun Anda beserta seluruh data pribadi yang tersimpan, Anda dapat mengirimkan permohonan penghapusan data secara tertulis ke email dukungan kami di <span className="font-semibold text-slate-800">{supportEmail}</span>. Kami akan memproses verifikasi dan menghapus data akun dalam waktu maksimal 7 hari kerja.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    8. Perubahan Kebijakan Privasi
                                </h2>
                                <p>
                                    Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu untuk menyesuaikan perkembangan fitur layanan atau kepatuhan regulasi hukum. Tanggal pembaruan terakhir akan selalu dicantumkan di bagian atas halaman ini.
                                </p>
                            </section>

                            <section className="space-y-3 border-t border-slate-200 pt-6">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    9. Kontak dan Layanan Dukungan
                                </h2>
                                <p>
                                    Apabila Anda memiliki pertanyaan, keluhan, atau permohonan terkait Kebijakan Privasi dan pengelolaan data Anda, silakan hubungi kami melalui:
                                </p>
                                <div className="text-slate-700 space-y-1">
                                    <p><span className="font-semibold">Aplikasi:</span> {appName}</p>
                                    <p><span className="font-semibold">Domain:</span> tb-nur.shop</p>
                                    <p><span className="font-semibold">Email Dukungan:</span> <a href={`mailto:${supportEmail}`} className="text-slate-900 underline">{supportEmail}</a></p>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-xs text-slate-400">
                        <p>&copy; 2026 {appName}. Hak cipta dilindungi undang-undang.</p>
                    </div>
                </main>
            </div>
        </>
    );
}
