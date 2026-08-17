import { useEffect, useRef } from 'react';

/**
 * Checks if a DOM element is currently visible on screen (not hidden, not display: none, not inside an inactive tab).
 */
function isElementVisible(el) {
    if (!el || !el.isConnected) {
        return false;
    }

    // Check if element or any ancestor has hidden / display: none class
    if (el.closest('.hidden, [hidden]')) {
        return false;
    }

    // Check computed style display
    try {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') {
            return false;
        }
    } catch {
        // Fallback
    }

    if (typeof el.checkVisibility === 'function') {
        return el.checkVisibility({ checkOpacity: false, checkVisibilityCSS: true });
    }

    const rect = el.getBoundingClientRect();
    return (rect.width > 0 || rect.height > 0) && el.offsetParent !== null;
}

/**
 * Hook to handle Ctrl+S / Cmd+S save shortcuts in active form views only.
 *
 * @param {Function} onSave - Callback function to trigger save action.
 * @param {Object} options
 * @param {boolean} options.disabled - Whether save is disabled (e.g. while saving or read-only).
 * @param {React.RefObject} [options.containerRef] - Optional container ref to check visibility against.
 * @returns {React.RefObject} containerRef - Ref to attach to the root form container element.
 */
export function useFormSaveShortcut(onSave, { disabled = false, containerRef = null } = {}) {
    const internalRef = useRef(null);
    const targetRef = containerRef || internalRef;
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

            const container = targetRef.current;

            // Only execute save if the form container is mounted and ACTUALLY visible (not hidden in background tabs)
            if (!container || !isElementVisible(container)) {
                return;
            }

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
    }, [targetRef]);

    return targetRef;
}

export default useFormSaveShortcut;
