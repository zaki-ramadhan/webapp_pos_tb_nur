import { toast } from 'react-toastify';

function SuccessToastIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="app-toast__icon-svg">
            <path
                d="M9.55 16.45 5.1 12l1.4-1.4 3.05 3.05 8-8 1.4 1.4-9.4 9.4Z"
                fill="currentColor"
            />
        </svg>
    );
}

function ErrorToastIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="app-toast__icon-svg">
            <path
                d="M12 2.75a9.25 9.25 0 1 1 0 18.5 9.25 9.25 0 0 1 0-18.5Zm0 4.5a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0v-5a1 1 0 0 0-1-1Zm0 9.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"
                fill="currentColor"
            />
        </svg>
    );
}

function WarningToastIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="app-toast__icon-svg">
            <path
                d="M12 3.5 21 19H3l9-15.5Zm0 5.25a1 1 0 0 0-1 1v3.75a1 1 0 1 0 2 0V9.75a1 1 0 0 0-1-1Zm0 7a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z"
                fill="currentColor"
            />
        </svg>
    );
}

function LoadingToastIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="app-toast__icon-svg app-toast__icon-svg--spin">
            <path
                d="M12 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3Z"
                fill="currentColor"
            />
        </svg>
    );
}

const toastIcons = {
    success: SuccessToastIcon,
    error: ErrorToastIcon,
    warning: WarningToastIcon,
    loading: LoadingToastIcon,
};

const toastSurfaceStyles = {
    success: {
        background: 'linear-gradient(135deg,#ecfdf3 0%,#d7f8e5 100%)',
        borderColor: '#7fd7a6',
        color: '#16613f',
    },
    error: {
        background: 'linear-gradient(135deg,#fff1f3 0%,#ffd9df 100%)',
        borderColor: '#f39aac',
        color: '#a6324e',
    },
    warning: {
        background: 'linear-gradient(135deg,#fff8e7 0%,#ffe6b0 100%)',
        borderColor: '#f0c15d',
        color: '#915c00',
    },
    loading: {
        background: 'linear-gradient(135deg,#eef6ff 0%,#d6e9ff 100%)',
        borderColor: '#83b7f1',
        color: '#185ea9',
    },
};

function ToastMessage({ title, message, tone }) {
    const Icon = toastIcons[tone] ?? SuccessToastIcon;

    return (
        <div className="app-toast__inner">
            <div className={`app-toast__icon app-toast__icon--${tone}`.trim()}>
                <Icon />
            </div>
            <div className="app-toast__content">
                {title ? <p className="app-toast__title">{title}</p> : null}
                <p className="app-toast__message">{message}</p>
            </div>
        </div>
    );
}

function buildToastOptions(tone, overrides = {}) {
    return {
        position: 'top-right',
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        autoClose: 4200,
        icon: false,
        className: `app-toast app-toast--${tone}`,
        bodyClassName: 'app-toast__body',
        progressClassName: 'app-toast__progress',
        style: toastSurfaceStyles[tone],
        ...overrides,
    };
}

export function showLoadingToast({ title = 'Memproses', message }) {
    return toast.loading(<ToastMessage title={title} message={message} tone="loading" />, buildToastOptions('loading', {
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        draggable: false,
    }));
}

export function showErrorToast({ title = 'Terjadi masalah', message }) {
    return toast.error(<ToastMessage title={title} message={message} tone="error" />, buildToastOptions('error'));
}

export function showSuccessToast({ title = 'Berhasil', message }) {
    return toast.success(<ToastMessage title={title} message={message} tone="success" />, buildToastOptions('success'));
}

export function showWarningToast({ title = 'Perhatian', message }) {
    return toast.warning(<ToastMessage title={title} message={message} tone="warning" />, buildToastOptions('warning'));
}

export function updateToastToError(id, { title = 'Terjadi masalah', message }) {
    toast.update(id, {
        render: <ToastMessage title={title} message={message} tone="error" />,
        type: 'error',
        isLoading: false,
        autoClose: 4200,
        closeButton: true,
        closeOnClick: true,
        draggable: true,
        className: 'app-toast app-toast--error',
        bodyClassName: 'app-toast__body',
        progressClassName: 'app-toast__progress',
        style: toastSurfaceStyles.error,
    });
}

export function dismissToast(id) {
    if (id) {
        toast.dismiss(id);
    }
}
