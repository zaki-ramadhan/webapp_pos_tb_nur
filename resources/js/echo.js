import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const getReverbKey = () => ((typeof window !== 'undefined' && window.__REVERB_KEY__) ? window.__REVERB_KEY__ : null) || import.meta.env.VITE_REVERB_APP_KEY || null;
const reverbKey = getReverbKey();

if (typeof window !== 'undefined' && reverbKey) {
    const isSecure = window.location.protocol === 'https:';
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const host = isLocal ? (import.meta.env.VITE_REVERB_HOST || 'localhost') : window.location.hostname;
    const port = isLocal ? Number(import.meta.env.VITE_REVERB_PORT || 8080) : (isSecure ? 443 : 80);

    try {
        window.Echo = new Echo({
            broadcaster: 'reverb',
            key: reverbKey,
            wsHost: host,
            wsPort: port,
            wssPort: port,
            forceTLS: isSecure,
            enabledTransports: ['ws', 'wss'],
        });

        window.Echo.channel('workspace-resources')
            .listen('.resource.updated', (e) => {
                if (e && e.resourceKey) {
                    if (typeof window !== 'undefined' && typeof window.__notifyLiveUpdateChange === 'function') {
                        window.__notifyLiveUpdateChange({
                            resource: e.resourceKey,
                            action: e.action,
                            recordId: e.recordId,
                            timestamp: Date.now(),
                        });
                    }
                    if (typeof window !== 'undefined' && typeof window.__clearBackendCache === 'function') {
                        window.__clearBackendCache(e.resourceKey);
                    }
                }
            });
    } catch (e) {
        // Safe Echo fallback
    }
}
