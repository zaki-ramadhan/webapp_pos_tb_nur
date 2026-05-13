import { useEffect, useRef, useState } from 'react';

import DashboardTopBar from '@/features/workspace/dashboard/DashboardTopBar';
import DashboardView from '@/features/workspace/dashboard/DashboardView';
import WorkspaceLayout from '@/layouts/WorkspaceLayout';

export default function DashboardPage({ dashboard }) {
    const topBarRef = useRef(null);
    const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
    const [topbarHeight, setTopbarHeight] = useState(0);

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
            <div className="flex min-h-screen flex-col overflow-x-hidden">
                <div ref={topBarRef} className="fixed inset-x-0 top-0 z-50">
                    <DashboardTopBar
                        contextLabel={dashboard.headerContextLabel}
                        user={dashboard.user}
                        workspaceMenuOpen={isWorkspaceMenuOpen}
                        onToggleWorkspaceMenu={() => setIsWorkspaceMenuOpen((currentValue) => !currentValue)}
                    />
                </div>

                <main
                    className="flex min-h-0 flex-1 bg-[rgba(243,246,251,0.92)]"
                    style={topbarHeight ? { paddingTop: `${topbarHeight}px` } : undefined}
                >
                    <DashboardView
                        dashboard={dashboard.sampleDashboard}
                        topbarHeight={topbarHeight}
                        mobileWorkspaceMenuOpen={isWorkspaceMenuOpen}
                        onCloseMobileWorkspaceMenu={() => setIsWorkspaceMenuOpen(false)}
                    />
                </main>
            </div>
        </WorkspaceLayout>
    );
}
