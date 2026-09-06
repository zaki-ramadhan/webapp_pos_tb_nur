import TableFilterBar from '@/features/workspace/shared/TableFilterBar';

export function PurchasePaymentTableFilterBar({ table, filters, setFilters }) {
    return (
        <TableFilterBar
            table={table}
            filters={filters}
            setFilters={setFilters}
            className="flex w-full flex-wrap items-center gap-2"
        />
    );
}
