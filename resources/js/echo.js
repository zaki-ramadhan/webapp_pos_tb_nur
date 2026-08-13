import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const host = import.meta.env.VITE_REVERB_HOST || (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
const isSecure = typeof window !== 'undefined' ? window.location.protocol === 'https:' : true;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY ?? 'eh3awxry6zdrubcvw6mc',
    wsHost: host === 'localhost' && typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? window.location.hostname : host,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: isSecure,
    enabledTransports: ['ws', 'wss'],
});
