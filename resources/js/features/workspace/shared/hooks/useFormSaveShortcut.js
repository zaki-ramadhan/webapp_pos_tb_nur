import { useEffect, useRef } from 'react';

/**
 * Hook to handle Ctrl+S / Cmd+S save shortcuts in active form views.
 *
 * @param {Function} onSave - Callback function to trigger save action.
 * @param {boolean} disabled - Whether the shortcut should be ignored (e.g. while saving or when save button is disabled).
 */
export function useFormSaveShortcut(onSave, { disabled = false } = {}) {
    const onSaveRef = useRef(onSave);
    const disabledRef = useRef(disabled);

    useEffect(() => {
        onSaveRef.current = onSave;
        disabledRef.current = disabled;
    }, [onSave, disabled]);

    useEffect(() => {
        function handleKeyDown(event) {
            // Check for Ctrl+S (Windows/Linux) or Cmd+S (Mac)
            const isSaveShortcut = (event.ctrlKey || event.metaKey) && (event.key === 's' || event.key === 'S' || event.code === 'KeyS');

            if (!isSaveShortcut) {
                return;
            }

            // Always prevent browser default "Save As HTML" prompt
            event.preventDefault();
            event.stopPropagation();

            if (disabledRef.current) {
                return;
            }

            if (typeof onSaveRef.current === 'function') {
                onSaveRef.current();
            }
        }

        window.addEventListener('keydown', handleKeyDown, { capture: true });

        return () => {
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
        };
    }, []);
}

export default useFormSaveShortcut;
