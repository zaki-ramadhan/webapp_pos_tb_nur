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
        return {
            ...baseConfig,
            historyTable: {
                ...baseConfig.historyTable,
                rows: mappedRows,
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
        <PeriodEndFormView config={resolvedConfig} activeLevel2Tab={activeLevel2Tab} />
    );
}
