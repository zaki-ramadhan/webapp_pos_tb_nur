import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

import { DataTableHead } from '@/components/ui/DataTable';
import { getColumnMinWidth } from './columnVisibility';

function resolveAlignClassName(align) {
    return align === 'right' ? 'text-right' : align === 'left' ? 'text-left' : 'text-center';
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
}) {
    const alignClass = resolveAlignClassName(align);
    const textClass = `block ${noWrap ? 'whitespace-nowrap' : 'whitespace-normal break-words'}`;
    const minWidth = getColumnMinWidth(label);

    if (!sortable || !onSort) {
        return (
            <DataTableHead
                className={`${widthClassName} px-2.5 py-1.5 text-base font-medium leading-4 text-white ${alignClass} ${className}`.trim()}
                style={minWidth ? { minWidth } : undefined}
            >
                <span className={textClass}>{label}</span>
            </DataTableHead>
        );
    }

    return (
        <DataTableHead
            className={`${widthClassName} px-2.5 py-1.5 text-base font-medium leading-4 text-white ${alignClass} ${className}`.trim()}
            style={minWidth ? { minWidth } : undefined}
        >
            <button
                type="button"
                onClick={onSort}
                className={`inline-flex w-full items-center gap-1 transition-opacity hover:opacity-80 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`.trim()}
            >
                <span className={textClass}>{label}</span>
                <SortIcon direction={sortDirection} />
            </button>
        </DataTableHead>
    );
}

