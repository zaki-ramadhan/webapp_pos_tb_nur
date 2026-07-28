export function SalesDepositTableCell({ row, column }) {
    return <span className="block truncate">{row[column.id] ?? ''}</span>;
}
