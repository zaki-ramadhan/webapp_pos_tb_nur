import { useEffect, useRef, useState } from 'react';

import DashboardTopBar from '@/features/workspace/dashboard/DashboardTopBar';
import DashboardView from '@/features/workspace/dashboard/DashboardView';
import WorkspaceLayout from '@/layouts/WorkspaceLayout';

export default function DashboardPage({ dashboard, widgets }) {
    const topBarRef = useRef(null);
    const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
    const [topbarHeight, setTopbarHeight] = useState(0);

    // 🔴 CI/CD TEST — HAPUS SETELAH VERIFIKASI
    const cicdTestDiv = (
        <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 9999, background: 'red', color: 'white', padding: '16px 24px', borderRadius: 12, fontSize: 18, fontWeight: 700, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            🚀 CI/CD BERHASIL!
        </div>
    );


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
            {cicdTestDiv}
            <div className="flex h-screen flex-col overflow-hidden">
                <div ref={topBarRef} className="fixed inset-x-0 top-0 z-50">
                    <DashboardTopBar
                        contextLabel={dashboard.headerContextLabel}
                        user={dashboard.user}
                        workspaceMenuOpen={isWorkspaceMenuOpen}
                        onToggleWorkspaceMenu={() => setIsWorkspaceMenuOpen((currentValue) => !currentValue)}
                    />
                </div>

                <main
                    className="flex min-h-0 flex-1 bg-tab-active-bg"
                    style={topbarHeight ? { paddingTop: `${topbarHeight}px` } : undefined}
                >
                    <DashboardView
                        dashboard={dashboard.sampleDashboard}
                        widgets={widgets}
                        user={dashboard.user}
                        topbarHeight={topbarHeight}
                        mobileWorkspaceMenuOpen={isWorkspaceMenuOpen}
                        onCloseMobileWorkspaceMenu={() => setIsWorkspaceMenuOpen(false)}
                    />
                </main>
            </div>
        </WorkspaceLayout>
    );
}
