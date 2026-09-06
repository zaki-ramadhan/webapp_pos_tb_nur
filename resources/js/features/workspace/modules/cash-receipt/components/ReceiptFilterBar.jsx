import TableFilterBar from '@/features/workspace/shared/TableFilterBar';

export function ReceiptFilterBar({ table, filters, setFilters }) {
    return (
        <TableFilterBar
            table={table}
            filters={filters}
            setFilters={setFilters}
            selectClassName="px-3 text-[11px] sm:text-xs text-filter-select-text"
        />
    );
}
