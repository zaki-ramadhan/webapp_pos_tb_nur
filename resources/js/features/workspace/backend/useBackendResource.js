import { useState } from 'react';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';

export default function useBackendResource({ resource, onResolved }) {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    async function store(payload) {
        setProcessing(true);
        setError('');

        try {
            const data = await createBackendResource(resource, payload);
            onResolved?.('store', data);
            return data;
        } catch (requestError) {
            const message = getBackendErrorMessage(requestError);
            setError(message);
            throw requestError;
        } finally {
            setProcessing(false);
        }
    }

    async function update(id, payload) {
        setProcessing(true);
        setError('');

        try {
            const data = await updateBackendResource(resource, id, payload);
            onResolved?.('update', data);
            return data;
        } catch (requestError) {
            const message = getBackendErrorMessage(requestError);
            setError(message);
            throw requestError;
        } finally {
            setProcessing(false);
        }
    }

    async function remove(id) {
        setProcessing(true);
        setError('');

        try {
            const data = await deleteBackendResource(resource, id);
            onResolved?.('delete', data);
            return data;
        } catch (requestError) {
            const message = getBackendErrorMessage(requestError);
            setError(message);
            throw requestError;
        } finally {
            setProcessing(false);
        }
    }

    return {
        processing,
        error,
        setError,
        store,
        update,
        remove,
    };
}
