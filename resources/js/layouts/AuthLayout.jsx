import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

import GlobalBackgroundArt from '@/components/shared/GlobalBackgroundArt';
import { clearWorkspaceClientState } from '@/features/workspace/dashboard/workspaceClientState';

export default function AuthLayout({ children, title }) {
    const appName = usePage().props.app?.name ?? 'TB Nur POS';

    useEffect(() => {
        clearWorkspaceClientState();
    }, []);

    return (
        <>
            <Head title={title ? `${title} - ${appName}` : appName} />

            <div className="auth-screen relative min-h-screen overflow-x-hidden bg-[#9ab8ea] text-slate-700">
                <GlobalBackgroundArt />

                <div className="relative flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
                    {children}
                </div>
            </div>
        </>
    );
}
