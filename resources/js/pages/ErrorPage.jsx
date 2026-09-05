import { Head, usePage } from '@inertiajs/react';

import ErrorExperience, { buildErrorActions } from '@/features/error/ErrorExperience';

export default function ErrorPage({ status = 500, errorId = null, technicalMessage = null }) {
    const { props } = usePage();
    const hasAuthSession = Boolean(props.auth?.user);
    const isSuperAdmin = Boolean(props.auth?.user?.isSuperAdmin);
    const appName = props.app?.name ?? 'TB Nur POS';
    const env = props.app?.env ?? 'production';
    const isDevOrStaging = env === 'local' || env === 'staging' || isSuperAdmin;

    return (
        <>
            <Head title={`Error ${status}`} />
            <ErrorExperience
                status={status}
                errorId={errorId}
                appName={appName}
                technicalMessage={technicalMessage}
                isDevOrStaging={isDevOrStaging}
                actions={buildErrorActions({
                    hasAuthSession,
                    status,
                    fallbackHref: hasAuthSession ? '/dashboard' : '/',
                })}
            />
        </>
    );
}
