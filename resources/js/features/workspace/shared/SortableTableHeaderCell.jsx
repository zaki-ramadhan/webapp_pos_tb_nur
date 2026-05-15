import { DataTableHead } from '@/components/ui/DataTable';

function resolveAlignClassName(align) {
    return align === 'right' ? 'text-right' : align === 'left' ? 'text-left' : 'text-center';
}

export default function SortableTableHeaderCell({
    label,
    align = 'left',
    widthClassName = '',
    className = '',
    sortable = true,
    noWrap = false,
}) {
    void sortable;

    return (
        <DataTableHead
            className={`${widthClassName} px-2.5 py-1.5 text-[15px] font-medium leading-4 text-white ${resolveAlignClassName(align)} ${className}`.trim()}
        >
            <span
                className={`block ${align === 'right' ? 'text-right' : align === 'left' ? 'text-left' : 'text-center'} ${noWrap ? 'whitespace-nowrap' : 'whitespace-normal break-words'}`.trim()}
            >
                {label}
            </span>
        </DataTableHead>
    );
}
