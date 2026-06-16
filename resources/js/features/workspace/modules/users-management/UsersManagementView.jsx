import { useEffect, useMemo, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import TextInput from '@/components/ui/TextInput';
import SectionTab from '@/features/workspace/shared/SectionTab';
import DockSaveButton from '@/features/workspace/shared/DockSaveButton';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import useBackendResource from '@/features/workspace/backend/useBackendResource';
import { mapUserRow, toUserPayload } from '@/features/workspace/backend/workspaceBackendAdapters';
import ReferenceLookupInput from '@/features/workspace/shared/ReferenceLookupInput';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { executeCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { getBackendErrorMessage } from '@/features/workspace/backend/workspaceBackendApi';
import RadioField from '@/components/ui/RadioField';

function UserFormView({ form, activeLevel2Tab, tableRows = [], onRefresh, onOpenDetail, lookupData }) {
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
        if (!recordId) {
            return null;
        }
        return tableRows.find((row) => String(row.id) === String(recordId)) ?? null;
    }, [activeLevel2Tab, tableRows]);

    const recordId = detailRow ? String(detailRow.id) : null;
    const isDetail = Boolean(recordId);

    const [values, setValues] = useState({
        name: detailRow?.name ?? '',
        email: detailRow?.email ?? '',
        phone: detailRow?.phone || detailRow?.email || '',
        password: '',
        isActive: detailRow?.isActive ?? true,
        accessGroupIds: detailRow?.accessGroupIds ?? [],
        accessType: (detailRow?.roleIds?.includes(1) || detailRow?.roleIds?.includes(2) || detailRow?.accessType?.toLowerCase()?.includes('admin')) ? 'administrator' : 'operator',
    });

    const [status, setStatus] = useState({ tone: '', message: '' });

    useEffect(() => {
        setValues({
            name: detailRow?.name ?? '',
            email: detailRow?.email ?? '',
            phone: detailRow?.phone || detailRow?.email || '',
            password: '',
            isActive: detailRow?.isActive ?? true,
            accessGroupIds: detailRow?.accessGroupIds ?? [],
            accessType: (detailRow?.roleIds?.includes(1) || detailRow?.roleIds?.includes(2) || detailRow?.accessType?.toLowerCase()?.includes('admin')) ? 'administrator' : 'operator',
        });
        setStatus({ tone: '', message: '' });
    }, [detailRow]);

    const [saving, setSaving] = useState(false);
    const { store, update } = useBackendResource({ resource: 'users' });

    const handleSave = async () => {
        const inputVal = values.phone.trim();
        if (!inputVal) {
            setStatus({ tone: 'error', message: 'No Handphone/Email wajib diisi.' });
            return;
        }

        const isEmailInput = inputVal.includes('@');
        let name = '';
        let email = '';
        let phone = '';

        if (isEmailInput) {
            email = inputVal;
            const matchingEmployee = lookupData.employees?.find(
                (emp) => emp.email?.toLowerCase() === inputVal.toLowerCase()
            );

            if (matchingEmployee) {
                name = matchingEmployee.full_name;
                phone = matchingEmployee.mobile_phone || matchingEmployee.whatsapp_phone || matchingEmployee.office_phone || '';
            } else {
                const prefix = inputVal.split('@')[0];
                name = `User ${prefix}`;
                phone = '';
            }
        } else {
            phone = inputVal;
            const normalizedPhone = inputVal.replace(/[^0-9]/g, '');
            const matchingEmployee = lookupData.employees?.find((emp) => {
                const empPhone = (emp.mobile_phone || emp.whatsapp_phone || emp.office_phone || '').replace(/[^0-9]/g, '');
                return empPhone && empPhone === normalizedPhone;
            });

            if (matchingEmployee) {
                name = matchingEmployee.full_name;
                email = matchingEmployee.email || `${normalizedPhone || 'user'}@example.com`;
            } else {
                name = `User ${inputVal}`;
                email = `${normalizedPhone || 'user'}@example.com`;
            }
        }

        const password = values.password || (isDetail ? undefined : 'password');
        const adminRole = lookupData.roles?.find(role => role.code === 'admin' || role.name?.toLowerCase()?.includes('admin'));
        const adminRoleId = adminRole ? adminRole.id : 2;
        const roleIds = values.accessType === 'administrator' ? [adminRoleId] : [];

        const payload = toUserPayload({
            ...values,
            name,
            email,
            phone,
            password,
            roleIds,
        });

        const { ok, result, errorMessage } = await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui pengguna.' : 'Sedang menyimpan pengguna baru.',
            successMessage: isDetail ? 'Pengguna berhasil diperbarui.' : 'Pengguna berhasil disimpan.',
            setSaving,
            setStatus,
            getErrorMessage: (err) => getBackendErrorMessage(err, 'Terjadi kesalahan saat menyimpan data.'),
            execute: () => isDetail ? update(recordId, payload) : store(payload),
            onSuccess: async (res) => {
                onRefresh?.();
                const record = res?.data ?? res;
                if (!isDetail && record?.id && onOpenDetail) {
                    onOpenDetail({
                        recordId: String(record.id),
                        label: record.name ?? inputVal,
                        tabLabel: record.name ?? inputVal,
                    });
                }
            },
        });
    };

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="shrink-0 px-1 pt-0.5">
                <div className="overflow-x-auto overflow-y-hidden border-b border-[#d5d9e1] bg-transparent pl-0 pr-2 pt-0">
                    <div className="flex w-max min-w-full items-end gap-[5px]">
                        <button
                            type="button"
                            className="relative -mb-px -mr-px inline-flex h-7.5 shrink-0 items-center rounded-t-[5px] border border-b-0 px-3 text-sm transition sm:h-8 sm:px-4 sm:text-sm md:h-8.5 md:text-base border-[#bcc4d0] border-t-[3px] border-t-[#ED3969] bg-white font-normal text-[#475569]"
                        >
                            <span className="block truncate">Pengguna</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 min-h-0 flex-col gap-4 lg:flex-row overflow-hidden pt-0">
                <div className="flex flex-1 min-h-0 flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] overflow-hidden px-4 py-4 -mt-px">
                    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                        <CrudStatusMessage status={status} className="mb-4 shrink-0" />

                        <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 pt-2">
                            <h2 className="text-[15px] text-[#111827] leading-normal font-normal mb-8">
                                Tambahkan pengguna untuk mengakses database ini dengan memasukkan no handphone/emailnya
                            </h2>

                            <div className="grid gap-x-8 gap-y-5 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
                                <label className="pt-2 text-xs sm:text-sm text-[#20273b] font-normal">
                                    No Handphone/Email <span className="text-[#ED3969]">*</span>
                                </label>
                                <div className="max-w-[420px] w-full">
                                    <TextInput
                                        value={values.phone}
                                        onChange={(e) => setValues({ ...values, phone: e.target.value })}
                                        placeholder=""
                                        className="h-[36px] w-full rounded-[4px] border-[#cfd6e2]"
                                        inputClassName="text-xs sm:text-sm"
                                    />
                                </div>

                                <label className="pt-1.5 text-xs sm:text-sm text-[#20273b] font-normal">
                                    Jenis Akses
                                </label>
                                <div className="grid gap-3">
                                    <div className="flex items-center gap-16 pt-0.5">
                                        <RadioField
                                            id="access-operator"
                                            name="access-type"
                                            label="Operator"
                                            checked={values.accessType === 'operator'}
                                            onChange={() => setValues({ ...values, accessType: 'operator' })}
                                            inputClassName="h-5 w-5"
                                            containerClassName="w-auto inline-flex items-center"
                                        />
                                        <RadioField
                                            id="access-admin"
                                            name="access-type"
                                            label="Administrator"
                                            checked={values.accessType === 'administrator'}
                                            onChange={() => setValues({ ...values, accessType: 'administrator' })}
                                            inputClassName="h-5 w-5"
                                            containerClassName="w-auto inline-flex items-center"
                                        />
                                    </div>
                                    {values.accessType === 'operator' && (
                                        <div className="flex items-center gap-3 pt-0.5 mt-1">
                                            <span className="block h-6 w-[5px] rounded-[2px] bg-[#9a9a9a]" aria-hidden="true" />
                                            <p className="text-xs sm:text-sm italic leading-6 text-[#ED3969]">
                                                Pengguna tipe Operator dapat melihat dan membuka database. Hak menunya ditentukan melalui Akses grup.
                                            </p>
                                        </div>
                                    )}
                                    {values.accessType === 'administrator' && (
                                        <div className="flex items-center gap-3 pt-0.5 mt-1">
                                            <span className="block h-6 w-[5px] rounded-[2px] bg-[#9a9a9a]" aria-hidden="true" />
                                            <p className="text-xs sm:text-sm italic leading-6 text-[#ED3969]">
                                                Administrator dapat mengelola pengaturan dan akses pengguna lain pada database ini.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <label className="pt-2 text-xs sm:text-sm text-[#20273b] font-normal">
                                    Akses Grup
                                </label>
                                <div className="max-w-[420px] w-full">
                                    <ReferenceLookupInput
                                        value={lookupData.groups?.find(g => g.id === values.accessGroupIds[0])?.name ?? ''}
                                        items={lookupData.groups ?? []}
                                        placeholder="Cari/Pilih..."
                                        searchLabel="Cari grup akses"
                                        getOptionLabel={(option) => option.name ?? ''}
                                        getOptionSearchText={(option) => option.name ?? ''}
                                        onSelect={(group) => setValues({ ...values, accessGroupIds: [group.id] })}
                                        onClear={() => setValues({ ...values, accessGroupIds: [] })}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 flex-row justify-start gap-3 self-start lg:flex-col lg:w-[112px] lg:items-center pt-3 lg:pt-4">
                    <DockSaveButton
                        label={saving ? 'Memproses...' : form.saveLabel}
                        disabled={saving}
                        onClick={handleSave}
                        tone="muted"
                    />
                </div>
            </div>
        </div>
    );
}

function UserTableView({ table, onRefresh, onCreate, onOpenDetail }) {
    const [keyword, setKeyword] = useState('');
    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        if (!normalizedKeyword) {
            return table.rows;
        }

        return table.rows.filter((row) => {
            const searchCols = table.columns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label);
            return searchCols.slice(0, 2).some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [keyword, table.rows]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                createButton={{ label: table.createLabel, onClick: onCreate }}
                refreshButton={{ label: table.refreshLabel, onClick: onRefresh }}
                menuButton={{
                    label: table.actionsLabel,
                    items: [
                        { id: 'export', label: 'Ekspor Data' },
                        { id: 'reload', label: 'Muat Ulang', onClick: onRefresh },
                    ],
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[344px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={table.pageValue}
            />

            <div className="mt-3 min-h-0">
                <DataTable>
                    <DataTableHeader>
                        <tr>
                            <DataTableHead className="w-[50px] px-3 py-2.5 text-center text-base font-medium text-white">
                                No.
                            </DataTableHead>
                            {table.columns.map((column) => (
                                <DataTableHead key={column}>{column}</DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.length ? (
                            filteredRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className="cursor-pointer"
                                    onClick={() =>
                                        onOpenDetail?.({
                                            recordId: String(row.id),
                                            label: row.name,
                                            tabLabel: row.tabLabel,
                                        })
                                    }
                                >
                                    <DataTableCell className="px-3 text-center text-base text-[#646d83]">
                                        {index + 1}
                                    </DataTableCell>
                                    <DataTableCell>{formatTableTextValue(row.name)}</DataTableCell>
                                    <DataTableCell>{formatTableTextValue(row.phone)}</DataTableCell>
                                    <DataTableCell>{formatTableTextValue(row.email)}</DataTableCell>
                                    <DataTableCell className="text-center">
                                        {row.isActive ? (
                                            <span className="text-[#1f9d55] font-medium">Aktif</span>
                                        ) : (
                                            <span className="text-slate-400">Nonaktif</span>
                                        )}
                                    </DataTableCell>
                                    <DataTableCell>{formatTableTextValue(row.accessType)}</DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={table.columns.length + 1} className="px-3 py-8 text-center text-base text-[#131a28]">
                                    Belum ada data
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>

            {table.pagination ? (
                <Pagination
                    page={table.pagination.page}
                    perPage={table.pagination.perPage}
                    total={table.pagination.total}
                    lastPage={table.pagination.lastPage}
                    from={table.pagination.from}
                    to={table.pagination.to}
                    onPageChange={table.pagination.onPageChange}
                    onPerPageChange={table.pagination.onPerPageChange}
                    className="mt-3"
                />
            ) : null}
        </div>
    );
}

export default function UsersManagementView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
}) {
    const {
        rows,
        total,
        loading,
        reload,
        page: currentPage,
        perPage,
        setPage,
        setPerPage,
        lastPage,
        from,
        to
    } = useBackendIndexResource({
        resource: 'users',
        initialPerPage: 25,
    });

    const groupsResource = useBackendIndexResource({
        resource: 'access-groups',
        initialPerPage: 25,
    });

    const rolesResource = useBackendIndexResource({
        resource: 'roles',
        initialPerPage: 25,
    });

    const employeesResource = useBackendIndexResource({
        resource: 'employees',
        initialPerPage: 250,
    });

    const resolvedTable = useMemo(() => ({
        ...page.table,
        rows: rows.map(mapUserRow),
        pageValue: total.toLocaleString('id-ID'),
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
        refreshLabel: loading ? 'Memuat...' : page.table.refreshLabel,
    }), [loading, page.table, rows, total]);

    return mode === 'table' ? (
        <UserTableView
            table={resolvedTable}
            onRefresh={reload}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    ) : (
        <UserFormView
            form={page.form}
            tableRows={resolvedTable.rows}
            activeLevel2Tab={activeLevel2Tab}
            onRefresh={reload}
            onOpenDetail={onOpenDetail}
            lookupData={{
                groups: groupsResource.rows,
                roles: rolesResource.rows,
                employees: employeesResource.rows,
            }}
        />
    );
}
