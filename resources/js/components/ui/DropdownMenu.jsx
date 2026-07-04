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
    noPadding = true,
}) {
    const paddingClass = noPadding ? '' : 'p-1.5';

    return (
        <PortalDropdown
            open={open}
            onClose={onClose}
            anchorRef={anchorRef}
            align={align}
            side={side}
            className={`rounded-[6px] shadow-md ${paddingClass} ${widthClassName} ${className}`.trim()}
            panelClassName={panelClassName}
        >
            {children}
        </PortalDropdown>
    );
}
