import { Head } from '@inertiajs/react';

import GlobalBackgroundArt from '@/components/shared/GlobalBackgroundArt';

export default function AuthLayout({ children, title }) {
    return (
        <>
            <Head title={title} />

            <div className="auth-screen relative min-h-screen overflow-x-hidden bg-[#9ab8ea] text-slate-700">
                <GlobalBackgroundArt />

                <div className="relative flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
                    {children}
                </div>
            </div>
        </>
    );
}
