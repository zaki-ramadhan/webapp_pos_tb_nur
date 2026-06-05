import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

import GlobalBackgroundArt from '@/components/shared/GlobalBackgroundArt';
import { clearWorkspaceClientState } from '@/features/workspace/dashboard/workspaceClientState';

export default function AuthLayout({ children, title }) {
    const appName = usePage().props.app?.name ?? 'TB Nur POS';

    useEffect(() => {
        clearWorkspaceClientState();

        // Lock html and body scrolling to ensure only inner panels handle overflow
        document.documentElement.classList.add('overflow-hidden');
        document.body.classList.add('overflow-hidden');

        return () => {
            document.documentElement.classList.remove('overflow-hidden');
            document.body.classList.remove('overflow-hidden');
        };
    }, []);

    return (
        <>
            <Head title={title || appName} />

        <div className="auth-screen relative h-screen overflow-hidden bg-[#9ab8ea] text-slate-700">
                <GlobalBackgroundArt />

                <div className="relative flex h-full items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                    {children}
                </div>
            </div>
        </>
    );
}
