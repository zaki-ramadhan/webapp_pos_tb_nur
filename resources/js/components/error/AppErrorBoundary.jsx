import { Component } from 'react';

import ErrorExperience, { buildErrorActions } from '@/features/error/ErrorExperience';

export default class AppErrorBoundary extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hasError: false,
        };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        if (import.meta.env.DEV) {
            console.error(error);
        }
    }

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        const hasAuthSession = Boolean(this.props.pageProps?.auth?.user);
        const appName = this.props.pageProps?.app?.name ?? 'WebApp POS';

        return (
            <ErrorExperience
                status={500}
                appName={appName}
                isClientCrash
                subtitle="Client Runtime Error"
                actions={buildErrorActions({
                    hasAuthSession,
                    status: 500,
                    fallbackHref: hasAuthSession ? '/dashboard' : '/',
                })}
            />
        );
    }
}
