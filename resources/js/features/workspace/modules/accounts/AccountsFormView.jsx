import { useEffect, useMemo, useState, useRef } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SystemErrorModal from '@/components/ui/SystemErrorModal';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    getBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceFormDraftState } from '@/features/workspace/shared/hooks/useWorkspaceFormDraftState';
import { clearValidationErrors, executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import { buildAccountDetailRecord } from './accountsConfig';
import {
    AccountsChildrenTab,
    AccountsGeneralTab,
    AccountsHistoryTab,
    AccountsOpeningBalanceTab,
    AccountsOthersTab,
} from './AccountsFormSections';

import {
    buildAccountPayload,
    buildAccountSourceRecord,
    buildComparableFormValues,
    buildFormState,
    getRecordEffectiveBalance,
    openingBalanceLabel,
    shouldShowSaldoTab,
} from './accountsShared';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { TrashIcon } from '@/features/workspace/shared/Icons';

export default function AccountsFormView({ pageId, config, backendRows, activeLevel2Tab, onOpenDetail, onCloseTab, onReload }) {
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const isDetail = Boolean(recordId);
    
    const [freshRecord, setFreshRecord] = useState(null);

    useEffect(() => {
        if (!recordId) return;
        let isMounted = true;
        getBackendResource('accounts', recordId)
            .then((data) => {
                if (isMounted && data) {
                    setFreshRecord(data);
                }
            })
            .catch(() => {});
        return () => {
            isMounted = false;
        };
    }, [recordId]);

    const backendRecord = useMemo(
        () => freshRecord ?? backendRows.find((row) => String(row.id) === String(recordId)) ?? null,
        [backendRows, freshRecord, recordId],
    );
    const sourceRecord = useMemo(
        () => (isDetail
            ? (backendRecord ? buildAccountSourceRecord(backendRecord, config) : buildAccountDetailRecord(recordId, config))
            : config.createValues),
        [backendRecord, config, isDetail, recordId],
    );

    const [activeTabId, setActiveTabId] = useState('general');
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [reconciledErrorModal, setReconciledErrorModal] = useState({
        open: false,
        message: '',
    });
    const initialValues = useMemo(() => buildFormState(sourceRecord), [sourceRecord]);
    const {
        values,
        setValues,
        isDirty: hasChanges,
        markClean,
    } = useWorkspaceFormDraftState({
        initialValues,
        recordId: sourceRecord?.id ?? null,
        pageId: 'accounts',
        tabId: activeLevel2Tab?.id,
    });

    useEffect(() => {
        if (freshRecord) {
            const calculated = getRecordEffectiveBalance(freshRecord);
            setValues((current) => ({
                ...current,
                balanceLabel: openingBalanceLabel(calculated),
                negative: calculated < 0,
            }));
        }
    }, [freshRecord, setValues]);
    
    const { leftTabs, rightTabs } = useMemo(() => {
        if (isDetail) {
            const hasChildren = Boolean(
                backendRecord?.has_children ||
                (Array.isArray(backendRecord?.children) && backendRecord.children.length > 0)
            );

            if (hasChildren) {
                // Akun Induk pada tingkat berapapun tidak memiliki tab Histori:
                return {
                    leftTabs: [
                        { id: 'general', label: 'Informasi Umum' },
                        { id: 'others', label: 'Lain-lain' },
                        { id: 'children', label: 'Akun Anak' },
                    ],
                    rightTabs: [],
                };
            }

            // Akun tanpa akun anak (akun transaksi / akun reguler):
            const tabs = [
                { id: 'general', label: 'Informasi Umum' },
                { id: 'others', label: 'Lain-lain' },
            ];
            const accountType = values.type || backendRecord?.type || backendRecord?.account_type;
            if (shouldShowSaldoTab(accountType)) {
                tabs.splice(1, 0, { id: 'opening-balance', label: 'Saldo' });
            }
            return {
                leftTabs: tabs,
                rightTabs: [{ id: 'history', label: 'Histori' }],
            };
        }

        // Mode Tambah Data Baru:
        const createTabs = [
            { id: 'general', label: 'Informasi Umum' },
            { id: 'others', label: 'Lain-lain' },
        ];
        if (shouldShowSaldoTab(values.type)) {
            createTabs.splice(1, 0, { id: 'opening-balance', label: 'Saldo' });
        }
        return {
            leftTabs: createTabs,
            rightTabs: [],
        };
    }, [isDetail, backendRecord, values.type]);

    const activeTabInstanceId = activeLevel2Tab?.id;

    useEffect(() => {
        setActiveTabId('general');
        setStatus({ tone: '', message: '' });
        setDeleteModalOpen(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTabInstanceId, sourceRecord?.id]);

    const allTabs = useMemo(() => [...leftTabs, ...rightTabs], [leftTabs, rightTabs]);

    useEffect(() => {
        if (!allTabs.some((t) => t.id === activeTabId)) {
            setActiveTabId('general');
        }
    }, [allTabs, activeTabId]);

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
    const saveDisabled = saving || Boolean(validationMessage);

    async function handleSave() {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage, { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Menyimpan akun perkiraan...' : 'Membuat akun perkiraan...',
            successMessage: isDetail ? 'Akun perkiraan berhasil diperbarui.' : 'Akun perkiraan berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = buildAccountPayload(values);
                try {
                    const response = isDetail
                        ? await updateBackendResource('accounts', recordId, payload)
                        : await createBackendResource('accounts', payload);

                    return {
                        payload,
                        savedRecord: response?.data ?? null,
                    };
                } catch (err) {
                    const serverErrors = err?.response?.data?.errors;
                    const msg = err?.response?.data?.message || '';
                    const allMsgs = [msg, ...Object.values(serverErrors || {}).flat()];
                    const reconMsg = allMsgs.find(
                        (m) => typeof m === 'string' && m.includes('sudah dicocokkan dengan rekening koran')
                    );

                    if (reconMsg) {
                        clearValidationErrors();
                        setReconciledErrorModal({
                            open: true,
                            message: reconMsg,
                        });
                        const customErr = new Error('RECONCILED_LOCKED');
                        customErr.__isReconciliationLock = true;
                        throw customErr;
                    }
                    throw err;
                }
            },
            getErrorMessage: (error) => getBackendErrorMessage(error, 'Akun perkiraan gagal disimpan.'),
            onSuccess: async ({ payload, savedRecord }) => {
                if (typeof window !== 'undefined' && window.__clearBackendCache) {
                    window.__clearBackendCache(pageId);
                    window.__clearBackendCache('accounts');
                }
                await onReload?.();
                markClean();
                if (isDetail && savedRecord && activeLevel2Tab?.id) {
                    window.dispatchEvent(
                        new CustomEvent('workspace:update-tab-label', {
                            detail: {
                                pageId: pageId ?? 'accounts',
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
                    if (activeLevel2Tab?.id) {
                        onCloseTab?.(activeLevel2Tab.id);
                    }
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
            execute: async () => {
                try {
                    return await deleteBackendResource('accounts', recordId);
                } catch (err) {
                    const serverErrors = err?.response?.data?.errors;
                    const msg = err?.response?.data?.message || '';
                    const allMsgs = [msg, ...Object.values(serverErrors || {}).flat()];
                    const reconMsg = allMsgs.find(
                        (m) => typeof m === 'string' && m.includes('sudah dicocokkan dengan rekening koran')
                    );

                    if (reconMsg) {
                        clearValidationErrors();
                        setReconciledErrorModal({
                            open: true,
                            message: reconMsg,
                        });
                        const customErr = new Error('RECONCILED_LOCKED');
                        customErr.__isReconciliationLock = true;
                        throw customErr;
                    }
                    throw err;
                }
            },
            getErrorMessage: (error) => getBackendErrorMessage(error, 'Akun perkiraan gagal dihapus.'),
            onSuccess: async () => {
                await onReload?.();
                window.dispatchEvent(new CustomEvent('workspace:close-tab', { detail: { tabId: activeLevel2Tab?.id } }));
            },
        });
    }

    return (
        <ModuleFormTemplate
            validationMessage={validationMessage}
            form={{
                tabs: leftTabs,
                rightTabs: rightTabs,
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
                    <AccountsChildrenTab values={values} onOpenDetail={onOpenDetail} />
                ) : activeTabId === 'history' ? (
                    <AccountsHistoryTab
                        recordId={recordId}
                        openingBalanceValue={values.openingBalanceValue}
                        openingBalanceDate={values.openingBalanceDate}
                    />
                ) : (
                    <AccountsGeneralTab config={config} values={values} isDetail={isDetail} onChange={handleChange} excludeId={recordId} />
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

            <SystemErrorModal
                open={reconciledErrorModal.open}
                title="Peringatan"
                description=""
                message={reconciledErrorModal.message}
                confirmLabel="OK"
                onClose={() => {
                    clearValidationErrors();
                    setReconciledErrorModal({ open: false, message: '' });
                }}
                onConfirm={() => {
                    clearValidationErrors();
                    setReconciledErrorModal({ open: false, message: '' });
                }}
            />
        </ModuleFormTemplate>
    );
}

