import { useMemo } from 'react';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import PeriodEndFormView from './PeriodEndFormView';
import PeriodEndTableView from './PeriodEndTableView';

function mapPeriodEndRow(record) {
    return {
        id: record.id,
        name: record.document_number ?? record.name ?? '',
        inputDate: record.document_date ?? record.date ?? '',
        description: record.notes ?? record.description ?? '',
        monthValue: record.month_value ?? '',
        yearValue: record.year_value ?? '',
        tabLabel: record.document_number ?? record.name ?? '',
    };
}

export default function PeriodEndView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const {
        rows: backendRows,
        total,
        loading,
        error,
        reload,
        page: currentPage,
        perPage,
        setPage,
        setPerPage,
        lastPage,
        from,
        to
    } = useBackendIndexResource({
        resource: 'period-ends',
        initialPerPage: 25,
        enabled: true,
    });

    const mappedRows = useMemo(() => backendRows.map((row) => mapPeriodEndRow(row)), [backendRows]);

    const resolvedConfig = useMemo(() => {
        const baseConfig = page.periodEnd ?? {};
        const baseFilters = baseConfig.historyTable?.filters ?? [];
        const baseMonthOptions = baseFilters[0]?.options ?? [];
        const baseYearOptions = baseFilters[1]?.options ?? [];

        const existingMonths = new Set(baseMonthOptions.map(o => o.value));
        const existingYears = new Set(baseYearOptions.map(o => o.value));

        const monthFilterOptions = [...baseMonthOptions];
        mappedRows.forEach((row) => {
            if (row.monthValue && !existingMonths.has(row.monthValue)) {
                existingMonths.add(row.monthValue);
                monthFilterOptions.push({
                    value: row.monthValue,
                    label: `Bulan: ${row.name}`,
                });
            }
        });

        const yearFilterOptions = [...baseYearOptions];
        mappedRows.forEach((row) => {
            if (row.yearValue && !existingYears.has(row.yearValue)) {
                existingYears.add(row.yearValue);
                yearFilterOptions.push({
                    value: row.yearValue,
                    label: `Tahun: ${row.yearValue}`,
                });
            }
        });

        const filters = [
            { ...(baseFilters[0] ?? {}), options: monthFilterOptions },
            { ...(baseFilters[1] ?? {}), options: yearFilterOptions },
        ];

        return {
            ...baseConfig,
            historyTable: {
                ...baseConfig.historyTable,
                rows: mappedRows,
                filters,
                pageValue: total.toLocaleString('id-ID'),
                loading,
                refreshLabel: loading ? 'Memuat data...' : baseConfig.historyTable?.refreshLabel,
                emptyLabel: error || 'Belum ada data',
                onRefresh: reload,
                pagination: {
                    page: currentPage,
                    perPage,
                    total,
                    lastPage,
                    from,
                    to,
                    onPageChange: setPage,
                    onPerPageChange: setPerPage,
                },
            },
        };
    }, [page.periodEnd, mappedRows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage, loading, error, reload]);

    return mode === 'table' ? (
        <PeriodEndTableView config={resolvedConfig} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <PeriodEndFormView
            config={resolvedConfig}
            activeLevel2Tab={activeLevel2Tab}
            onRefresh={reload}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            backendRows={backendRows}
        />
    );
}
