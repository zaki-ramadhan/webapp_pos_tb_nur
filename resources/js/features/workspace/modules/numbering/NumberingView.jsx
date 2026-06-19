import { useMemo } from 'react';
import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';
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
        mappedRows,
        tableProps,
    } = useWorkspaceResource({
        resource: 'numbering-sequences',
        initialPerPage: 25,
        mapRow: mapNumberingRow,
    });

    const resolvedPage = useMemo(() => ({
        ...page,
        table: {
            ...page.table,
            ...tableProps,
            pageValue: tableProps.total.toLocaleString('id-ID'),
            filterOptions: page.table.filters?.[0]?.options ?? [],
        },
    }), [page, mappedRows, tableProps]);

    return mode === 'table' ? (
        <NumberingTableView table={resolvedPage.table} onCreate={onOpenContent} />
    ) : (
        <NumberingFormView form={resolvedPage.form} />
    );
}

