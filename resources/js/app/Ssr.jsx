import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { renderToString } from 'react-dom/server';

const applicationName = 'Toko Bangunan & Material TB Nur';

createServer((page) =>
    createInertiaApp({
        page,
        render: renderToString,
        title: () => 'Toko Bangunan & Material TB Nur',
        resolve: (name) =>
            resolvePageComponent(`../pages/${name}.jsx`, import.meta.glob('../pages/**/*.jsx')),
        setup: ({ App, props }) => <App {...props} />,
    }),
);
