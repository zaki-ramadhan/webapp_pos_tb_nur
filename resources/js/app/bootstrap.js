import axios from 'axios';
import { clearWorkspaceClientState } from '@/features/workspace/dashboard/workspaceClientState';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

let authRedirectInProgress = false;

function redirectToLogin() {
    if (authRedirectInProgress || typeof window === 'undefined') {
        return;
    }

    authRedirectInProgress = true;
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
            redirectToLogin();
        }

        return Promise.reject(error);
    },
);
