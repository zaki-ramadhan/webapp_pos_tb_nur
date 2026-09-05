import { useEffect } from 'react';
import { AlertTriangle, ArrowLeft, Compass, Home, LifeBuoy, LogIn, RefreshCw, ShieldAlert, TimerReset, TrafficCone, TriangleAlert } from 'lucide-react';

const STATE_BY_STATUS = {
    400: {
        title: 'Permintaan tidak sesuai',
        description: 'Data yang dikirim belum lengkap atau tidak valid. Silakan periksa kembali.',
        tone: 'warning',
        icon: TriangleAlert,
    },
    401: {
        title: 'Silakan masuk terlebih dahulu',
        description: 'Anda perlu masuk (login) untuk membuka halaman ini.',
        tone: 'warning',
        icon: LogIn,
    },
    403: {
        title: 'Akses terbatas',
        description: 'Akun Anda belum memiliki izin membuka menu ini. Hubungi pemilik toko jika butuh akses.',
        tone: 'warning',
        icon: ShieldAlert,
    },
    404: {
        title: 'Halaman tidak ditemukan',
        description: 'Alamat yang Anda tuju salah atau telah dipindahkan.',
        tone: 'danger',
        icon: Compass,
    },
    405: {
        title: 'Aksi tidak dapat diproses',
        description: 'Aksi yang diminta tidak valid atau telah kedaluwarsa.',
        tone: 'warning',
        icon: AlertTriangle,
    },
    409: {
        title: 'Data telah berubah',
        description: 'Data telah diperbarui oleh proses lain. Muat ulang halaman untuk melihat data terkini.',
        tone: 'danger',
        icon: AlertTriangle,
    },
    419: {
        title: 'Sesi telah berakhir',
        description: 'Waktu sesi Anda telah habis. Silakan muat ulang atau masuk kembali.',
        tone: 'warning',
        icon: TimerReset,
    },
    429: {
        title: 'Terlalu banyak aktivitas',
        description: 'Mohon tunggu beberapa saat sebelum mencoba kembali.',
        tone: 'warning',
        icon: TrafficCone,
    },
    500: {
        title: 'Terjadi kendala sistem',
        description: 'Layanan sedang mengalami gangguan sementara. Silakan coba beberapa saat lagi.',
        tone: 'danger',
        icon: LifeBuoy,
    },
    503: {
        title: 'Pemeliharaan sistem',
        description: 'Aplikasi sedang dalam proses pembaruan. Silakan coba beberapa saat lagi.',
        tone: 'warning',
        icon: TrafficCone,
    },
};

function resolveState(status, isClientCrash) {
    if (isClientCrash) {
        return {
            title: 'Halaman perlu dimuat ulang',
            description: 'Terjadi kendala saat menampilkan halaman. Silakan muat ulang browser Anda.',
            tone: 'danger',
            icon: RefreshCw,
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
        : 'border border-ink bg-ink text-white hover:bg-slate-800 shadow-sm';

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
    technicalMessage = null,
    isDevOrStaging = false,
}) {
    const state = resolveState(status, isClientCrash);
    const code = String(status);

    useEffect(() => {
        if (isDevOrStaging || technicalMessage) {
            console.error(`[Aplikasi TB Nur - Error ${code}]`, {
                status: Number(code),
                title: state.title,
                description: state.description,
                path: typeof window !== 'undefined' ? window.location.pathname : '',
                technicalDetail: technicalMessage || null,
                timestamp: new Date().toISOString(),
            });
        }
    }, [code, state.title, state.description, technicalMessage, isDevOrStaging]);

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-ui-bg-panel-lighter p-4 sm:p-6 lg:p-8 text-ink overflow-hidden">
            {/* Background ornament circles */}
            <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
                <div className="absolute -left-[20vw] -top-[20vw] h-[60vw] w-[60vw] max-h-[700px] max-w-[700px] rounded-full border border-slate-200/40" />
                <div className="absolute -right-[20vw] -bottom-[20vw] h-[60vw] w-[60vw] max-h-[700px] max-w-[700px] rounded-full border border-slate-200/40" />
            </div>

            {/* Ghost status code — top-left */}
            <div className="pointer-events-none absolute left-0 top-0 select-none opacity-[0.04] leading-none z-0" aria-hidden="true">
                <span className="text-[30vw] sm:text-[28vw] font-serif font-semibold text-slate-400 tracking-[-0.06em] translate-x-[-15%] translate-y-[-40%] inline-block blur-[3px]">
                    {code}
                </span>
            </div>

            {/* Ghost status code — bottom-right */}
            <div className="pointer-events-none absolute right-0 bottom-0 select-none opacity-[0.04] leading-none z-0" aria-hidden="true">
                <span className="text-[30vw] sm:text-[28vw] font-serif font-semibold text-slate-400 tracking-[-0.06em] translate-x-[15%] translate-y-[40%] inline-block blur-[3px]">
                    {code}
                </span>
            </div>

            <section className="relative z-10 w-full max-w-sm sm:max-w-md rounded-lg border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col items-center text-center">
                    <div className="relative mt-1 mb-4 sm:mb-5 flex items-center justify-center">
                        <span className="text-7xl sm:text-8xl font-serif font-semibold tracking-normal text-slate-900 select-none">
                            {code}
                        </span>
                    </div>

                    <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900">
                        {state.title}
                    </h1>

                    <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                        {state.description}
                    </p>

                    {subtitle && (
                        <div className="mt-4 inline-flex text-xs tracking-wider text-slate-400 uppercase border border-slate-100 bg-slate-50/30 px-2 py-0.5 rounded">
                            {subtitle}
                        </div>
                    )}

                    <div className="mt-5 sm:mt-6 flex w-full flex-col gap-2">
                        {actions.map((action) => (
                            <ActionButton key={action.label} action={action} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
