import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

import { DataTableHead } from '@/components/ui/DataTable';
import { getColumnMinWidth } from './columnVisibility';

function resolveAlignClassName(align) {
    if (align === 'right') return 'text-right';
    if (align === 'center') return 'text-center';
    return 'text-left';
}

function resolveJustifyClassName(align) {
    if (align === 'right') return 'justify-end';
    if (align === 'center') return 'justify-center';
    return 'justify-start';
}

function SortIcon({ direction }) {
    if (direction === 'asc') return <ChevronUp className="h-3.5 w-3.5 shrink-0" />;
    if (direction === 'desc') return <ChevronDown className="h-3.5 w-3.5 shrink-0" />;
    return <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-40" />;
}

export default function SortableTableHeaderCell({
    label,
    align = 'left',
    widthClassName = '',
    className = '',
    sortable = true,
    noWrap = false,
    sortDirection = null,
    onSort = null,
    style: propStyle = {},
    onResizeStart = null,
    columnId = null,
}) {
    const alignClass = resolveAlignClassName(align);
    const justifyClass = resolveJustifyClassName(align);
    const textClass = 'block whitespace-nowrap truncate min-w-0 flex-1';
    const isCheckbox = columnId === 'checkbox' || (!label && widthClassName === 'w-px');
    const minWidth = isCheckbox ? null : getColumnMinWidth(label);
    const resolvedStyle = {
        ...(minWidth ? { minWidth: `${minWidth}px` } : {}),
        ...(isCheckbox ? { minWidth: '0px', width: '1px' } : {}),
        ...propStyle,
    };

    const pxClass = isCheckbox ? '!px-2.5' : 'px-2.5';

    if (!sortable || !onSort) {
        return (
            <DataTableHead
                className={`${widthClassName} ${pxClass} py-1.5 text-base font-light leading-4 text-white ${alignClass} ${className}`.trim()}
                style={resolvedStyle}
                onResizeStart={onResizeStart}
            >
                <span className={`${textClass} font-light`}>{label}</span>
            </DataTableHead>
        );
    }

    return (
        <DataTableHead
            className={`${widthClassName} ${pxClass} py-1.5 text-base font-light leading-4 text-white ${alignClass} ${className}`.trim()}
            style={resolvedStyle}
            onResizeStart={onResizeStart}
        >
            <button
                type="button"
                onClick={onSort}
                className={`inline-flex w-full items-center gap-1 transition-opacity hover:opacity-80 min-w-0 font-light ${justifyClass}`}
            >
                <span className={`${textClass} font-light`}>{label}</span>
                <SortIcon direction={sortDirection} />
            </button>
        </DataTableHead>
    );
}

