import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';

const FormErrorContext = createContext({
    errors: {},
    clearError: () => {},
});

function errorsReducer(state, action) {
    switch (action.type) {
        case 'SET':
            return action.errors ?? {};
        case 'CLEAR_FIELD': {
            if (!state[action.key]) return state;
            const next = { ...state };
            delete next[action.key];
            return next;
        }
        case 'RESET':
            return {};
        default:
            return state;
    }
}

export function FormErrorProvider({ children }) {
    const [errors, dispatch] = useReducer(errorsReducer, {});

    useEffect(() => {
        function onSet(event) {
            dispatch({ type: 'SET', errors: event.detail ?? {} });
        }

        function onClear() {
            dispatch({ type: 'RESET' });
        }

        window.addEventListener('form-validation-error', onSet);
        window.addEventListener('form-validation-clear', onClear);

        return () => {
            window.removeEventListener('form-validation-error', onSet);
            window.removeEventListener('form-validation-clear', onClear);
        };
    }, []);

    const clearError = useCallback((key) => {
        if (key) dispatch({ type: 'CLEAR_FIELD', key });
    }, []);

    return (
        <FormErrorContext.Provider value={{ errors, clearError }}>
            {children}
        </FormErrorContext.Provider>
    );
}

/**
 * Resolve the effective inline error for a field.
 * Priority: explicit `error` prop > context error by name > context error by id.
 *
 * @param {string|boolean|undefined} explicitError - error passed directly via prop
 * @param {string|undefined} name - input name attribute
 * @param {string|undefined} id - input id attribute
 * @returns {{ errorMessage: string, contextKey: string|null }}
 */
export function useFormError(explicitError, name, id) {
    const { errors, clearError } = useContext(FormErrorContext);

    const contextKey = name || id || null;
    const contextError = contextKey
        ? (errors[name] ?? errors[id] ?? '')
        : '';

    // Explicit string error takes priority; boolean signals error state only (no message)
    const errorMessage =
        typeof explicitError === 'string' && explicitError
            ? explicitError
            : contextError || '';

    return { errorMessage, contextKey, clearError };
}

/**
 * Shared logic for toggle-style inputs (radio, checkbox).
 * Extracts error resolution + visual class derivation in one call.
 */
export function useToggleFieldError({ error, name, id, size, align, containerClassName }) {
    const { errorMessage: contextErrorMessage, contextKey, clearError } = useFormError(error, name, id);
    const resolvedError = contextErrorMessage || (typeof error === 'boolean' ? error : '');
    const feedbackMessage = resolvedError || (typeof error === 'string' ? error : '') || '';

    const sizeClassName = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
    const alignClassName = align === 'center' ? 'items-center' : 'items-start';
    const inputOffsetClassName = align === 'center' ? 'mt-0' : 'mt-1';
    const widthClass = (containerClassName ?? '').includes('w-') ? '' : 'w-full';

    return { resolvedError, feedbackMessage, sizeClassName, alignClassName, inputOffsetClassName, widthClass, contextKey, clearError };
}
