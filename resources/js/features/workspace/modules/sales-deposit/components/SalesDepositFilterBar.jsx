import TableFilterBar from '@/features/workspace/shared/TableFilterBar';

export function SalesDepositFilterBar({ config, filters, setFilters }) {
    return (
        <TableFilterBar
            config={config}
            filters={filters}
            setFilters={setFilters}
        />
    );
}
