import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { renderToString } from 'react-dom/server';

const applicationName = 'TB Nur POS';

createServer((page) =>
    createInertiaApp({
        page,
        render: renderToString,
        title: () => 'TB Nur POS',
        resolve: (name) =>
            resolvePageComponent(`../pages/${name}.jsx`, import.meta.glob('../pages/**/*.jsx')),
        setup: ({ App, props }) => <App {...props} />,
    }),
);
