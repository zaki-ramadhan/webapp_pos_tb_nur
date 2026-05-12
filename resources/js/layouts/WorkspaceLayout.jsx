import { Head, usePage } from '@inertiajs/react';

import GlobalBackgroundArt from '@/components/shared/GlobalBackgroundArt';

export default function WorkspaceLayout({ children, title = 'Workspace' }) {
    const appName = usePage().props.app?.name ?? 'TB Nur POS';

    return (
        <>
            <Head title={title ? `${title} - ${appName}` : appName} />

            <div className="workspace-screen relative min-h-screen overflow-x-hidden bg-[#9ab8ea] text-[#4f5679]">
                <GlobalBackgroundArt />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.55)_0%,rgba(237,247,255,0.84)_100%)]" />

                <div className="relative z-10 min-h-screen">{children}</div>
            </div>
        </>
    );
}
