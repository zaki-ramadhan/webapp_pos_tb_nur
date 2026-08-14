import { useEffect, useRef } from 'react';
import { showInfoToast } from '@/components/feedback/toast';

export default function AutoReloadOnDeploy({ initialEnv }) {
    const environment = initialEnv || import.meta.env.VITE_APP_ENV || 'production';
    const initialManifestRef = useRef(null);

    // Hanya aktif di environment non-production (misal: staging, local, development)
    const isAutoReloadEnabled = environment !== 'production';

    // Clean up parameter ?v=... dari address bar jika ada dari reload sebelumnya
    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.search.includes('v=')) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    useEffect(() => {
        if (!isAutoReloadEnabled) return;

        let isMounted = true;

        const checkDeployment = async () => {
            try {
                const res = await fetch(`/build/manifest.json?t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                    },
                });
                if (!res.ok) return;
                const text = await res.text();

                if (!isMounted) return;

                if (initialManifestRef.current === null) {
                    initialManifestRef.current = text;
                    return;
                }

                if (text !== initialManifestRef.current) {
                    initialManifestRef.current = text;
                    showInfoToast({
                        title: '⚡ Update CI/CD Selesai',
                        message: 'Memperbarui halaman...',
                    });
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            } catch {
                // Abaikan error jaringan sementara saat deploy sedang berjalan
            }
        };

        checkDeployment();
        const interval = setInterval(checkDeployment, 5000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [isAutoReloadEnabled]);

    return null;
}
