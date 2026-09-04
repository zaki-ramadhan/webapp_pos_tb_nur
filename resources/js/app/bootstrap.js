import axios from 'axios';
import '@/echo';
import { clearWorkspaceClientState } from '@/features/workspace/dashboard/workspaceClientState';
import { showSessionExpiredModal } from '@/components/ui/SessionExpiredModal';

import { sanitizePayload } from '@/utils/textSanitizer';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

window.axios.interceptors.request.use(
    (config) => {
        if (config?.data) {
            config.data = sanitizePayload(config.data);
        }
        return config;
    },
    (error) => Promise.reject(error),
);

let authRedirectInProgress = false;

function redirectToLogin() {
    if (typeof window === 'undefined') {
        return;
    }

    clearWorkspaceClientState();

    if (window.location.pathname === '/') {
        window.location.reload();
        return;
    }

    window.location.replace('/');
}

window.axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;

        if (status === 401 || status === 419) {
            if (!authRedirectInProgress) {
                authRedirectInProgress = true;
                showSessionExpiredModal().then(() => {
                    redirectToLogin();
                });
            }
        }

        return Promise.reject(error);
    },
);
