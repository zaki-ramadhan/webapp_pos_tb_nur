import { useEffect, useRef, useState } from 'react';

import DashboardTopBar from '@/features/workspace/dashboard/DashboardTopBar';
import DashboardView from '@/features/workspace/dashboard/DashboardView';
import WorkspaceLayout from '@/layouts/WorkspaceLayout';

export default function DashboardPage({ dashboard, widgets }) {
    const topBarRef = useRef(null);
    const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
    const [topbarHeight, setTopbarHeight] = useState(0);


    const user = dashboard.user;
    const isUnapprovedUser = user && user.hasAccessGroup === false && !user.isSuperAdmin;

    useEffect(() => {
        if (!topBarRef.current) {
            return undefined;
        }

        function updateTopbarHeight() {
            setTopbarHeight(topBarRef.current?.getBoundingClientRect().height ?? 0);
        }

        updateTopbarHeight();

        const observer = new ResizeObserver(() => {
            updateTopbarHeight();
        });

        observer.observe(topBarRef.current);
        window.addEventListener('resize', updateTopbarHeight);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateTopbarHeight);
        };
    }, []);

    return (
        <WorkspaceLayout title={dashboard.sample.label}>
            <div className="flex h-screen flex-col overflow-hidden relative">
                <div ref={topBarRef} className="fixed inset-x-0 top-0 z-50">
                    <DashboardTopBar
                        contextLabel={dashboard.headerContextLabel}
                        user={dashboard.user}
                        workspaceMenuOpen={isWorkspaceMenuOpen}
                        onToggleWorkspaceMenu={() => setIsWorkspaceMenuOpen((currentValue) => !currentValue)}
                    />
                </div>

                <main
                    className="flex min-h-0 flex-1 bg-tab-active-bg relative"
                    style={topbarHeight ? { paddingTop: `${topbarHeight}px` } : undefined}
                >
                    {isUnapprovedUser ? (
                        <div className="flex flex-1 items-center justify-center p-6 bg-slate-50">
                            <div className="w-full max-w-md rounded-xl border border-amber-200 bg-white p-6 shadow-xl text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-8 w-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-bold text-slate-800 mb-1">
                                    Akun Terdaftar · Menunggu Akses
                                </h2>
                                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                    Halo, <span className="font-semibold text-slate-700">{user.name}</span> ({user.email}). Akun Anda berhasil terdaftar dengan aman.
                                </p>
                                <div className="rounded-lg bg-amber-50 p-3.5 text-xs text-amber-800 text-left border border-amber-200/60 leading-relaxed mb-5">
                                    <span className="font-semibold block mb-0.5">Akses Belum Aktif</span>
                                    Untuk keamanan toko, akun baru tidak diberi hak akses secara otomatis. Silakan hubungi Pemilik Toko (Owner) untuk menyetujui dan memberikan Hak Akses ke akun ini.
                                </div>
                                <a
                                    href="/logout"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const form = document.createElement('form');
                                        form.method = 'POST';
                                        form.action = '/logout';
                                        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                                        if (csrf) {
                                            const input = document.createElement('input');
                                            input.type = 'hidden';
                                            input.name = '_token';
                                            input.value = csrf;
                                            form.appendChild(input);
                                        }
                                        document.body.appendChild(form);
                                        form.submit();
                                    }}
                                    className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition cursor-pointer select-none"
                                >
                                    Keluar / Logout
                                </a>
                            </div>
                        </div>
                    ) : (
                        <DashboardView
                            dashboard={dashboard.sampleDashboard}
                            widgets={widgets}
                            user={dashboard.user}
                            topbarHeight={topbarHeight}
                            mobileWorkspaceMenuOpen={isWorkspaceMenuOpen}
                            onCloseMobileWorkspaceMenu={() => setIsWorkspaceMenuOpen(false)}
                        />
                    )}
                </main>
            </div>
        </WorkspaceLayout>
    );
}
