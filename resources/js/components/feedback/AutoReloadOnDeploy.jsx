import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export default function AutoReloadOnDeploy() {
    const initialManifestRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const checkDeployment = async () => {
            try {
                const res = await fetch(`/build/manifest.json?t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
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
                    toast.info('⚡ Pembaruan sistem (CI/CD) selesai! Memperbarui halaman...', { duration: 4000 });
                    setTimeout(() => {
                        window.location.reload();
                    }, 1200);
                }
            } catch {
                // Abaikan error jaringan sementara saat proses deploy berlangsung
            }
        };

        checkDeployment();
        const interval = setInterval(checkDeployment, 5000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    return null;
}
