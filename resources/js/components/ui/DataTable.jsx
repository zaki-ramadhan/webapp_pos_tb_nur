function getTextContent(node) {
    if (!node) return '';
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(getTextContent).join('');
    if (typeof node === 'object' && node.props && node.props.children) {
        return getTextContent(node.props.children);
    }
    return '';
}

function calculateMinWidth(label) {
    if (typeof label !== 'string' || !label) return 80;
    return Math.ceil(label.length * 8) + 24;
}

export function DataTable({ className = '', wrapperClassName = '', children, ...props }) {
    const cleanedClassName = className.replace(/\b(?:[a-z-]*:)?min-w-\[[^\]]+\]/g, '').trim();

    return (
        <div
            className={`w-full overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-[4px] border border-table-border ${wrapperClassName}`.trim()}
        >
            <table className={`w-full min-w-full border-collapse ${cleanedClassName}`.trim()} {...props}>
                {children}
            </table>
        </div>
    );
}

export function DataTableHeader({ className = '', children, ...props }) {
    return (
        <thead className={`bg-table-header-bg text-white ${className}`.trim()} {...props}>
            {children}
        </thead>
    );
}

export function DataTableBody({ className = '', children, ...props }) {
    return (
        <tbody className={`bg-white ${className}`.trim()} {...props}>
            {children}
        </tbody>
    );
}

export function DataTableRow({ className = '', children, ...props }) {
    return (
        <tr className={`border-t border-table-row-border text-table-row-text ${className}`.trim()} {...props}>
            {children}
        </tr>
    );
}

export function DataTableHead({ className = '', children, style: propStyle, onResizeStart = null, ...props }) {
    const hasAlign = /\btext-(left|center|right)\b/.test(className);
    const alignClass = hasAlign ? '' : 'text-left';

    const widthMatch = className.match(/\b(?:[a-z-]*:)?(?:min-w|w)-\[(\d+(?:px|%|rem|vw|vh))\]/);
    const preferredWidth = widthMatch ? widthMatch[1] : null;

    const cleanedClassName = className.replace(/\b(?:[a-z-]*:)?(?:min-w|w|max-w)-\[[^\]]+\]/g, '').trim();

    const textContent = getTextContent(children).trim();
    const safeMinWidth = calculateMinWidth(textContent);

    const style = { ...propStyle };
    if (preferredWidth && !style.width) {
        style.width = preferredWidth;
    }
    if (!style.minWidth) {
        style.minWidth = `${safeMinWidth}px`;
    }

    return (
        <th
            className={`border-r border-table-cell-border px-3 py-2 ${alignClass} text-xs font-light leading-5 last:border-r-0 sm:px-4 sm:text-sm whitespace-nowrap truncate relative select-none ${cleanedClassName}`.trim()}
            style={{ ...style, position: 'relative' }}
            {...props}
        >
            <div className="w-full truncate block min-w-0">{children}</div>
            {onResizeStart && (
                <div
                    className="absolute right-0 top-0 bottom-0 w-[4px] -mr-[2px] cursor-col-resize select-none hover:bg-brand-blue/40 active:bg-brand-blue/70 transition-colors z-20"
                    onMouseDown={onResizeStart}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                    style={{ touchAction: 'none' }}
                />
            )}
        </th>
    );
}

export function DataTableCell({ className = '', children, onResizeStart = null, style: propStyle, ...props }) {
    const textContent = getTextContent(children).trim();
    let resolvedClassName = className;

    if (textContent === '-') {
        resolvedClassName = className
            .replace(/\btext-(left|right)\b/g, '')
            .trim() + ' text-center';
    }

    return (
        <td
            className={`border-r border-table-cell-border px-3 py-2 text-sm leading-5 last:border-r-0 sm:px-4 whitespace-nowrap truncate relative ${onResizeStart ? 'select-none' : ''} ${resolvedClassName}`.trim()}
            style={{ ...propStyle, position: onResizeStart ? 'relative' : propStyle?.position }}
            {...props}
        >
            <div className="w-full truncate block min-w-0">{children}</div>
            {onResizeStart && (
                <div
                    className="absolute right-0 top-0 bottom-0 w-[4px] -mr-[2px] cursor-col-resize select-none hover:bg-brand-blue/20 active:bg-brand-blue/40 transition-colors z-10"
                    onMouseDown={onResizeStart}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                    style={{ touchAction: 'none' }}
                />
            )}
        </td>
    );
}
