import TableFilterBar from '@/features/workspace/shared/TableFilterBar';

export default function TransferTableFilterBar({ table, filters, setFilters }) {
    return (
        <TableFilterBar
            table={table}
            filters={filters}
            setFilters={setFilters}
            selectClassName="px-3 text-[11px] sm:text-xs text-filter-select-text"
        />
    );
}

