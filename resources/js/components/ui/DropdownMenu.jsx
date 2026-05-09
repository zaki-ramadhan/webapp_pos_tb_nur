import { useEffect, useRef } from 'react';

import Panel from '@/components/ui/Panel';

const alignClasses = {
    start: 'left-0',
    end: 'right-0',
};

const sideClasses = {
    bottom: 'top-[calc(100%+8px)]',
    top: 'bottom-[calc(100%+8px)]',
};

export default function DropdownMenu({
    open,
    onClose,
    anchorRef,
    children,
    align = 'end',
    side = 'bottom',
    widthClassName = 'w-[240px]',
    className = '',
    panelClassName = '',
}) {
    const panelRef = useRef(null);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        function handlePointerDown(event) {
            const target = event.target;

            if (panelRef.current?.contains(target) || anchorRef?.current?.contains(target)) {
                return;
            }

            onClose?.();
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                onClose?.();
            }
        }

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [anchorRef, onClose, open]);

    if (!open) {
        return null;
    }

    return (
        <div
            className={`absolute z-50 max-w-[calc(100vw-1rem)] ${alignClasses[align]} ${sideClasses[side]} ${widthClassName} ${className}`.trim()}
        >
            <Panel
                ref={panelRef}
                className={`rounded-[6px] border border-[#d6deea] bg-white p-1.5 shadow-[0_6px_14px_rgba(15,23,42,0.12)] ${panelClassName}`.trim()}
            >
                {children}
            </Panel>
        </div>
    );
}
