import { Head, usePage } from '@inertiajs/react';

export default function AppLayout({ children, title = 'Workspace' }) {
    const { app } = usePage().props;
    const appName = app?.name ?? 'TB Nur POS';

    return (
        <>
            <Head title={title || appName} />

            <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(222,146,72,0.18),transparent_28%),linear-gradient(180deg,#fffaf3_0%,#fff8ef_48%,#f3ece1_100%)]">
                <header className="border-b border-[color:var(--color-line)] bg-white/70 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                                {appName}
                            </p>
                            <h1 className="mt-1 text-lg font-semibold text-[var(--color-ink)]">
                                Workspace Operasional TB Nur POS
                            </h1>
                        </div>

                        <div className="rounded-full border border-[color:var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-sm text-[var(--color-muted)]">
                            Root docs: <span className="font-medium text-[var(--color-ink)]">POS_AI_GUIDE.md</span>
                        </div>
                    </div>
                </header>

                <main>{children}</main>
            </div>
        </>
    );
}
