import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';

import FlashToastBridge from '@/components/feedback/FlashToastBridge';
import AppErrorBoundary from '@/components/error/AppErrorBoundary';

const applicationName = typeof document !== 'undefined' ? document.title || 'TB Nur POS' : 'TB Nur POS';

createInertiaApp({
    title: () => 'TB Nur POS',
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
                    <Toaster
                        position="top-right"
                        visibleToasts={4}
                        richColors
                        expand
                        closeButton={false}
                    />
                </AppErrorBoundary>
            </StrictMode>,
        );
    },
});
