function getBackendClient() {
    if (!window.axios) {
        throw new Error('HTTP client belum tersedia.');
    }

    return window.axios;
}

function normalizeQueryParams(params = {}) {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
    );
}

const apiCache = new Map();
const inFlightRequests = new Map();

const CACHE_TTL_LIST_MS = 5000;
const CACHE_TTL_SHOW_MS = 15000;
const CACHE_TTL_STATIC_MS = 300000; // 5 menit untuk data master statis

const STATIC_RESOURCES = new Set([
    'units',
    'brands',
    'product-categories',
    'customer-categories',
    'supplier-categories',
    'payment-terms',
    'taxes',
    'currencies',
]);

function getCacheKey(type, resource, params = {}) {
    return `${type}::${resource}::${JSON.stringify(normalizeQueryParams(params))}`;
}

function getFromSessionStorage(key) {
    if (typeof window === 'undefined' || !window.sessionStorage) return null;
    try {
        const item = window.sessionStorage.getItem(key);
        if (!item) return null;
        const parsed = JSON.parse(item);
        if (Date.now() - parsed.timestamp < CACHE_TTL_STATIC_MS) {
            return parsed.data;
        }
        window.sessionStorage.removeItem(key);
    } catch {
        return null;
    }
    return null;
}

function saveToSessionStorage(key, data) {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    try {
        window.sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch {
      // Abaikan jika kuota penyimpanan browser penuh

    }
}

export function clearBackendCache(resource = null) {
    if (!resource) {
        apiCache.clear();
        inFlightRequests.clear();
        if (typeof window !== 'undefined' && typeof window.__clearBackendCache === 'function') {
            window.__clearBackendCache();
        }
        return;
    }

    const norm = resource.toLowerCase();
    for (const key of apiCache.keys()) {
        if (key.toLowerCase().includes(norm)) {
            apiCache.delete(key);
        }
    }
    for (const key of inFlightRequests.keys()) {
        if (key.toLowerCase().includes(norm)) {
            inFlightRequests.delete(key);
        }
    }

    if (typeof window !== 'undefined' && typeof window.__clearBackendCache === 'function') {
        window.__clearBackendCache(resource);
    }
}

export async function listBackendResource(resource, params = {}) {
    const isForceRefresh = params._refresh !== undefined;
    const cleanParams = normalizeQueryParams(params);
    const cacheKey = getCacheKey('list', resource, cleanParams);
    const isStatic = STATIC_RESOURCES.has(resource);

    if (!isForceRefresh) {
        const cached = apiCache.get(cacheKey);
        const ttl = isStatic ? CACHE_TTL_STATIC_MS : CACHE_TTL_LIST_MS;
        if (cached && Date.now() - cached.timestamp < ttl) {
            return cached.data;
        }

        if (isStatic) {
            const sessionData = getFromSessionStorage(cacheKey);
            if (sessionData) {
                apiCache.set(cacheKey, { data: sessionData, timestamp: Date.now() });
                return sessionData;
            }
        }

        if (inFlightRequests.has(cacheKey)) {
            return inFlightRequests.get(cacheKey);
        }
    }

    const requestPromise = (async () => {
        try {
            const response = await getBackendClient().get(`/api/backend/${resource}`, {
                params: cleanParams,
            });
            const data = response.data;

            apiCache.set(cacheKey, { data, timestamp: Date.now() });
            if (isStatic) {
                saveToSessionStorage(cacheKey, data);
            }
            return data;
        } finally {
            inFlightRequests.delete(cacheKey);
        }
    })();

    inFlightRequests.set(cacheKey, requestPromise);
    return requestPromise;
}

export async function getBackendResource(resource, recordId) {
    if (!recordId) return null;
    const cacheKey = getCacheKey('show', resource, { id: recordId });

    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_SHOW_MS) {
        return cached.data;
    }

    if (inFlightRequests.has(cacheKey)) {
        return inFlightRequests.get(cacheKey);
    }

    const requestPromise = (async () => {
        try {
            const response = await getBackendClient().get(`/api/backend/${resource}/${recordId}`);
            const data = response.data?.data ?? null;
            apiCache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } finally {
            inFlightRequests.delete(cacheKey);
        }
    })();

    inFlightRequests.set(cacheKey, requestPromise);
    return requestPromise;
}

export function sanitizePayload(payload) {
    if (payload === null || payload === undefined) {
        return payload;
    }
    if (typeof payload === 'string') {
        const trimmed = payload.trim();
        return trimmed.replace(/[ \t]{2,}/g, ' ');
    }
    if (Array.isArray(payload)) {
        return payload.map(sanitizePayload);
    }
    if (typeof payload === 'object' && !(payload instanceof File) && !(payload instanceof FormData)) {
        const sanitized = {};
        for (const [key, value] of Object.entries(payload)) {
            sanitized[key] = sanitizePayload(value);
        }
        return sanitized;
    }
    return payload;
}

export async function createBackendResource(resource, payload) {
    const response = await getBackendClient().post(`/api/backend/${resource}`, sanitizePayload(payload));
    clearBackendCache(resource);
    return response.data;
}

export async function updateBackendResource(resource, recordId, payload) {
    const response = await getBackendClient().put(`/api/backend/${resource}/${recordId}`, sanitizePayload(payload));
    clearBackendCache(resource);
    return response.data;
}

export async function deleteBackendResource(resource, recordId) {
    const response = await getBackendClient().delete(`/api/backend/${resource}/${recordId}`);
    clearBackendCache(resource);
    return response.data;
}

export function extractBackendRows(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    return [];
}

export function extractBackendTotal(payload) {
    if (typeof payload?.total === 'number') {
        return payload.total;
    }

    return extractBackendRows(payload).length;
}

export function getBackendErrorMessage(error, fallbackMessage = 'Permintaan backend gagal diproses.') {
    if (error?.response?.status === 403 || error?.response?.data?.message === 'This action is unauthorized.') {
        return 'Anda tidak memiliki hak akses ke halaman ini. Hubungi Owner untuk menambahkan akses.';
    }
    if (error?.response?.status === 404) {
        return 'Data tidak ditemukan atau sudah dihapus';
    }
    const validationErrors = error?.response?.data?.errors;

    if (validationErrors && typeof validationErrors === 'object') {
        const firstError = Object.values(validationErrors)
            .flat()
            .find((message) => typeof message === 'string' && message.trim());

        if (firstError) {
            return firstError;
        }
    }

    const responseMessage = error?.response?.data?.message;

    if (typeof responseMessage === 'string' && responseMessage.trim()) {
        return responseMessage;
    }

    if (typeof error?.message === 'string' && error.message.trim()) {
        return error.message;
    }

    return fallbackMessage;
}

export async function uploadBackendAttachment(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await getBackendClient().post('/api/backend/attachments/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data?.data ?? null;
}

export async function lookupRecordByDocumentNumber(resource, documentNumber) {
    try {
        const response = await getBackendClient().get(`/api/backend/${resource}`, {
            params: normalizeQueryParams({ document_number: documentNumber, per_page: 1 }),
        });
        const rows = Array.isArray(response.data?.data) ? response.data.data : [];
        return rows[0] ?? null;
    } catch {
        return null;
    }
}

