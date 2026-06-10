export function DataTable({ className = '', wrapperClassName = '', children, ...props }) {
    return (
        <div
            className={`w-full overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-[4px] border border-table-border ${wrapperClassName}`.trim()}
        >
            <table className={`w-full min-w-full border-collapse ${className}`.trim()} {...props}>
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

export function DataTableHead({ className = '', children, ...props }) {
    return (
        <th
            className={`border-r border-white/20 px-3 py-2 text-center text-[12px] font-medium leading-5 last:border-r-0 sm:px-4 sm:text-[13px] ${className}`.trim()}
            {...props}
        >
            {children}
        </th>
    );
}

export function DataTableCell({ className = '', children, ...props }) {
    return (
        <td className={`border-r border-table-cell-border px-3 py-2 text-[14px] leading-5 last:border-r-0 sm:px-4 sm:text-[15px] ${className}`.trim()} {...props}>
            {children}
        </td>
    );
}
