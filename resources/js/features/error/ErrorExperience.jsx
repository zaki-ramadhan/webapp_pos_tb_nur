import { AlertTriangle, ArrowLeft, Compass, Home, LifeBuoy, LogIn, RefreshCw, ShieldAlert, TimerReset, TrafficCone, TriangleAlert } from 'lucide-react';

const STATE_BY_STATUS = {
    400: {
        title: 'Permintaan tidak dapat diproses',
        description: 'Permintaan yang dikirim tidak lengkap atau formatnya tidak sesuai. Coba ulangi dari halaman sebelumnya.',
        tone: 'warning',
        icon: TriangleAlert,
        label: 'Bad Request',
    },
    401: {
        title: 'Akses membutuhkan autentikasi',
        description: 'Sesi Anda belum dikenali. Masuk kembali agar proses dapat dilanjutkan dengan aman.',
        tone: 'warning',
        icon: LogIn,
        label: 'Unauthorized',
    },
    403: {
        title: 'Akses ke halaman ini dibatasi',
        description: 'Anda berhasil masuk, tetapi tidak memiliki izin untuk membuka halaman atau aksi yang diminta.',
        tone: 'warning',
        icon: ShieldAlert,
        label: 'Forbidden',
    },
    404: {
        title: 'Halaman tidak ditemukan',
        description: 'Alamat yang dibuka sudah berubah, tidak tersedia, atau belum pernah dibuat. Gunakan navigasi di bawah agar tidak tersesat.',
        tone: 'danger',
        icon: Compass,
        label: 'Page Not Found',
    },
    405: {
        title: 'Metode akses tidak didukung',
        description: 'Aksi yang Anda kirim tidak sesuai dengan alur halaman ini. Kembali ke halaman sebelumnya lalu coba lagi.',
        tone: 'warning',
        icon: AlertTriangle,
        label: 'Method Not Allowed',
    },
    409: {
        title: 'Data bertabrakan dengan kondisi terbaru',
        description: 'Perubahan tidak dapat disimpan karena data sudah berubah atau melanggar batasan sistem. Muat ulang data lalu ulangi.',
        tone: 'danger',
        icon: AlertTriangle,
        label: 'Conflict',
    },
    419: {
        title: 'Sesi telah berakhir',
        description: 'Untuk menjaga keamanan, sesi Anda telah kedaluwarsa. Muat ulang atau masuk kembali sebelum melanjutkan.',
        tone: 'warning',
        icon: TimerReset,
        label: 'Session Expired',
    },
    429: {
        title: 'Terlalu banyak permintaan',
        description: 'Sistem menahan permintaan beruntun agar tetap stabil. Tunggu sebentar, lalu coba kembali secara bertahap.',
        tone: 'warning',
        icon: TrafficCone,
        label: 'Too Many Requests',
    },
    500: {
        title: 'Terjadi gangguan pada sistem',
        description: 'Permintaan Anda sudah sampai ke server, tetapi prosesnya gagal diselesaikan. Muat ulang halaman atau kembali ke beranda.',
        tone: 'danger',
        icon: LifeBuoy,
        label: 'Server Error',
    },
    503: {
        title: 'Layanan sedang dalam pemeliharaan',
        description: 'Aplikasi sedang disiapkan atau diperbarui. Coba lagi beberapa saat lagi melalui tombol muat ulang.',
        tone: 'warning',
        icon: TrafficCone,
        label: 'Under Maintenance',
    },
};

function resolveState(status, isClientCrash) {
    if (isClientCrash) {
        return {
            title: 'Aplikasi perlu dimuat ulang',
            description: 'Terjadi crash di sisi browser saat halaman sedang berjalan. Muat ulang halaman untuk memulihkan tampilan terbaru.',
            tone: 'danger',
            icon: RefreshCw,
            label: 'Client Runtime Error',
        };
    }

    if (STATE_BY_STATUS[status]) return STATE_BY_STATUS[status];
    if (status >= 500) return STATE_BY_STATUS[500];
    if (status >= 400) return STATE_BY_STATUS[400];
    return STATE_BY_STATUS[500];
}

function ActionButton({ action }) {
    const base = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:ring-offset-2 w-full';
    const variant = action.variant === 'secondary'
        ? 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm'
        : 'border border-[#2f2419] bg-[#2f2419] text-white hover:bg-slate-800 shadow-sm';

    if (action.href) {
        return (
            <a href={action.href} className={`${base} ${variant}`}>
                <action.icon className="h-3.5 w-3.5" strokeWidth={2} />
                <span>{action.label}</span>
            </a>
        );
    }

    return (
        <button type="button" onClick={action.onClick} className={`${base} ${variant}`}>
            <action.icon className="h-3.5 w-3.5" strokeWidth={2} />
            <span>{action.label}</span>
        </button>
    );
}

export function buildErrorActions({ hasAuthSession = false, status = 500, fallbackHref = '/' }) {
    const primaryHref = hasAuthSession ? '/dashboard' : '/';
    const loginHref = '/';

    if (status === 401) {
        return [
            { label: 'Masuk Sekarang', href: loginHref, variant: 'primary', icon: LogIn },
            { label: 'Ke Beranda', href: '/', variant: 'secondary', icon: Home },
        ];
    }

    if (status === 419) {
        return [
            { label: 'Muat Ulang', onClick: () => window.location.reload(), variant: 'primary', icon: RefreshCw },
            { label: hasAuthSession ? 'Masuk Ulang' : 'Ke Beranda', href: hasAuthSession ? loginHref : '/', variant: 'secondary', icon: hasAuthSession ? LogIn : Home },
        ];
    }

    if (status === 503 || status >= 500) {
        return [
            { label: 'Muat Ulang', onClick: () => window.location.reload(), variant: 'primary', icon: RefreshCw },
            { label: hasAuthSession ? 'Ke Dashboard' : 'Ke Beranda', href: primaryHref, variant: 'secondary', icon: hasAuthSession ? Compass : Home },
        ];
    }

    return [
        { label: hasAuthSession ? 'Ke Dashboard' : 'Ke Beranda', href: primaryHref, variant: 'primary', icon: hasAuthSession ? Compass : Home },
        { label: 'Kembali', onClick: () => (window.history.length > 1 ? window.history.back() : (window.location.href = fallbackHref)), variant: 'secondary', icon: ArrowLeft },
    ];
}

export default function ErrorExperience({
    status = 500,
    appName = 'TB Nur POS',
    subtitle,
    actions = [],
    isClientCrash = false,
}) {
    const state = resolveState(status, isClientCrash);
    const Icon = state.icon;
    const code = String(status);

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-[#faf9f6] p-4 sm:p-6 lg:p-8 text-[#2f2419] overflow-hidden">
            {/* Background ornament circles — fluid via vw so they scale on all viewports */}
            <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
                <div className="absolute -left-[20vw] -top-[20vw] h-[60vw] w-[60vw] max-h-[700px] max-w-[700px] rounded-full border border-slate-200/40" />
                <div className="absolute -right-[20vw] -bottom-[20vw] h-[60vw] w-[60vw] max-h-[700px] max-w-[700px] rounded-full border border-slate-200/40" />
            </div>

            {/* Ghost status code — top-left */}
            <div className="pointer-events-none absolute left-0 top-0 select-none opacity-[0.04] leading-none z-0" aria-hidden="true">
                <span className="text-[30vw] sm:text-[28vw] font-serif font-black text-slate-400 tracking-[-0.06em] translate-x-[-15%] translate-y-[-40%] inline-block blur-[3px]">
                    {code}
                </span>
            </div>

            {/* Ghost status code — bottom-right */}
            <div className="pointer-events-none absolute right-0 bottom-0 select-none opacity-[0.04] leading-none z-0" aria-hidden="true">
                <span className="text-[30vw] sm:text-[28vw] font-serif font-black text-slate-400 tracking-[-0.06em] translate-x-[15%] translate-y-[40%] inline-block blur-[3px]">
                    {code}
                </span>
            </div>

            <section className="relative z-10 w-full max-w-sm sm:max-w-md rounded-lg border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col items-center text-center">
                    <div className="relative mt-1 mb-4 sm:mb-5 flex items-center justify-center">
                        <span className="text-7xl sm:text-8xl font-serif font-extrabold tracking-normal text-slate-900 select-none">
                            {code}
                        </span>
                    </div>

                    <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                        {state.title}
                    </h1>

                    <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                        {state.description}
                    </p>

                    {subtitle && (
                        <div className="mt-4 inline-flex font-mono text-xs tracking-wider text-slate-400 uppercase border border-slate-100 bg-slate-50/30 px-2 py-0.5 rounded">
                            {subtitle}
                        </div>
                    )}

                    <div className="mt-5 sm:mt-6 flex w-full flex-col gap-2">
                        {actions.map((action) => (
                            <ActionButton key={action.label} action={action} />
                        ))}
                    </div>

                    <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                        Jika masalah berlanjut, hubungi administrator atau muat ulang halaman ini secara bertahap.
                    </p>
                </div>
            </section>
        </div>
    );
}
