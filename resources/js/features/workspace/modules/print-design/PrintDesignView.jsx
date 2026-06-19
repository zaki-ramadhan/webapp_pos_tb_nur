import { useEffect, useMemo, useState } from 'react';

import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { TrashIcon } from '@/features/workspace/shared/Icons';
import { executeCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';

function PrintDesignFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[170px_1fr] lg:items-center">
            <label className="text-xs sm:text-sm text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function PrintDesignFormView({ pageId, form, detailRow, activeLevel2Tab, onCloseDetail }) {
    const isDetail = Boolean(detailRow);
    const initialValues = useMemo(() => {
        if (detailRow) {
            return {
                name: detailRow.designName ?? '',
                type: detailRow.transactionTypeValue ?? '',
                allUsers: detailRow.userList === 'Semua Pengguna',
            };
        }
        return {
            name: form.defaults?.name ?? '',
            type: form.defaults?.type ?? form.typeOptions?.[0]?.value ?? '',
            allUsers: Boolean(form.userAccess?.allUsersChecked),
        };
    }, [detailRow, form]);

    const [values, setValues] = useState(initialValues);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    useEffect(() => {
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
    }, [initialValues]);

    const isDirty = useMemo(() => {
        return (
            values.name !== initialValues.name ||
            values.type !== initialValues.type ||
            values.allUsers !== initialValues.allUsers
        );
    }, [values, initialValues]);

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    const handleSave = async () => {
        if (!values.name.trim()) {
            setStatus({ tone: 'error', message: 'Nama Desain wajib diisi.' });
            return;
        }
        if (!values.type) {
            setStatus({ tone: 'error', message: 'Tipe wajib diisi.' });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Menyimpan perubahan desain...' : 'Menyimpan desain cetakan...',
            successMessage: isDetail ? 'Desain cetakan berhasil diperbarui.' : 'Desain cetakan berhasil disimpan.',
            setSaving,
            setStatus,
            execute: () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 600)),
        });
    };

    const handleDelete = async () => {
        setDeleteConfirmationOpen(false);
        await executeCrudFormAction({
            loadingMessage: 'Menghapus desain cetakan...',
            successMessage: 'Desain cetakan berhasil dihapus.',
            setSaving,
            setStatus,
            execute: () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 600)),
            onSuccess: () => {
                onCloseDetail?.(activeLevel2Tab?.recordId);
            },
        });
    };

    const actionsSlot = isDetail ? (
        <DockActionButton
            label="Hapus"
            icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
            tone="danger"
            onClick={() => setDeleteConfirmationOpen(true)}
        />
    ) : null;

    return (
        <>
            <ModuleFormTemplate
                form={form}
                saving={saving}
                saveDisabled={saving || !isDirty}
                status={status}
                onSave={handleSave}
                actionsSlot={actionsSlot}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-w-[980px]">
                    <div className="space-y-3.5">
                        <div className="border-b border-[#d9dee8] pb-1.5 mb-2">
                            <h3 className="text-base font-semibold text-[#1f2436]">Informasi Cetakan</h3>
                        </div>

                        <PrintDesignFieldRow label="Nama Desain" required>
                            <TextInput
                                value={values.name}
                                onChange={(event) => setValues(prev => ({ ...prev, name: event.target.value }))}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-xs sm:text-sm text-[#1f2436]"
                            />
                        </PrintDesignFieldRow>

                        <PrintDesignFieldRow label="Tipe" required>
                            <SelectField
                                value={values.type}
                                onChange={(event) => setValues(prev => ({ ...prev, type: event.target.value }))}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                selectClassName="text-xs sm:text-sm text-[#1f2436]"
                            >
                                {form.typeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </SelectField>
                        </PrintDesignFieldRow>
                    </div>

                    <div className="space-y-3.5">
                        <div className="border-b border-[#d9dee8] pb-1.5 mb-2">
                            <h3 className="text-base font-semibold text-[#1f2436]">Akses Pengguna</h3>
                        </div>

                        <div className="pt-2 lg:pl-[170px]">
                            <CheckboxField
                                id="print-design-all-users"
                                label={form.userAccess.allUsersLabel}
                                checked={values.allUsers}
                                onChange={(event) => setValues(prev => ({ ...prev, allUsers: event.target.checked }))}
                                align="center"
                                labelClassName="text-sm font-medium text-[#1f2436]"
                                inputClassName="mt-0 h-[18px] w-[18px]"
                            />
                        </div>
                    </div>
                </div>
            </ModuleFormTemplate>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                title="Hapus Desain Cetakan"
                message={`Apakah Anda yakin ingin menghapus desain cetakan "${initialValues.name}"?`}
                confirmLabel="Hapus"
                confirmTone="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirmationOpen(false)}
            />
        </>
    );
}

function PrintDesignTableView({ table, onCreate, onOpenDetail }) {
    return (
        <ModuleTableTemplate
            table={table}
            resourceName="print-designs"
            exportFilename="desain_cetakan"
            exportTitle="Laporan Desain Cetakan"
            inactiveFilterKey="transactionTypeValue"
            onCreate={onCreate}
            onOpenDetail={onOpenDetail}
        />
    );
}

export default function PrintDesignView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
}) {
    const resolvedTable = useMemo(() => {
        const rows = (page.table?.rows ?? []).map((row) => ({
            ...row,
            name: row.designName,
            tabLabel: row.designName,
        }));

        return {
            ...page.table,
            rows,
            filterOptions: page.table.filters?.[0]?.options ?? [],
        };
    }, [page.table]);

    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
        if (!recordId) return null;
        return (page.table?.rows ?? []).find((r) => String(r.id) === String(recordId)) ?? null;
    }, [activeLevel2Tab, page.table?.rows]);

    return mode === 'table' ? (
        <PrintDesignTableView
            table={resolvedTable}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    ) : (
        <PrintDesignFormView
            pageId={page.id}
            form={page.form}
            detailRow={detailRow}
            activeLevel2Tab={activeLevel2Tab}
            onCloseDetail={onCloseDetail}
        />
    );
}

