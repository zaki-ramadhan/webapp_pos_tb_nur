import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';

import FlashToastBridge from '@/components/feedback/FlashToastBridge';
import AutoReloadOnDeploy from '@/components/feedback/AutoReloadOnDeploy';
import AppErrorBoundary from '@/components/error/AppErrorBoundary';

let navOverlay = null;
let navOverlayTimeout = null;

function showNavOverlay() {
    if (navOverlay) return;
    navOverlay = document.createElement('div');
    navOverlay.id = 'nav-overlay';
    navOverlay.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:99998',
        'background:#f8f9fb', 'display:flex',
        'align-items:center', 'justify-content:center',
        'opacity:0', 'transition:opacity 120ms ease',
    ].join(';');
    navOverlay.innerHTML = `
        <div style="text-align:center;font-family:'Montserrat',sans-serif">
            <div style="width:44px;height:44px;border:3px solid #e2e8f0;border-top-color:#21539b;border-radius:50%;animation:nav-spin 0.8s linear infinite;margin:0 auto 14px"></div>
            <div style="font-size:14px;font-weight:500;color:#475569">Memuat halaman...</div>
        </div>
        <style>@keyframes nav-spin{to{transform:rotate(360deg)}}</style>
    `;
    document.body.appendChild(navOverlay);
    requestAnimationFrame(() => { if (navOverlay) navOverlay.style.opacity = '1'; });
    navOverlayTimeout = setTimeout(hideNavOverlay, 8000);
}

function hideNavOverlay() {
    clearTimeout(navOverlayTimeout);
    if (!navOverlay) return;
    navOverlay.style.opacity = '0';
    const el = navOverlay;
    navOverlay = null;
    setTimeout(() => el?.parentNode?.removeChild(el), 200);
}

router.on('start', () => showNavOverlay());
router.on('finish', () => hideNavOverlay());

createInertiaApp({
    title: () => 'Toko Bangunan & Material TB Nur',
    resolve: (name) =>
        resolvePageComponent(`../pages/${name}.jsx`, import.meta.glob('../pages/**/*.jsx')),
    progress: {
        color: 'var(--color-accent)',
        showSpinner: false,
    },
    defaults: {
        prefetch: {
            cacheFor: '2m',
            hoverDelay: 150,
        },
    },
    setup({ el, App, props }) {
        const loader = document.getElementById('initial-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
        createRoot(el).render(
            <StrictMode>
                <AppErrorBoundary pageProps={props.initialPage?.props}>
                    <App {...props} />
                    <FlashToastBridge />
                    <AutoReloadOnDeploy initialEnv={props.initialPage?.props?.app?.env} />
                    <Toaster
                        position="top-right"
                        visibleToasts={4}
                        richColors
                        expand
                        closeButton={false}
                        toastOptions={{
                            className: '!font-normal',
                            style: { fontWeight: 400 },
                        }}
                    />
                </AppErrorBoundary>
            </StrictMode>,
        );
    },
});
