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
            className={`rounded-[4px] p-1.5 shadow-[0_3px_8px_rgba(15,23,42,0.08)] ${widthClassName} ${className}`.trim()}
            panelClassName={panelClassName}
        >
            {children}
        </PortalDropdown>
    );
}
