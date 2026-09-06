import TableFilterBar from '@/features/workspace/shared/TableFilterBar';

export default function JournalTableFilters({ table, filters, setFilters }) {
    return (
        <TableFilterBar
            table={table}
            filters={filters}
            setFilters={setFilters}
            filterClassName="h-[34px] min-w-[118px] rounded-[4px] border-ui-border"
        />
    );
}
