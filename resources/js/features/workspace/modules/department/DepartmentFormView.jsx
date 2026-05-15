import { useEffect, useMemo, useState } from 'react';

import CheckboxField from '@/components/ui/CheckboxField';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import DockSaveButton from '@/features/workspace/shared/DockSaveButton';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import ReferenceLookupInput from '@/features/workspace/shared/ReferenceLookupInput';
import { SortIcon, TrashIcon } from '@/features/workspace/shared/Icons';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';

function buildDefaultValues(form, detailRow = null) {
    const detailUsers = detailRow?.users ?? [];

    return {
        name: detailRow?.name ?? form.defaults?.name ?? '',
        description: detailRow?.notes ?? form.defaults?.description ?? '',
        isSubDepartment: Boolean(detailRow?.parentDepartmentId),
        parentDepartmentId: detailRow?.parentDepartmentId ?? null,
        parentDepartmentName: detailRow?.parentDepartmentName ?? '',
        openingDate: form.defaults?.openingDate ?? '',
        openingBalanceKeyword: '',
        allUsers: !(detailRow?.userIds?.length),
        userScopeBranchId: null,
        userScopeBranchLabel: '',
        selectedUserIds: detailUsers.map((user) => user.id),
        selectedUserLabels: detailUsers.map((user) => user.name ?? user.email ?? `User #${user.id}`),
        __backendRecordId: detailRow?.id ?? null,
        __code: detailRow?.code ?? '',
    };
}

function buildDepartmentSnapshot(values) {
    return {
        name: values.name,
        description: values.description,
        isSubDepartment: values.isSubDepartment,
        parentDepartmentId: values.parentDepartmentId,
        allUsers: values.allUsers,
        selectedUserIds: [...(values.selectedUserIds ?? [])].sort((left, right) => Number(left) - Number(right)),
    };
}

function buildDepartmentCode(name, currentCode = '') {
    if (String(currentCode ?? '').trim()) {
        return String(currentCode).trim();
    }

    const baseSlug = String(name ?? '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 18);
    const suffix = Date.now().toString().slice(-6);

    return `DEPT-${baseSlug || 'AUTO'}-${suffix}`;
}

function validateDepartmentValues(values, form) {
    const requiredMessage = validateRequiredChecks([
        { label: form.labels.name, value: values.name },
    ]);

    if (requiredMessage) {
        return requiredMessage;
    }

    if (values.isSubDepartment && !values.parentDepartmentId) {
        return 'Parent departemen wajib dipilih saat Sub Dept. aktif.';
    }

    if (!values.allUsers && !(values.selectedUserIds ?? []).length) {
        return 'Pilih minimal satu pengguna saat Semua Pengguna tidak aktif.';
    }

    return '';
}

function DepartmentFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,570px)] lg:items-start">
            <label className="pt-2 text-[17px] leading-6 text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function renderReferenceOptionPrimary(item, secondaryText = '') {
    return (
        <div className="min-w-0">
            <div className="truncate text-[15px] text-[#131a28]">{item.label}</div>
            {secondaryText ? (
                <div className="mt-1 truncate text-[13px] text-[#7d879a]">{secondaryText}</div>
            ) : null}
        </div>
    );
}

function DepartmentGeneralTab({ form, values, onChange, parentDepartmentOptions }) {
    return (
        <div className="space-y-6">
            <DepartmentFieldRow label={form.labels.name} required>
                <TextInput
                    value={values.name}
                    onChange={(event) => onChange('name', event.target.value)}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-[15px] text-[#1f2436]"
                />
            </DepartmentFieldRow>

            <DepartmentFieldRow label={form.labels.description}>
                <TextareaField
                    value={values.description}
                    onChange={(event) => onChange('description', event.target.value)}
                    rows={4}
                    className="rounded-[4px] border-[#cfd6e2]"
                    textareaClassName="min-h-[70px] text-[15px] text-[#1f2436]"
                />
            </DepartmentFieldRow>

            <div className="lg:pl-[280px]">
                <CheckboxField
                    id="department-sub-department"
                    label={form.labels.subDepartment}
                    checked={values.isSubDepartment}
                    onChange={(event) => onChange('isSubDepartment', event.target.checked)}
                    align="center"
                    labelClassName="text-[17px]"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />
            </div>

            {values.isSubDepartment ? (
                <DepartmentFieldRow label={form.labels.subDepartment}>
                    <ReferenceLookupInput
                        value={values.parentDepartmentName}
                        items={parentDepartmentOptions}
                        placeholder="Cari/Pilih..."
                        searchLabel="Cari parent departemen"
                        className="max-w-[710px]"
                        getOptionLabel={(option) => option.label}
                        getOptionSearchText={(option) => option.searchText}
                        renderOption={(option) => renderReferenceOptionPrimary(option, option.code)}
                        onSelect={(option) => onChange('parentDepartment', option)}
                        onClear={() => onChange('parentDepartment', null)}
                    />
                </DepartmentFieldRow>
            ) : null}
        </div>
    );
}

function DepartmentOpeningBalanceTable({ openingBalance, keyword }) {
    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();
        const normalizedTokens = normalizedKeyword
            .replace(/[\[\]]/g, ' ')
            .split(/\s+/)
            .filter(Boolean);

        return openingBalance.rows.filter((row) => {
            if (!normalizedKeyword) {
                return true;
            }

            const searchableValue = [row.code, row.name, row.value]
                .map((value) => String(value ?? '').toLowerCase())
                .join(' ');

            return normalizedTokens.every((token) => searchableValue.includes(token));
        });
    }, [keyword, openingBalance.rows]);

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[720px]">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {openingBalance.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white`.trim()}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                                        <span>{column.label}</span>
                                    </span>
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.length ? (
                            filteredRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'} border-[#dde1e8]`.trim()}
                                >
                                    <DataTableCell className="px-3 text-[15px] text-[#131a28]">
                                        {formatTableTextValue(row.code)}
                                    </DataTableCell>
                                    <DataTableCell className="px-3 text-[15px] text-[#131a28]">
                                        {formatTableTextValue(row.name)}
                                    </DataTableCell>
                                    <DataTableCell className="px-3 text-right text-[15px] text-[#131a28]">
                                        {formatTableTextValue(row.value)}
                                    </DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell
                                    colSpan={openingBalance.columns.length}
                                    className="px-3 py-3 text-center text-[15px] text-[#131a28]"
                                >
                                    {openingBalance.emptyLabel}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

function DepartmentOpeningBalanceTab({ form, values, onChange }) {
    const openingBalance = form.openingBalance;

    return (
        <div className="space-y-6">
            <h3 className="text-[24px] font-normal leading-none text-[#1f2436]">{openingBalance.title}</h3>

            <div className="grid gap-3 sm:grid-cols-[140px_266px] sm:items-center">
                <label className="text-[17px] text-[#1f2436]">{openingBalance.dateLabel}</label>
                <TransactionDateInput
                    value={values.openingDate}
                    onChange={(nextValue) => onChange('openingDate', nextValue)}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-[15px] text-[#1f2436]"
                    trailingClassName="w-[42px] shrink-0 justify-center px-0"
                />
            </div>

            <div className="max-w-[420px]">
                <AccountLookupTextInput
                    value={values.openingBalanceKeyword}
                    placeholder={openingBalance.accountPlaceholder}
                    searchLabel="Cari akun perkiraan saldo awal"
                    dialogTitle="Pilih Akun Perkiraan Saldo Awal"
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-[15px] text-[#1f2436]"
                    trailingClassName="px-2.5"
                    onSelectAccount={(_, label) => onChange('openingBalanceKeyword', label ?? '')}
                />
            </div>

            <DepartmentOpeningBalanceTable
                openingBalance={openingBalance}
                keyword={values.openingBalanceKeyword}
            />
        </div>
    );
}

function DepartmentUsersTab({ form, values, onChange, branchOptions, userOptions }) {
    const filteredUserOptions = useMemo(() => {
        if (!values.userScopeBranchId) {
            return userOptions;
        }

        return userOptions.filter((option) => option.branchIds.includes(values.userScopeBranchId));
    }, [userOptions, values.userScopeBranchId]);

    return (
        <div className="space-y-5">
            <div className="border-b border-[#d9dee8] pb-2.5">
                <h3 className="text-[18px] font-medium text-[#1f2436]">{form.userAccess.title}</h3>
            </div>

            <CheckboxField
                id="department-all-users"
                label={form.userAccess.allUsersLabel}
                checked={values.allUsers}
                onChange={(event) => onChange('allUsers', event.target.checked)}
                align="center"
                labelClassName="text-[17px]"
                inputClassName="mt-0 h-[18px] w-[18px]"
                containerClassName="w-auto"
            />

            {!values.allUsers ? (
                <div className="space-y-4">
                    <div className="pt-1">
                        <h3 className="text-[18px] font-medium text-[#1f2436]">
                            {form.userAccess.limitedTitle ?? 'Tentukan pengguna yang dapat memilih departemen ini'}
                        </h3>
                    </div>

                    <DepartmentFieldRow label={form.userAccess.groupBranchLabel ?? 'Grup/Cabang'}>
                        <ReferenceLookupInput
                            value={values.userScopeBranchLabel}
                            items={branchOptions}
                            placeholder={form.userAccess.groupBranchPlaceholder ?? 'Cari/Pilih...'}
                            searchLabel="Cari grup atau cabang"
                            className="max-w-[1220px]"
                            getOptionLabel={(option) => option.label}
                            getOptionSearchText={(option) => option.searchText}
                            renderOption={(option) => renderReferenceOptionPrimary(option, option.code)}
                            onSelect={(option) => onChange('userScopeBranch', option)}
                            onClear={() => onChange('userScopeBranch', null)}
                        />
                    </DepartmentFieldRow>

                    <DepartmentFieldRow label={form.userAccess.userLabel ?? 'Pengguna'}>
                        <div className="space-y-2">
                            <ReferenceLookupInput
                                values={values.selectedUserLabels}
                                items={filteredUserOptions}
                                placeholder={form.userAccess.userPlaceholder ?? 'Cari/Pilih...'}
                                searchLabel="Cari pengguna"
                                className="max-w-[1220px]"
                                getOptionLabel={(option) => option.label}
                                getOptionSearchText={(option) => option.searchText}
                                renderOption={(option) => renderReferenceOptionPrimary(option, option.email || option.branchLabels.join(', '))}
                                onSelect={(option) => onChange('selectedUser', option)}
                                onRemove={(label) => onChange('removeSelectedUser', label)}
                            />
                            {!values.selectedUserLabels.length ? (
                                <p className="text-[13px] text-[#7d879a]">
                                    Pilih pengguna yang diizinkan memakai departemen ini.
                                </p>
                            ) : null}
                        </div>
                    </DepartmentFieldRow>
                </div>
            ) : null}
        </div>
    );
}

export default function DepartmentFormView({
    pageId,
    form,
    tableRows = [],
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

        if (!recordId) {
            return null;
        }

        return tableRows.find((row) => String(row.id) === String(recordId)) ?? null;
    }, [activeLevel2Tab, tableRows]);
    const [activeTabId, setActiveTabId] = useState(form.tabs?.[0]?.id ?? 'department-general');
    const initialValues = useMemo(() => buildDefaultValues(form, detailRow), [detailRow, form]);
    const [values, setValues] = useState(() => initialValues);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const isDetailMode = Boolean(detailRow);
    const parentDepartmentOptions = useMemo(
        () => (form.lookupOptions?.parentDepartments ?? [])
            .filter((row) => String(row.id) !== String(values.__backendRecordId ?? ''))
            .map((row) => ({
                id: row.id,
                label: row.name,
                code: row.code,
                searchText: [row.name, row.code].filter(Boolean).join(' '),
            })),
        [form.lookupOptions, values.__backendRecordId],
    );
    const branchOptions = useMemo(
        () => (form.lookupOptions?.branches ?? []).map((option) => ({
            ...option,
            branchIds: [option.id],
        })),
        [form.lookupOptions],
    );
    const userOptions = useMemo(
        () => (form.lookupOptions?.users ?? []).map((option) => ({
            ...option,
            branchIds: option.branchIds ?? [],
        })),
        [form.lookupOptions],
    );

    useEffect(() => {
        setActiveTabId(form.tabs?.[0]?.id ?? 'department-general');
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [form, initialValues]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => {
            if (field === 'isSubDepartment') {
                return {
                    ...currentValues,
                    isSubDepartment: Boolean(nextValue),
                    parentDepartmentId: nextValue ? currentValues.parentDepartmentId : null,
                    parentDepartmentName: nextValue ? currentValues.parentDepartmentName : '',
                };
            }

            if (field === 'parentDepartment') {
                return {
                    ...currentValues,
                    parentDepartmentId: nextValue?.id ?? null,
                    parentDepartmentName: nextValue?.label ?? '',
                };
            }

            if (field === 'allUsers') {
                return {
                    ...currentValues,
                    allUsers: Boolean(nextValue),
                    userScopeBranchId: nextValue ? null : currentValues.userScopeBranchId,
                    userScopeBranchLabel: nextValue ? '' : currentValues.userScopeBranchLabel,
                    selectedUserIds: nextValue ? [] : currentValues.selectedUserIds,
                    selectedUserLabels: nextValue ? [] : currentValues.selectedUserLabels,
                };
            }

            if (field === 'userScopeBranch') {
                return {
                    ...currentValues,
                    userScopeBranchId: nextValue?.id ?? null,
                    userScopeBranchLabel: nextValue?.label ?? '',
                };
            }

            if (field === 'selectedUser') {
                if (!nextValue?.id || currentValues.selectedUserIds.includes(nextValue.id)) {
                    return currentValues;
                }

                return {
                    ...currentValues,
                    selectedUserIds: [...currentValues.selectedUserIds, nextValue.id],
                    selectedUserLabels: [...currentValues.selectedUserLabels, nextValue.label],
                };
            }

            if (field === 'removeSelectedUser') {
                const removeIndex = currentValues.selectedUserLabels.findIndex((label) => label === nextValue);

                if (removeIndex < 0) {
                    return currentValues;
                }

                return {
                    ...currentValues,
                    selectedUserIds: currentValues.selectedUserIds.filter((_, index) => index !== removeIndex),
                    selectedUserLabels: currentValues.selectedUserLabels.filter((_, index) => index !== removeIndex),
                };
            }

            return {
                ...currentValues,
                [field]: nextValue,
            };
        });
    }

    const validationMessage = useMemo(() => validateDepartmentValues(values, form), [form, values]);
    const isDirty = useMemo(
        () => !areComparableValuesEqual(buildDepartmentSnapshot(values), buildDepartmentSnapshot(initialValues)),
        [initialValues, values],
    );
    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    async function handleSave() {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage, { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetailMode ? 'Sedang memperbarui departemen.' : 'Sedang menyimpan departemen.',
            successMessage: isDetailMode ? 'Departemen berhasil diperbarui.' : 'Departemen berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = {
                    code: buildDepartmentCode(values.name, values.__code),
                    name: values.name.trim(),
                    notes: values.description.trim() || null,
                    parent_department_id: values.isSubDepartment ? values.parentDepartmentId : null,
                    is_active: true,
                    user_ids: values.allUsers ? [] : values.selectedUserIds,
                };
                const response = isDetailMode && values.__backendRecordId
                    ? await updateBackendResource('departments', values.__backendRecordId, payload)
                    : await createBackendResource('departments', payload);

                return response?.data ?? null;
            },
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async (record) => {
                await onRefresh?.();

                if (!isDetailMode && record?.id) {
                    onOpenDetail?.({
                        recordId: String(record.id),
                        label: record.name ?? values.name.trim(),
                        tabLabel: record.name ?? values.name.trim(),
                    });
                }
            },
        });
    }

    function requestDelete() {
        if (!values.__backendRecordId || saving) {
            return;
        }

        setDeleteConfirmationOpen(true);
    }

    async function handleDelete() {
        if (!values.__backendRecordId) {
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Sedang menghapus departemen.',
            successMessage: 'Departemen berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('departments', values.__backendRecordId),
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(values.__backendRecordId);
                onOpenContent?.();
            },
        });
    }

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <PreferencesTabs
                tabs={form.tabs}
                activeTabId={activeTabId}
                onSelectTab={setActiveTabId}
            />

            <div className="flex min-h-[640px] flex-col gap-5 px-4 py-4 xl:flex-row xl:items-start">
                <div className="order-2 min-w-0 flex-1 xl:order-1">
                    <CrudStatusMessage status={status} />

                    {activeTabId === 'department-opening-balance' ? (
                        <DepartmentOpeningBalanceTab form={form} values={values} onChange={handleChange} />
                    ) : activeTabId === 'department-users' ? (
                        <DepartmentUsersTab
                            form={form}
                            values={values}
                            onChange={handleChange}
                            branchOptions={branchOptions}
                            userOptions={userOptions}
                        />
                    ) : (
                        <DepartmentGeneralTab
                            form={form}
                            values={values}
                            onChange={handleChange}
                            parentDepartmentOptions={parentDepartmentOptions}
                        />
                    )}
                </div>

                <div className="order-1 flex justify-end gap-3 xl:order-2 xl:shrink-0 xl:flex-col">
                    <DockSaveButton
                        label={saving ? 'Memproses...' : form.saveLabel}
                        disabled={saveDisabled}
                        onClick={handleSave}
                    />
                    {isDetailMode ? (
                        <DockActionButton
                            label={saving ? 'Memproses...' : 'Hapus'}
                            tone="danger"
                            icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                            disabled={saving}
                            onClick={requestDelete}
                        />
                    ) : null}
                </div>
            </div>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Departemen"
                message="Departemen ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </div>
    );
}
