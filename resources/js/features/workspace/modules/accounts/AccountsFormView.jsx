import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import { buildAccountDetailRecord } from './accountsConfig';
import {
    AccountsChildrenTab,
    AccountsGeneralTab,
    AccountsOpeningBalanceTab,
    AccountsOthersTab,
} from './AccountsFormSections';
import {
    buildAccountPayload,
    buildAccountSourceRecord,
    buildComparableFormValues,
    buildFormState,
} from './accountsShared';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { TrashIcon } from '@/features/workspace/shared/Icons';

function shouldShowSaldoTab(type) {
    if (!type) return false;
    const normalized = type.toLowerCase().trim();
    const noSaldoTypes = [
        'piutang usaha',
        'piutang',
        'accounts receivable',
        'persediaan',
        'inventory',
        'aset tetap',
        'fixed asset',
        'fixed assets',
        'utang usaha',
        'utang',
        'accounts payable',
        'kewajiban',
    ];
    return !noSaldoTypes.includes(normalized);
}

export default function AccountsFormView({ pageId, config, backendRows, activeLevel2Tab, onOpenDetail, onCloseDetail, onReload }) {
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const isDetail = Boolean(recordId);
    
    const backendRecord = useMemo(
        () => backendRows.find((row) => String(row.id) === String(recordId)) ?? null,
        [backendRows, recordId],
    );
    const sourceRecord = useMemo(
        () => (isDetail
            ? (backendRecord ? buildAccountSourceRecord(backendRecord, config) : buildAccountDetailRecord(recordId, config))
            : config.createValues),
        [backendRecord, config, isDetail, recordId],
    );
    const [values, setValues] = useState(() => buildFormState(sourceRecord));
    
    const tabs = useMemo(() => {
        const baseTabs = isDetail
            ? [
                  { id: 'general', label: 'Informasi Umum' },
                  { id: 'others', label: 'Lain-lain' },
                  { id: 'children', label: 'Akun Anak' },
              ]
            : [
                  { id: 'general', label: 'Informasi Umum' },
                  { id: 'opening-balance', label: 'Saldo' },
                  { id: 'others', label: 'Lain-lain' },
              ];

        const showSaldo = shouldShowSaldoTab(values.type);

        if (showSaldo) {
            if (isDetail && !baseTabs.some((t) => t.id === 'opening-balance')) {
                return [
                    baseTabs[0],
                    { id: 'opening-balance', label: 'Saldo' },
                    ...baseTabs.slice(1),
                ];
            }
            return baseTabs;
        } else {
            return baseTabs.filter((t) => t.id !== 'opening-balance');
        }
    }, [isDetail, values.type]);

    const [activeTabId, setActiveTabId] = useState('general');
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const initialValues = useMemo(() => buildFormState(sourceRecord), [sourceRecord]);
    const hasChanges = useMemo(
        () => !areComparableValuesEqual(buildComparableFormValues(initialValues), buildComparableFormValues(values)),
        [initialValues, values],
    );

    const activeTabInstanceId = activeLevel2Tab?.id;

    useEffect(() => {
        setActiveTabId('general');
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteModalOpen(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTabInstanceId]);

    useEffect(() => {
        if (!tabs.some((t) => t.id === activeTabId)) {
            setActiveTabId('general');
        }
    }, [tabs, activeTabId]);

    useEffect(() => {
        if (!hasChanges) {
            setValues(initialValues);
        }
    }, [initialValues, hasChanges]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    const validationMessage = useMemo(() => {
        const isCodeRequired = !values.isSubAccount || !values.autoCode;
        const checks = [
            { label: config.labels.type, value: values.type },
            { label: config.labels.name, value: values.name },
        ];
        if (isCodeRequired) {
            checks.push({ label: config.labels.code, value: values.code });
        }
        return validateRequiredChecks(checks);
    }, [
        config.labels.code,
        config.labels.name,
        config.labels.type,
        values.code,
        values.name,
        values.type,
        values.isSubAccount,
        values.autoCode,
    ]);
    const saveDisabled = saving || Boolean(validationMessage && (validationMessage.includes('wajib diisi') || validationMessage.includes('wajib dipilih') || validationMessage.includes('wajib diisi minimal 1'))) || !hasChanges;

    useWorkspaceDirtyRegistration({
        pageId: 'accounts',
        tabId: activeLevel2Tab?.id,
        dirty: hasChanges,
        enabled: Boolean(activeLevel2Tab?.id),
    });

    async function handleSave() {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage, { setStatus });
            return;
        }

        if (!hasChanges) {
            rejectCrudFormAction('Belum ada perubahan untuk disimpan.', { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Menyimpan akun perkiraan...' : 'Membuat akun perkiraan...',
            successMessage: isDetail ? 'Akun perkiraan berhasil diperbarui.' : 'Akun perkiraan berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = buildAccountPayload(values);
                const response = isDetail
                    ? await updateBackendResource('accounts', recordId, payload)
                    : await createBackendResource('accounts', payload);

                return {
                    payload,
                    savedRecord: response?.data ?? null,
                };
            },
            getErrorMessage: (error) => getBackendErrorMessage(error, 'Akun perkiraan gagal disimpan.'),
            onSuccess: async ({ payload, savedRecord }) => {
                await onReload?.();
                if (isDetail && savedRecord && activeLevel2Tab?.id) {
                    window.dispatchEvent(
                        new CustomEvent('workspace:update-tab-label', {
                            detail: {
                                pageId: pageId ?? (typeof page !== 'undefined' ? page?.id : null),
                                tabId: activeLevel2Tab.id,
                                label: savedRecord?.name ?? savedRecord?.full_name ?? savedRecord?.countryName ?? savedRecord?.country_name ?? savedRecord?.number ?? values?.name ?? values?.fullName ?? values?.groupName ?? '',
                            },
                        })
                    );
                }

                if (!isDetail && savedRecord?.id) {
                    onOpenDetail?.({
                        recordId: String(savedRecord.id),
                        label: savedRecord.name ?? payload.name,
                        tabLabel: savedRecord.name ?? payload.name,
                    });
                }
            },
        });
    }

    async function handleDelete() {
        if (!recordId) {
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Menghapus akun perkiraan...',
            successMessage: 'Akun perkiraan berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteModalOpen(false),
            execute: () => deleteBackendResource('accounts', recordId),
            getErrorMessage: (error) => getBackendErrorMessage(error, 'Akun perkiraan gagal dihapus.'),
            onSuccess: async () => {
                await onReload?.();
                onCloseDetail?.(recordId);
            },
        });
    }

    return (
        <ModuleFormTemplate
            validationMessage={validationMessage}
            form={{
                tabs: tabs,
                saveLabel: 'Simpan',
            }}
            activeTabId={activeTabId}
            setActiveTabId={setActiveTabId}
            status={status}
            saving={saving}
            saveDisabled={saveDisabled}
            onSave={handleSave}
            actionsSlot={
                isDetail ? (
                    <DockActionButton
                        label={saving ? 'Memproses...' : 'Hapus'}
                        tone="danger"
                        icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                        disabled={saving}
                        onClick={() => setDeleteModalOpen(true)}
                    />
                ) : null
            }
        >
            <div className="flex-1 min-h-0">
                {activeTabId === 'opening-balance' ? (
                    <AccountsOpeningBalanceTab config={config} values={values} onChange={handleChange} />
                ) : activeTabId === 'others' ? (
                    <AccountsOthersTab config={config} values={values} isDetail={isDetail} onChange={handleChange} />
                ) : activeTabId === 'children' ? (
                    <AccountsChildrenTab values={values} />
                ) : (
                    <AccountsGeneralTab config={config} values={values} isDetail={isDetail} onChange={handleChange} />
                )}
            </div>

            <ConfirmationModal
                open={deleteModalOpen}
                title="Konfirmasi"
                message={
                    values.childAccounts && values.childAccounts.length > 0 ? (
                        `Apakah Anda yakin akan melakukan penghapusan data:\n${values.code} - ${values.name}\n\nAkun ini memiliki ${values.childAccounts.length} sub-akun yang akan terputus hubungannya (menjadi akun utama tanpa induk).`
                    ) : (
                        `Apakah Anda yakin akan melakukan penghapusan data:\n${values.code} - ${values.name}`
                    )
                }
                confirmLabel="Ya"
                confirmVariant="primary"
                confirmLoading={saving}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
            />
        </ModuleFormTemplate>
    );
}

