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

export async function listBackendResource(resource, params = {}) {
    const response = await getBackendClient().get(`/api/backend/${resource}`, {
        params: normalizeQueryParams(params),
    });

    return response.data;
}

export async function getBackendResource(resource, recordId) {
    const response = await getBackendClient().get(`/api/backend/${resource}/${recordId}`);

    return response.data?.data ?? null;
}

export async function createBackendResource(resource, payload) {
    const response = await getBackendClient().post(`/api/backend/${resource}`, payload);

    return response.data;
}

export async function updateBackendResource(resource, recordId, payload) {
    const response = await getBackendClient().put(`/api/backend/${resource}/${recordId}`, payload);

    return response.data;
}

export async function deleteBackendResource(resource, recordId) {
    const response = await getBackendClient().delete(`/api/backend/${resource}/${recordId}`);

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
