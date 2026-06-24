import axios from 'axios';
import { clearWorkspaceClientState } from '@/features/workspace/dashboard/workspaceClientState';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';
import { showSessionExpiredModal } from '@/components/ui/SessionExpiredModal';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

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
        } else if (status === 404) {
            showSystemErrorModal({
                title: 'Terjadi Permasalahan pada Pemrosesan',
                description: 'Silakan perbaiki permasalahan berikut ini:',
                message: 'Data tidak ditemukan atau sudah dihapus',
            });
        }

        return Promise.reject(error);
    },
);
