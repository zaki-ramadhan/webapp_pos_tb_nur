import { useMemo } from 'react';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import NumberingFormView from './NumberingFormView';
import NumberingTableView from './NumberingTableView';

const TRANSACTION_TYPE_LABELS = {
    'project-material': 'Alokasi Bahan Proyek',
    'fixed-asset': 'Aset Tetap',
    'bank-proof': 'Nomor Bukti Kas/Bank',
    'sales-invoice': 'Faktur Penjualan',
};

function mapNumberingRow(record) {
    const userList = (record.users ?? [])
        .map((user) => user.name)
        .filter(Boolean)
        .join(', ');

    return {
        id: record.id,
        name: record.name ?? '',
        transactionTypeValue: record.transaction_type ?? '',
        transactionTypeLabel: TRANSACTION_TYPE_LABELS[record.transaction_type] ?? record.transaction_type ?? '',
        userScopeLabel: userList || 'Semua Pengguna',
        prefix: record.prefix ?? '',
        suffix: record.suffix ?? '',
        counterDigits: record.counter_digits ?? 5,
        sequenceType: record.sequence_type ?? '',
        components: record.components ?? [],
        userIds: (record.users ?? []).map((user) => user.id),
        isActive: record.is_active !== false,
    };
}

export default function NumberingView({ page, mode, onOpenContent }) {
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
        resource: 'numbering-sequences',
        initialPerPage: 25,
        enabled: true,
    });

    const mappedRows = useMemo(() => backendRows.map((row) => mapNumberingRow(row)), [backendRows]);

    const resolvedPage = useMemo(() => ({
        ...page,
        table: {
            ...page.table,
            rows: mappedRows,
            pageValue: total.toLocaleString('id-ID'),
            loading,
            refreshLabel: loading ? 'Memuat data...' : page.table?.refreshLabel,
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
    }), [page, mappedRows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage, loading, error, reload]);

    return mode === 'table' ? (
        <NumberingTableView table={resolvedPage.table} onCreate={onOpenContent} />
    ) : (
        <NumberingFormView form={resolvedPage.form} />
    );
}
