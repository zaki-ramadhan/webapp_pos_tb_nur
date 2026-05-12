import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';

import FlashToastBridge from '@/components/feedback/FlashToastBridge';
import AppErrorBoundary from '@/components/error/AppErrorBoundary';

const applicationName = typeof document !== 'undefined' ? document.title || 'TB Nur POS' : 'TB Nur POS';

createInertiaApp({
    title: (title) => (title ? `${title} | ${applicationName}` : applicationName),
    resolve: (name) =>
        resolvePageComponent(`../pages/${name}.jsx`, import.meta.glob('../pages/**/*.jsx')),
    progress: {
        color: '#b85d20',
        showSpinner: false,
    },
    defaults: {
        prefetch: {
            cacheFor: '2m',
            hoverDelay: 150,
        },
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <StrictMode>
                <AppErrorBoundary pageProps={props.initialPage?.props}>
                    <App {...props} />
                    <FlashToastBridge />
                    <ToastContainer newestOnTop limit={4} />
                </AppErrorBoundary>
            </StrictMode>,
        );
    },
});
