import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const sideClasses = {
    top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
    bottom: 'left-1/2 top-full mt-2 -translate-x-1/2',
    left: 'right-full top-1/2 mr-2 -translate-y-1/2',
    right: 'left-full top-1/2 ml-2 -translate-y-1/2',
};

const portalSideClasses = {
    top: '-translate-x-1/2 -translate-y-full',
    bottom: '-translate-x-1/2',
    left: '-translate-x-full -translate-y-1/2',
    right: '-translate-y-1/2',
};

const arrowClasses = {
    top: 'left-1/2 top-full -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-tooltip-bg-dark',
    bottom:
        'left-1/2 bottom-full -translate-x-1/2 border-x-[6px] border-b-[6px] border-x-transparent border-b-tooltip-bg-dark',
    left: 'left-full top-1/2 -translate-y-1/2 border-y-[6px] border-l-[6px] border-y-transparent border-l-tooltip-bg-dark',
    right:
        'right-full top-1/2 -translate-y-1/2 border-y-[6px] border-r-[6px] border-y-transparent border-r-tooltip-bg-dark',
};

export default function Tooltip({
    content,
    side = 'top',
    children,
    className = '',
    tooltipClassName = '',
    portal = false,
}) {
    const anchorRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [portalPosition, setPortalPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (!portal || !isVisible) {
            return undefined;
        }

        function updatePosition() {
            if (!anchorRef.current) {
                return;
            }

            const rect = anchorRef.current.getBoundingClientRect();
            const gap = 8;

            switch (side) {
                case 'bottom':
                    setPortalPosition({
                        top: rect.bottom + gap,
                        left: rect.left + rect.width / 2,
                    });
                    break;
                case 'left':
                    setPortalPosition({
                        top: rect.top + rect.height / 2,
                        left: rect.left - gap,
                    });
                    break;
                case 'right':
                    setPortalPosition({
                        top: rect.top + rect.height / 2,
                        left: rect.right + gap,
                    });
                    break;
                case 'top':
                default:
                    setPortalPosition({
                        top: rect.top - gap,
                        left: rect.left + rect.width / 2,
                    });
                    break;
            }
        }

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isVisible, portal, side]);

    const portalTooltip = isVisible
        ? createPortal(
              <span
                  role="tooltip"
                  className={`pointer-events-none fixed z-[120] max-w-[280px] whitespace-normal rounded-[8px] bg-section-tab-neutral-text px-3 py-2 text-xs font-medium leading-normal text-white shadow-tooltip ${portalSideClasses[side]} ${tooltipClassName}`.trim()}
                  style={portalPosition}
              >
                  {content}
                  <span
                      className={`absolute h-0 w-0 ${arrowClasses[side]}`.trim()}
                      aria-hidden="true"
                  />
              </span>,
              document.body,
          )
        : null;

    return (
        <span
            ref={anchorRef}
            className={`group relative inline-flex ${className}`.trim()}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
        >
            {children}

            {portal ? null : (
                <span
                    role="tooltip"
                    className={`pointer-events-none absolute z-40 max-w-[280px] whitespace-normal rounded-[8px] bg-section-tab-neutral-text px-3 py-2 text-xs font-medium leading-normal text-white opacity-0 shadow-panel-primary transition duration-150 group-hover:opacity-100 group-focus-within:opacity-100 ${sideClasses[side]} ${tooltipClassName}`.trim()}
                >
                    {content}
                    <span
                        className={`absolute h-0 w-0 ${arrowClasses[side]}`.trim()}
                        aria-hidden="true"
                    />
                </span>
            )}
            {portalTooltip}
        </span>
    );
}
