const STORAGE_PREFIX = 'pos_inquiry_filter_';

function canUseStorage() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadInquiryFilter(pageId, fallback = null) {
    if (!canUseStorage() || !pageId) {
        return fallback;
    }

    try {
        const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${pageId}`);
        if (!raw) {
            return fallback;
        }
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch {
        return fallback;
    }
}

export function saveInquiryFilter(pageId, values) {
    if (!canUseStorage() || !pageId || !values) {
        return;
    }

    try {
        window.localStorage.setItem(`${STORAGE_PREFIX}${pageId}`, JSON.stringify(values));
    } catch {
        // Abaikan gagal simpan filter ke storage
    }
}

export function clearInquiryFilter(pageId) {
    if (!canUseStorage() || !pageId) {
        return;
    }

    try {
        window.localStorage.removeItem(`${STORAGE_PREFIX}${pageId}`);
    } catch {
        // Abaikan gagal hapus
    }
}

export function clearInquiryFilterState() {
    if (!canUseStorage()) {
        return;
    }

    try {
        const targetKeys = [];
        for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key && key.startsWith(STORAGE_PREFIX)) {
                targetKeys.push(key);
            }
        }

        targetKeys.forEach((key) => {
            window.localStorage.removeItem(key);
        });
    } catch {
        // Abaikan kegagalan pembersihan storage
    }
}
