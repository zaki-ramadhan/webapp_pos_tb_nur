import PortalDropdown from '@/components/ui/PortalDropdown';

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
    return (
        <PortalDropdown
            open={open}
            onClose={onClose}
            anchorRef={anchorRef}
            align={align}
            side={side}
            className={`rounded-[6px] p-1.5 shadow-[0_6px_14px_rgba(15,23,42,0.12)] ${widthClassName} ${className}`.trim()}
            panelClassName={panelClassName}
        >
            {children}
        </PortalDropdown>
    );
}
