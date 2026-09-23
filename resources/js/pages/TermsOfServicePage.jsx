import { Head, Link } from '@inertiajs/react';

export default function TermsOfServicePage({ appName = 'Point of Sale TB NUR', supportEmail = 'zakiram4dhan@gmail.com', lastUpdated = '19 September 2026' }) {
    return (
        <>
            <Head title={`Syarat dan Ketentuan - ${appName}`} />

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
                            className="border-b-2 border-transparent py-3 font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700"
                        >
                            Kebijakan Privasi
                        </Link>
                        <Link
                            href="/terms-of-service"
                            className="border-b-2 border-slate-900 py-3 font-semibold text-slate-900"
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
                                Syarat dan Ketentuan Layanan
                            </h1>
                            <p className="mt-2 text-xs sm:text-sm text-slate-500">
                                Terakhir diperbarui: {lastUpdated}
                            </p>
                        </div>

                        <div className="space-y-8 text-xs sm:text-sm leading-relaxed text-slate-600">
                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    1. Penerimaan Ketentuan
                                </h2>
                                <p>
                                    Dengan mengakses atau menggunakan sistem {appName} (&quot;Layanan&quot;) yang beroperasi di tb-nur.shop, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui bagian mana pun dari ketentuan ini, Anda tidak diperkenankan menggunakan Layanan kami.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    2. Deskripsi Layanan
                                </h2>
                                <p>
                                    {appName} adalah platform digital yang ditujukan untuk pengelolaan kasir (Point of Sale), manajemen inventaris bahan bangunan, pencatatan transaksi penjualan/pembelian, serta administrasi toko TB Nur.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    3. Akun dan Keamanan Kredensial
                                </h2>
                                <p>
                                    Untuk menggunakan Layanan, Anda dapat didaftarkan oleh administrator atau mendaftar secara mandiri melalui email atau akun Google.
                                </p>
                                <div className="space-y-2 pl-4 border-l border-slate-200">
                                    <p>
                                        <span className="font-semibold text-slate-700">a. Kerahasiaan Kredensial:</span> Anda bertanggung jawab penuh untuk menjaga kerahasiaan kata sandi dan sesi login akun Anda.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">b. Tanggung Jawab Aktivitas:</span> Semua transaksi kasir, perubahan stok, dan manipulasi data yang terjadi di bawah akun Anda menjadi tanggung jawab pemilik akun.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">c. Notifikasi Akses Ilegal:</span> Anda wajib segera memberitahukan kepada administrator apabila mencurigai adanya penggunaan akun tanpa izin.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    4. Kewajiban &amp; Batasan Penggunaan
                                </h2>
                                <p>
                                    Dalam menggunakan {appName}, Anda dilarang untuk:
                                </p>
                                <div className="space-y-2 pl-4 border-l border-slate-200">
                                    <p>
                                        <span className="font-semibold text-slate-700">a.</span> Memasukkan data transaksi fiktif atau data palsu yang merugikan operasional toko.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">b.</span> Mencoba merusak integritas sistem, melakukan penetrasi ilegal, atau membobol otentikasi sistem.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">c.</span> Menyalahgunakan integrasi Google OAuth atau mengeksploitasi celah API.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    5. Hak Kekayaan Intelektual
                                </h2>
                                <p>
                                    Seluruh kode sumber, desain grafis, logo, antarmuka pengguna, dan dokumentasi {appName} merupakan hak kekayaan intelektual milik pengembang dan pengelola TB Nur. Pengguna tidak diperkenankan menyalin, memodifikasi, mendistribusikan ulang, atau merekayasa balik (reverse engineer) bagian mana pun dari perangkat lunak ini tanpa izin tertulis.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    6. Batasan Tanggung Jawab
                                </h2>
                                <p>
                                    Layanan ini disediakan sebagaimana adanya (&quot;as is&quot;). Kami terus berupaya menjaga keandalan dan ketersediaan sistem, namun kami tidak bertanggung jawab atas kerugian tidak langsung atau kehilangan data akibat gangguan jaringan internet pengguna atau kelalaian pengelolaan kredensial akun.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    7. Penghentian Layanan
                                </h2>
                                <p>
                                    Kami berhak untuk menangguhkan atau menghentikan akses akun Anda ke Layanan setiap saat apabila ditemukan indikasi pelanggaran terhadap Syarat dan Ketentuan ini atau penyalahgunaan hak akses operasional.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    8. Hukum yang Berlaku
                                </h2>
                                <p>
                                    Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum yang berlaku di Negara Kesatuan Republik Indonesia.
                                </p>
                            </section>

                            <section className="space-y-3 border-t border-slate-200 pt-6">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    9. Pertanyaan dan Bantuan
                                </h2>
                                <p>
                                    Jika Anda memiliki pertanyaan mengenai Syarat dan Ketentuan Layanan ini, silakan hubungi tim kami di:
                                </p>
                                <div className="text-slate-700 space-y-1">
                                    <p><span className="font-semibold">Aplikasi:</span> {appName}</p>
                                    <p><span className="font-semibold">Domain:</span> tb-nur.shop</p>
                                    <p><span className="font-semibold">Email:</span> <a href={`mailto:${supportEmail}`} className="text-slate-900 underline">{supportEmail}</a></p>
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
