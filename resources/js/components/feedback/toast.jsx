import { toast } from 'sonner';

export function renderToastList(items, defaultIntro = 'Bidang berikut wajib diisi:') {
    const list = (Array.isArray(items) ? items : [items]).filter(Boolean);
    if (list.length === 0) return null;
    if (list.length === 1) {
        const single = String(list[0]).trim();
        return single.toLowerCase().includes('diisi') || single.toLowerCase().includes('harus') || single.toLowerCase().includes('wajib')
            ? single
            : `${single} wajib diisi.`;
    }

    const isAllFieldErrors = list.every((item) => {
        const s = String(item ?? '').trim().toLowerCase();
        return !s.includes(' ') || s.endsWith('harus diisi.') || s.endsWith('harus diisi') || s.endsWith('wajib diisi.') || s.endsWith('wajib diisi');
    });

    const intro = isAllFieldErrors ? defaultIntro : 'Mohon periksa poin berikut:';
    const cleanedItems = list.map((item) => {
        const s = String(item ?? '').trim();
        return isAllFieldErrors ? s.replace(/\s*(harus|wajib)\s+diisi\.?$/i, '').trim() : s;
    });

    return (
        <div className="mt-1 flex flex-col gap-1 text-xs leading-relaxed">
            <span className="font-medium opacity-95">{intro}</span>
            <ul className="list-disc pl-4 space-y-0.5 opacity-90">
                {cleanedItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

function resolveToastDescription(message) {
    if (!message) return '';
    if (Array.isArray(message)) {
        return renderToastList(message);
    }
    if (typeof message === 'string' && message.includes(' • ')) {
        const parts = message.split(' • ').map((s) => s.trim()).filter(Boolean);
        if (parts.length > 1) {
            return renderToastList(parts);
        }
    }
    return message;
}

function buildToastOptions(overrides = {}, message = null) {
    const isMultiItem = Array.isArray(message) || (typeof message === 'string' && message.includes(' • '));
    return {
        position: 'top-right',
        duration: isMultiItem ? 5200 : 4200,
        ...overrides,
    };
}

export function showLoadingToast({ title = 'Memproses', message }) {
    return toast.loading(title, buildToastOptions({
        description: message,
        duration: Infinity,
    }, message));
}

export function showInfoToast({ title = 'Informasi', message }) {
    return toast.info(title, buildToastOptions({
        description: message,
    }, message));
}

export function showErrorToast({ title = 'Terjadi masalah', message }) {
    return toast.error(title, buildToastOptions({
        description: resolveToastDescription(message),
    }, message));
}

export function showSuccessToast({ title = 'Berhasil', message }) {
    return toast.success(title, buildToastOptions({
        description: message,
    }, message));
}

export function showWarningToast({ title = 'Perhatian', message }) {
    return toast.warning(title, buildToastOptions({
        description: resolveToastDescription(message),
    }, message));
}

export function updateToastToSuccess(id, { title = 'Berhasil', message }) {
    return toast.success(title, buildToastOptions({
        id,
        description: message,
    }));
}

export function updateToastToError(id, { title = 'Terjadi masalah', message }) {
    return toast.error(title, buildToastOptions({
        id,
        description: message,
    }));
}

export function dismissToast(id) {
    if (id) {
        toast.dismiss(id);
    }
}
