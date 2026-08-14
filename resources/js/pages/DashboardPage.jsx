import { useEffect, useRef, useState } from 'react';

import DashboardTopBar from '@/features/workspace/dashboard/DashboardTopBar';
import DashboardView from '@/features/workspace/dashboard/DashboardView';
import WorkspaceLayout from '@/layouts/WorkspaceLayout';

export default function DashboardPage({ dashboard, widgets }) {
    const topBarRef = useRef(null);
    const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
    const [topbarHeight, setTopbarHeight] = useState(0);


    return (
        <WorkspaceLayout title={dashboard.sample.label}>
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
