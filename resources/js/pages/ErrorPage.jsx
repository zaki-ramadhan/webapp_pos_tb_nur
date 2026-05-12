import { Head, usePage } from '@inertiajs/react';

import ErrorExperience, { buildErrorActions } from '@/features/error/ErrorExperience';

export default function ErrorPage({ status = 500 }) {
    const { props } = usePage();
    const hasAuthSession = Boolean(props.auth?.user);
    const appName = props.app?.name ?? 'TB Nur POS';

    return (
        <>
            <Head title={`Error ${status}`} />
            <ErrorExperience
                status={status}
                appName={appName}
                actions={buildErrorActions({
                    hasAuthSession,
                    status,
                    fallbackHref: hasAuthSession ? '/dashboard' : '/',
                })}
            />
        </>
    );
}
