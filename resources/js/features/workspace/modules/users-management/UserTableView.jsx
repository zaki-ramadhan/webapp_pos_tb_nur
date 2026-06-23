import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';

const USER_COLUMNS = [
    { id: 'name', label: 'Nama', align: 'left' },
    { id: 'phone', label: 'No. Handphone', align: 'left', widthClassName: 'w-[180px]' },
    { id: 'email', label: 'Email', align: 'left' },
    { id: 'isActiveLabel', label: 'Status', align: 'center', widthClassName: 'w-[100px]' },
    { id: 'accessType', label: 'Jenis Akses', align: 'left', widthClassName: 'w-[160px]' },
];

export default function UserTableView({ table, onRefresh, onCreate, onOpenDetail }) {
    const resolvedTable = {
        ...table,
        columns: USER_COLUMNS,
        rows: (table.rows ?? []).map((row) => ({
            ...row,
            isActiveLabel: row.isActive ? 'Aktif' : 'Nonaktif',
        })),
        onRefresh,
    };

    return (
        <ModuleTableTemplate
            table={resolvedTable}
            resourceName="users"
            exportFilename="daftar-pengguna"
            exportTitle="Laporan Daftar Pengguna"
            inactiveFilterKey="isActiveLabel"
            onCreate={onCreate}
            onOpenDetail={onOpenDetail}
            disableImport={true}
            disablePrint={true}
            disableColumnSettings={true}
        />
    );
}
