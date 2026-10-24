import { Head, Link } from '@inertiajs/react';
import BrandMark from '@/features/auth/components/BrandMark';

export default function PrivacyPolicyPage({
    appName = 'TB Nur POS',
    supportEmail = 'support@tb-nur.shop',
    lastUpdated = '24 September 2026',
}) {
    return (
        <>
            <Head title={`Kebijakan Privasi - ${appName}`}>
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
                            className="border-b-2 border-slate-900 py-3 font-semibold text-slate-900"
                        >
                            Kebijakan Privasi
                        </Link>
                        <Link
                            href="/terms-of-service"
                            className="border-b-2 border-transparent py-3 font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700"
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
                                    Kebijakan Privasi ini menjelaskan bagaimana {appName} (&quot;kami&quot;) mengumpulkan, menggunakan, dan melindungi informasi saat Anda mengakses layanan Point of Sale (POS) dan operasional toko melalui situs tb-nur.shop.
                                </p>
                                <p>
                                    Kami berkomitmen untuk menjaga privasi serta melindungi informasi pengguna sesuai dengan prinsip dan peraturan perlindungan data yang berlaku di Indonesia.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    2. Informasi yang Dikumpulkan
                                </h2>
                                <p>
                                    Kami mengumpulkan informasi yang diperlukan untuk mendukung fungsi operasional dan layanan akun secara wajar:
                                </p>
                                <div className="space-y-2 pl-4 border-l border-slate-200">
                                    <p>
                                        <span className="font-semibold text-slate-700">a. Informasi Akun:</span> Nama, alamat email, nomor telepon, dan data autentikasi yang Anda berikan saat pendaftaran atau pengelolaan akun.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">b. Informasi Masuk Pihak Ketiga:</span> Apabila Anda menggunakan opsi masuk melalui akun pihak ketiga (seperti Google), kami menerima informasi profil dasar (nama, alamat email terverifikasi, dan foto profil) yang Anda setujui untuk proses verifikasi identitas.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">c. Data Operasional:</span> Informasi pencatatan transaksi toko, inventaris, dan data terkait aktivitas kasir yang dimasukkan dalam operasional harian.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">d. Informasi Teknis Umum:</span> Informasi standar perangkat dan peramban (browser) yang umum terekam saat mengakses situs guna memastikan ketersediaan dan kestabilan layanan.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    3. Penggunaan Informasi
                                </h2>
                                <p>
                                    Informasi yang dikumpulkan digunakan secara wajar untuk keperluan berikut:
                                </p>
                                <div className="space-y-2 pl-4 border-l border-slate-200">
                                    <p>
                                        <span className="font-semibold text-slate-700">a. Pengelolaan Layanan:</span> Memfasilitasi akses akun, fitur kasir, dan fungsi operasional toko.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">b. Pemrosesan Data:</span> Mendukung keakuratan pencatatan transaksi dan pelaporan operasional toko.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">c. Komunikasi &amp; Dukungan:</span> Mengirimkan pemberitahuan penting terkait akun serta merespons permohonan bantuan dari pengguna.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    4. Kepatuhan Kebijakan Data Pengguna Google
                                </h2>
                                <p>
                                    Penggunaan informasi yang diterima oleh {appName} dari Google API tunduk pada{' '}
                                    <a
                                        href="https://developers.google.com/terms/api-services-user-data-policy"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-medium text-slate-800 underline hover:text-slate-950"
                                    >
                                        Kebijakan Data Pengguna Layanan Google API (Google API Services User Data Policy)
                                    </a>
                                    , termasuk kepatuhan terhadap ketentuan Penggunaan Terbatas (Limited Use).
                                </p>
                                <p>
                                    Kami hanya mengakses informasi profil dasar yang diperlukan untuk keperluan masuk pengguna dan tidak meminta akses ke berkas atau data pribadi lain di luar kebutuhan tersebut.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    5. Perlindungan dan Pembagian Informasi
                                </h2>
                                <p>
                                    Kami menghargai privasi pengguna. Kami <span className="font-semibold text-slate-700">tidak menjual, menyewakan, atau membagikan</span> informasi pribadi pengguna kepada pihak ketiga atau pengiklan.
                                </p>
                                <p>
                                    Informasi hanya dapat dibuka apabila diwajibkan secara sah oleh peraturan perundang-undangan yang berlaku atas permintaan resmi dari pihak berwenang.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    6. Keamanan Data
                                </h2>
                                <p>
                                    Kami menerapkan langkah-langkah pengamanan teknis dan organisasional yang wajar dan sesuai standar industri guna melindungi informasi pengguna dari akses tanpa hak, pengubahan, kehilangan, atau pengungkapan yang tidak sah.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    7. Penyimpanan dan Penghapusan Data
                                </h2>
                                <p>
                                    Informasi akun disimpan selama akun aktif dan digunakan untuk kebutuhan operasional layanan. Pengguna berhak mengajukan permohonan pembaruan atau penghapusan data akun dengan menghubungi alamat email dukungan kami.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    8. Perubahan Kebijakan
                                </h2>
                                <p>
                                    Kebijakan Privasi ini dapat ditinjau dan diperbarui sewaktu-waktu sesuai perkembangan layanan. Setiap perubahan akan dicantumkan pada halaman ini dengan tanggal pembaruan terbaru.
                                </p>
                            </section>

                            <section className="space-y-3 border-t border-slate-200 pt-6">
                                <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                                    9. Kontak dan Layanan Bantuan
                                </h2>
                                <p>
                                    Apabila Anda memiliki pertanyaan terkait Kebijakan Privasi ini, silakan hubungi kami melalui:
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
