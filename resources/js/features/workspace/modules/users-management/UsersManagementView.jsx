import { useEffect, useMemo, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import TextInput from '@/components/ui/TextInput';
import SectionTab from '@/features/workspace/shared/SectionTab';
import PanelActions from '@/features/workspace/shared/PanelActions';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { SearchIcon } from '@/features/workspace/shared/Icons';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import useBackendResource from '@/features/workspace/backend/useBackendResource';
import { mapUserRow, toUserPayload } from '@/features/workspace/backend/workspaceBackendAdapters';
import SelectField from '@/components/ui/SelectField';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { executeCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { getBackendErrorMessage } from '@/features/workspace/backend/workspaceBackendApi';

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
        phone: detailRow?.phone ?? '',
        password: '',
        isActive: detailRow?.isActive ?? true,
        accessGroupIds: detailRow?.accessGroupIds ?? [],
    });

    const [status, setStatus] = useState({ tone: '', message: '' });

    useEffect(() => {
        setValues({
            name: detailRow?.name ?? '',
            email: detailRow?.email ?? '',
            phone: detailRow?.phone ?? '',
            password: '',
            isActive: detailRow?.isActive ?? true,
            accessGroupIds: detailRow?.accessGroupIds ?? [],
        });
        setStatus({ tone: '', message: '' });
    }, [detailRow]);

    const [saving, setSaving] = useState(false);
    const { store, update } = useBackendResource({ resource: 'users' });

    const handleSave = async () => {
        if (!values.name.trim()) {
            setStatus({ tone: 'error', message: 'Nama Lengkap wajib diisi.' });
            return;
        }
        if (!values.email.trim()) {
            setStatus({ tone: 'error', message: 'Email wajib diisi.' });
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(values.email.trim())) {
            setStatus({ tone: 'error', message: 'Format email tidak valid.' });
            return;
        }

        const payload = toUserPayload(values);
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
                        label: record.name ?? values.name.trim(),
                        tabLabel: record.name ?? values.name.trim(),
                    });
                }
            },
        });
    };

    const actions = [
        {
            id: 'save',
            label: form.saveLabel,
            icon: 'save',
            tone: 'primary',
            onClick: handleSave,
            loading: saving,
            disabled: saving,
            showLabel: true,
        },
    ];

    return (
        <div className="relative flex min-h-full flex-col">
            <div className="px-1 pt-0.5">
                <SectionTab
                    label={form.sectionLabel}
                    tone="accent"
                    className="h-[34px]"
                />
            </div>

            <div className="flex-1 rounded-[4px] border border-[#cfd6e2] bg-white px-3 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                <div className="flex flex-wrap items-start justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="max-w-[1100px] text-xl font-medium leading-8 text-[#111827]">
                            {isDetail ? `Ubah Pengguna: ${values.name}` : form.title}
                        </h2>
                        {isDetail && (
                            <p className="text-sm text-slate-500">ID Pengguna: {recordId}</p>
                        )}
                    </div>
                    <PanelActions actions={actions} />
                </div>

                <CrudStatusMessage status={status} className="mb-6 mt-4" />

                <div className="mt-8 grid gap-x-8 gap-y-6 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
                    <label className="pt-3 text-xs sm:text-sm text-[#20273b]">
                        Nama Lengkap <span className="text-[#ED3969]">*</span>
                    </label>
                    <TextInput
                        value={values.name}
                        onChange={(e) => setValues({ ...values, name: e.target.value })}
                        placeholder="Masukkan nama lengkap"
                        className="h-[42px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm"
                    />

                    <label className="pt-3 text-xs sm:text-sm text-[#20273b]">
                        Email <span className="text-[#ED3969]">*</span>
                    </label>
                    <TextInput
                        value={values.email}
                        onChange={(e) => setValues({ ...values, email: e.target.value })}
                        placeholder="email@contoh.com"
                        className="h-[42px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm"
                        disabled={isDetail}
                    />

                    <label className="pt-3 text-xs sm:text-sm text-[#20273b]">
                        No. Telepon
                    </label>
                    <TextInput
                        value={values.phone}
                        onChange={(e) => setValues({ ...values, phone: e.target.value })}
                        placeholder="Contoh: 08123456789"
                        className="h-[42px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm"
                    />

                    <label className="pt-3 text-xs sm:text-sm text-[#20273b]">
                        Kata Sandi {isDetail && '(Kosongkan jika tidak diubah)'}
                    </label>
                    <TextInput
                        type="password"
                        value={values.password}
                        onChange={(e) => setValues({ ...values, password: e.target.value })}
                        placeholder="Min. 8 karakter"
                        className="h-[42px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm"
                    />

                    <label className="pt-3 text-xs sm:text-sm text-[#20273b]">
                        Grup Akses
                    </label>
                    <div className="grid gap-3">
                        <SelectField
                            value={values.accessGroupIds[0] ?? ''}
                            onChange={(e) => setValues({ ...values, accessGroupIds: e.target.value ? [parseInt(e.target.value)] : [] })}
                            className="h-[42px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-xs sm:text-sm"
                        >
                            <option value="">Pilih Grup Akses...</option>
                            {lookupData.groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </SelectField>
                        <p className="text-sm italic text-slate-500">
                            Pengguna akan mendapatkan hak akses sesuai dengan grup yang dipilih.
                        </p>
                    </div>

                    <label className="pt-3 text-xs sm:text-sm text-[#20273b]">
                        Status Akun
                    </label>
                    <div className="flex items-center gap-6 pt-3">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked={values.isActive}
                                onChange={() => setValues({ ...values, isActive: true })}
                                className="h-5 w-5 text-[#2f62ab]"
                            />
                            <span>Aktif</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked={!values.isActive}
                                onChange={() => setValues({ ...values, isActive: false })}
                                className="h-5 w-5 text-[#2f62ab]"
                            />
                            <span>Nonaktif</span>
                        </label>
                    </div>
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

        return table.rows.filter((row) =>
            [row.name, row.phone, row.email, row.accessType].some((value) =>
                String(value ?? '').toLowerCase().includes(normalizedKeyword),
            ),
        );
    }, [keyword, table.rows]);

    return (
        <div className="min-h-full rounded-[4px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
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

            <div className="mt-3">
                <DataTable>
                    <DataTableHeader>
                        <tr>
                            {table.columns.map((column) => (
                                <DataTableHead key={column}>{column}</DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.map((row) => (
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
                        ))}
                    </DataTableBody>
                </DataTable>
            </div>
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
    const { rows, total, loading, reload } = useBackendIndexResource({
        resource: 'users',
        filters: { per_page: 100 },
    });

    const groupsResource = useBackendIndexResource({
        resource: 'access-groups',
        filters: { per_page: 100 },
    });

    const resolvedTable = useMemo(() => ({
        ...page.table,
        rows: rows.map(mapUserRow),
        pageValue: total.toLocaleString('id-ID'),
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
            }}
        />
    );
}
