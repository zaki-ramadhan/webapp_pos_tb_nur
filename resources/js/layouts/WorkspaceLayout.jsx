import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

import GlobalBackgroundArt from '@/components/shared/GlobalBackgroundArt';

export default function WorkspaceLayout({ children, title = 'Workspace' }) {
    const appName = usePage().props.app?.name ?? 'TB Nur POS';

    useEffect(() => {
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

            <div className="workspace-screen relative h-screen w-screen overflow-hidden bg-layout-bg text-layout-text">
                <GlobalBackgroundArt />
                <div className="absolute inset-0 bg-bg-gradient-linear" />

                <div className="relative z-10 h-full w-full overflow-hidden">{children}</div>
            </div>
        </>
    );
}
