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
    const hasAlign = /\btext-(left|center|right)\b/.test(className);
    const alignClass = hasAlign ? '' : 'text-left';
    return (
        <th
            className={`border-r border-tab-inactive-bg px-3 py-2 ${alignClass} text-xs font-normal leading-5 last:border-r-0 sm:px-4 sm:text-sm whitespace-nowrap truncate ${className}`.trim()}
            {...props}
        >
            <div className="w-full truncate block min-w-0">{children}</div>
        </th>
    );
}

export function DataTableCell({ className = '', children, ...props }) {
    return (
        <td className={`border-r border-table-cell-border px-3 py-2 text-sm leading-5 last:border-r-0 sm:px-4 ${className}`.trim()} {...props}>
            {children}
        </td>
    );
}
