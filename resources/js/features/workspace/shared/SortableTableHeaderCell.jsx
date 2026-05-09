import { DataTableHead } from '@/components/ui/DataTable';
import { SortIcon } from '@/features/workspace/shared/Icons';

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
    return (
        <DataTableHead
            className={`${widthClassName} px-2.5 py-1.5 text-[15px] font-medium leading-4 text-white ${resolveAlignClassName(align)} ${className}`.trim()}
        >
            <div className="relative min-h-[18px] w-full">
                {sortable ? (
                    <span className="pointer-events-none absolute left-0 top-1/2 inline-flex -translate-y-1/2 items-center text-white/55">
                        <SortIcon className="h-3 w-3 shrink-0" />
                    </span>
                ) : null}

                <span
                    className={`block text-center ${noWrap ? 'whitespace-nowrap' : 'whitespace-normal break-words'}`.trim()}
                >
                    {label}
                </span>
            </div>
        </DataTableHead>
    );
}
