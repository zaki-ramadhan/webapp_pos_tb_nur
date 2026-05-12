import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

import { showErrorToast, showSuccessToast } from '@/components/feedback/toast';

export default function FlashToastBridge() {
    const latestSignatureRef = useRef('');

    useEffect(() => {
        const unbind = router.on('success', (event) => {
            const flash = event.detail.page.props?.flash ?? {};
            const status = flash.status ?? '';
            const error = flash.error ?? '';
            const signature = `${status}|${error}|${event.detail.page.url}`;

            if (!status && !error) {
                latestSignatureRef.current = '';

                return;
            }

            if (latestSignatureRef.current === signature) {
                return;
            }

            latestSignatureRef.current = signature;

            if (status) {
                showSuccessToast({
                    title: 'Berhasil',
                    message: status,
                });
            }

            if (error) {
                showErrorToast({
                    title: 'Terjadi masalah',
                    message: error,
                });
            }
        });

        return () => {
            unbind();
        };
    }, []);

    return null;
}
