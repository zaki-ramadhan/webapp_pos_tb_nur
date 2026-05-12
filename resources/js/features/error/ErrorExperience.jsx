import { AlertTriangle, ArrowLeft, Compass, Home, LifeBuoy, LogIn, RefreshCw, ShieldAlert, TimerReset, TrafficCone, TriangleAlert } from 'lucide-react';

const STATE_BY_STATUS = {
    400: {
        title: 'Permintaan tidak dapat diproses',
        description:
            'Permintaan yang dikirim tidak lengkap atau formatnya tidak sesuai. Coba ulangi dari halaman sebelumnya.',
        tone: 'warning',
        icon: TriangleAlert,
        label: 'Bad Request',
    },
    401: {
        title: 'Akses membutuhkan autentikasi',
        description:
            'Sesi Anda belum dikenali. Masuk kembali agar proses dapat dilanjutkan dengan aman.',
        tone: 'warning',
        icon: LogIn,
        label: 'Unauthorized',
    },
    403: {
        title: 'Akses ke halaman ini dibatasi',
        description:
            'Anda berhasil masuk, tetapi tidak memiliki izin untuk membuka halaman atau aksi yang diminta.',
        tone: 'warning',
        icon: ShieldAlert,
        label: 'Forbidden',
    },
    404: {
        title: 'Halaman tidak ditemukan',
        description:
            'Alamat yang dibuka sudah berubah, tidak tersedia, atau belum pernah dibuat. Gunakan navigasi di bawah agar tidak tersesat.',
        tone: 'danger',
        icon: Compass,
        label: 'Page Not Found',
    },
    405: {
        title: 'Metode akses tidak didukung',
        description:
            'Aksi yang Anda kirim tidak sesuai dengan alur halaman ini. Kembali ke halaman sebelumnya lalu coba lagi.',
        tone: 'warning',
        icon: AlertTriangle,
        label: 'Method Not Allowed',
    },
    409: {
        title: 'Data bertabrakan dengan kondisi terbaru',
        description:
            'Perubahan tidak dapat disimpan karena data sudah berubah atau melanggar batasan sistem. Muat ulang data lalu ulangi.',
        tone: 'danger',
        icon: AlertTriangle,
        label: 'Conflict',
    },
    419: {
        title: 'Sesi telah berakhir',
        description:
            'Untuk menjaga keamanan, sesi Anda telah kedaluwarsa. Muat ulang atau masuk kembali sebelum melanjutkan.',
        tone: 'warning',
        icon: TimerReset,
        label: 'Session Expired',
    },
    429: {
        title: 'Terlalu banyak permintaan',
        description:
            'Sistem menahan permintaan beruntun agar tetap stabil. Tunggu sebentar, lalu coba kembali secara bertahap.',
        tone: 'warning',
        icon: TrafficCone,
        label: 'Too Many Requests',
    },
    500: {
        title: 'Terjadi gangguan pada sistem',
        description:
            'Permintaan Anda sudah sampai ke server, tetapi prosesnya gagal diselesaikan. Muat ulang halaman atau kembali ke beranda.',
        tone: 'danger',
        icon: LifeBuoy,
        label: 'Server Error',
    },
    503: {
        title: 'Layanan sedang dalam pemeliharaan',
        description:
            'Aplikasi sedang disiapkan atau diperbarui. Coba lagi beberapa saat lagi melalui tombol muat ulang.',
        tone: 'warning',
        icon: TrafficCone,
        label: 'Under Maintenance',
    },
};

const TONE_STYLES = {
    warning: {
        glow: 'rgba(184, 93, 32, 0.22)',
        code: '#b85d20',
        badge: 'from-[#fff2df] via-[#f9ddba] to-[#f3c695]',
        icon: 'text-[#b85d20]',
        chip: 'bg-[#fff4e7] text-[#8f4d18] border-[#efcfac]',
        shadow: 'shadow-[0_40px_120px_rgba(184,93,32,0.16)]',
    },
    danger: {
        glow: 'rgba(198, 73, 57, 0.18)',
        code: '#c64939',
        badge: 'from-[#fff0ed] via-[#ffd8cf] to-[#f8b5a5]',
        icon: 'text-[#c64939]',
        chip: 'bg-[#fff1ef] text-[#9f3c31] border-[#efb9b0]',
        shadow: 'shadow-[0_40px_120px_rgba(150,56,45,0.18)]',
    },
};

function resolveState(status, isClientCrash) {
    if (isClientCrash) {
        return {
            title: 'Aplikasi perlu dimuat ulang',
            description:
                'Terjadi crash di sisi browser saat halaman sedang berjalan. Muat ulang halaman untuk memulihkan tampilan terbaru.',
            tone: 'danger',
            icon: RefreshCw,
            label: 'Client Runtime Error',
        };
    }

    if (STATE_BY_STATUS[status]) {
        return STATE_BY_STATUS[status];
    }

    if (status >= 500) {
        return STATE_BY_STATUS[500];
    }

    if (status >= 400) {
        return STATE_BY_STATUS[400];
    }

    return STATE_BY_STATUS[500];
}

function ActionButton({ action }) {
    const baseClassName =
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#b85d20]/30 focus:ring-offset-2 focus:ring-offset-[#f7f0e5]';

    const variantClassName =
        action.variant === 'secondary'
            ? 'border border-[rgba(110,72,43,0.18)] bg-white/88 text-[var(--color-ink)] hover:bg-white'
            : 'border border-transparent bg-[var(--color-accent)] text-white shadow-[0_18px_40px_rgba(184,93,32,0.28)] hover:bg-[#9f4f1a]';

    if (action.href) {
        return (
            <a href={action.href} className={`${baseClassName} ${variantClassName}`}>
                <action.icon className="h-4 w-4" strokeWidth={2.1} />
                <span>{action.label}</span>
            </a>
        );
    }

    return (
        <button type="button" onClick={action.onClick} className={`${baseClassName} ${variantClassName}`}>
            <action.icon className="h-4 w-4" strokeWidth={2.1} />
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
    const toneStyle = TONE_STYLES[state.tone];
    const Icon = state.icon;
    const code = isClientCrash ? 'ERR' : String(status);

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#ebe6de] text-[var(--color-ink)]">
            <div
                className="absolute inset-0 opacity-90"
                style={{
                    background:
                        'radial-gradient(circle at 18% 22%, rgba(255,255,255,0.95), transparent 28%), radial-gradient(circle at 82% 78%, rgba(255,255,255,0.82), transparent 25%), linear-gradient(180deg, #f0ebe4 0%, #e5ddd1 100%)',
                }}
            />
            <div
                className="absolute left-[-12%] top-[14%] h-44 w-44 rounded-full blur-3xl sm:h-60 sm:w-60"
                style={{ backgroundColor: toneStyle.glow }}
            />
            <div
                className="absolute bottom-[8%] right-[-10%] h-48 w-48 rounded-full blur-3xl sm:h-64 sm:w-64"
                style={{ backgroundColor: toneStyle.glow }}
            />

            <div className="relative mx-auto flex min-h-screen w-full max-w-[1680px] items-center justify-center p-4 sm:p-6 md:p-8 xl:p-10">
                <section
                    className={`w-full max-w-[980px] rounded-[28px] border border-white/70 bg-[rgba(255,250,243,0.88)] px-5 py-8 backdrop-blur-xl sm:px-8 sm:py-10 md:px-12 md:py-12 xl:px-16 xl:py-14 ${toneStyle.shadow}`}
                >
                    <div className="mx-auto flex max-w-[760px] flex-col items-center text-center">
                        <div className={`inline-flex items-center rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.26em] sm:text-xs ${toneStyle.chip}`}>
                            {appName}
                        </div>

                        <div className="relative mt-8 sm:mt-10">
                            <div
                                className="text-[84px] font-black leading-none tracking-[-0.08em] sm:text-[122px] lg:text-[170px]"
                                style={{ color: toneStyle.code }}
                            >
                                {code}
                            </div>

                            <div
                                className={`absolute left-1/2 top-1/2 flex h-18 w-18 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[22px] bg-gradient-to-br ${toneStyle.badge} shadow-[0_16px_45px_rgba(47,36,25,0.14)] sm:h-22 sm:w-22 lg:h-24 lg:w-24`}
                            >
                                <Icon className={`h-8 w-8 sm:h-10 sm:w-10 ${toneStyle.icon}`} strokeWidth={2.2} />
                            </div>
                        </div>

                        <h1 className="mt-6 text-[28px] font-extrabold tracking-[-0.03em] text-[var(--color-ink)] sm:text-[34px] lg:text-[42px]">
                            {state.title}
                        </h1>

                        <p className="mt-3 max-w-[640px] text-sm leading-7 text-[var(--color-muted)] sm:text-base">
                            {state.description}
                        </p>

                        <div className="mt-4 inline-flex items-center rounded-full border border-[rgba(110,72,43,0.12)] bg-white/70 px-4 py-2 text-xs font-medium tracking-[0.18em] text-[var(--color-muted)] uppercase">
                            {subtitle ?? state.label}
                        </div>

                        <div className="mt-8 grid w-full gap-3 sm:mt-10 sm:grid-cols-2">
                            {actions.map((action) => (
                                <ActionButton key={action.label} action={action} />
                            ))}
                        </div>

                        <p className="mt-6 text-xs leading-6 text-[var(--color-muted)] sm:text-sm">
                            Jika masalah terus berulang, kembali ke navigasi utama lalu ulangi proses secara bertahap.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
