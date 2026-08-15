import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const reverbKey = import.meta.env.VITE_REVERB_APP_KEY;

if (reverbKey) {
    const host = import.meta.env.VITE_REVERB_HOST || (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
    const isSecure = typeof window !== 'undefined' ? window.location.protocol === 'https:' : true;
    const port = import.meta.env.VITE_REVERB_PORT ? Number(import.meta.env.VITE_REVERB_PORT) : (isSecure ? 443 : 80);

    try {
        window.Echo = new Echo({
            broadcaster: 'reverb',
            key: reverbKey,
            wsHost: host === 'localhost' && typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? window.location.hostname : host,
            wsPort: port,
            wssPort: port,
            forceTLS: isSecure,
            enabledTransports: ['ws', 'wss'],
        });
    } catch (e) {
        // Safe Echo fallback
    }
}
