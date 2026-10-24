import { Head, Link } from '@inertiajs/react';
import BrandMark from '@/features/auth/components/BrandMark';

export default function TermsOfServicePage({
    appName = 'TB Nur POS',
    supportEmail = 'support@tb-nur.shop',
    lastUpdated = '24 September 2026',
}) {
    return (
        <>
            <Head title={`Syarat dan Ketentuan - ${appName}`}>
                <meta name="robots" content="noindex, follow" />
            </Head>

            <div className="min-h-screen bg-slate-50 text-slate-700">
                {/* Header Nav */}
                <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
                        <Link href="/login" className="flex items-center">
                            <BrandMark variant="decorative" />
                        </Link>

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
                            Syarat &amp; Ketentuan
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
                                    1. Ketentuan Umum
                                </h2>
                                <p>
                                    Dengan mengakses atau menggunakan sistem {appName} (&quot;Layanan&quot;) pada situs tb-nur.shop, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Apabila Anda tidak menyetujui ketentuan ini, mohon untuk tidak menggunakan Layanan.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    2. Ruang Lingkup Layanan
                                </h2>
                                <p>
                                    {appName} menyediakan sistem pencatatan operasional kasir (Point of Sale), pengelolaan persediaan bahan bangunan, serta administrasi data pendukung usaha toko TB Nur.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    3. Akun dan Tanggung Jawab Pengguna
                                </h2>
                                <p>
                                    Penggunaan Layanan memerlukan akun pengguna yang sah:
                                </p>
                                <div className="space-y-2 pl-4 border-l border-slate-200">
                                    <p>
                                        <span className="font-semibold text-slate-700">a. Kerahasiaan Akun:</span> Anda bertanggung jawab penuh untuk menjaga kerahasiaan informasi masuk akun Anda.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">b. Tanggung Jawab Aktivitas:</span> Segala pencatatan transaksi dan aktivitas yang berlangsung di bawah akun Anda merupakan tanggung jawab pemilik akun.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">c. Pelaporan:</span> Harap segera memberitahukan kepada pihak pengelola apabila terdapat indikasi penyalahgunaan akun tanpa izin.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    4. Ketentuan Penggunaan yang Wajar
                                </h2>
                                <p>
                                    Dalam menggunakan Layanan, pengguna sepakat untuk tidak:
                                </p>
                                <div className="space-y-2 pl-4 border-l border-slate-200">
                                    <p>
                                        <span className="font-semibold text-slate-700">a.</span> Menggunakan Layanan untuk tujuan yang bertentangan dengan hukum yang berlaku atau merugikan pihak lain.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">b.</span> Memasukkan informasi atau data pencatatan yang tidak benar atau menyesatkan.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">c.</span> Melakukan tindakan yang dapat mengganggu kestabilan, kelancaran, atau integritas sistem Layanan.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">d.</span> Mengakses bagian Layanan di luar batas wewenang atau hak akses yang telah ditentukan.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    5. Hak Kekayaan Intelektual
                                </h2>
                                <p>
                                    Seluruh desain, merek, logo, materi tampilan, dan hak cipta yang terdapat dalam Layanan merupakan hak milik pengelola {appName}. Pengguna dilarang menyalin, mengubah, atau memperbanyak bagian mana pun dari Layanan tanpa izin tertulis sebelumnya.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    6. Batasan Tanggung Jawab
                                </h2>
                                <p>
                                    Layanan disediakan sebagaimana adanya (&quot;as is&quot;). Pengelola berupaya sewajarnya untuk menjaga kelancaran operasional sistem, namun tidak bertanggung jawab atas kerugian tidak langsung yang timbul akibat kendala koneksi internet pengguna atau kelalaian dalam menjaga keamanan informasi akun.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    7. Penangguhan dan Penghentian Layanan
                                </h2>
                                <p>
                                    Pengelola berhak menonaktifkan atau membatasi akses akun pengguna apabila ditemukan pelanggaran terhadap ketentuan dalam dokumen ini atau hal yang dapat merugikan keberlangsungan operasional toko.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    8. Hukum yang Berlaku
                                </h2>
                                <p>
                                    Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan ketentuan hukum yang berlaku di Negara Kesatuan Republik Indonesia.
                                </p>
                            </section>

                            <section className="space-y-3 border-t border-slate-200 pt-6">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    9. Pertanyaan dan Layanan Bantuan
                                </h2>
                                <p>
                                    Jika Anda memiliki pertanyaan mengenai Syarat dan Ketentuan ini, silakan hubungi tim kami di:
                                </p>
                                <div className="text-slate-700 space-y-1">
                                    <p><span className="font-semibold">Layanan:</span> {appName}</p>
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
