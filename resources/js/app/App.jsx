import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const applicationName = typeof document !== 'undefined' ? document.title || 'WebApp POS' : 'WebApp POS';

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
                <App {...props} />
            </StrictMode>,
        );
    },
});
