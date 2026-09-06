import TableFilterBar from '@/features/workspace/shared/TableFilterBar';

export default function ExpenseTableFilters({ table, filters, setFilters }) {
    return (
        <TableFilterBar
            table={table}
            filters={filters}
            setFilters={setFilters}
            filterClassName="h-[36px] w-[180px] rounded-[4px] border-ui-border"
            selectClassName="text-xs sm:text-sm text-brand-dark"
        />
    );
}
