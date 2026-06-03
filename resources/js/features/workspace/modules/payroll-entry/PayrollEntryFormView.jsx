import { useCallback, useEffect, useMemo, useState } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';
import { PayrollAdditionalInfoSection, PayrollEmployeeSection, PayrollHeader } from './PayrollEntrySections';
import { buildDefaultValues } from './payrollEntryShared';
import { createBackendResource, getBackendErrorMessage } from '@/features/workspace/backend/workspaceBackendApi';
import {
    finishCrudLoadingToast,
    showCrudErrorToast,
    showCrudLoadingToast,
    showCrudSuccessToast,
} from '@/features/workspace/shared/crudFeedback';

export default function PayrollEntryFormView({ pageId, activeLevel2Tab, config, onOpenContent }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'employees');
    const [values, setValues] = useState(() => buildDefaultValues(config));
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'employees');
        setValues(buildDefaultValues(config));
        setErrors({});
    }, [config]);

    const initialComparable = useMemo(() => {
        const initialValues = buildDefaultValues(config);

        return {
            paymentType: initialValues.paymentType,
            branches: initialValues.branches,
            month: initialValues.month,
            year: initialValues.year,
            autoNumber: initialValues.autoNumber,
            numberingType: initialValues.numberingType,
            entryDate: initialValues.entryDate,
            dueDate: initialValues.dueDate,
            employeeLookup: initialValues.employeeLookup,
            liabilityAccounts: initialValues.liabilityAccounts,
            notes: initialValues.notes,
        };
    }, [config]);

    const currentComparable = useMemo(
        () => ({
            paymentType: values.paymentType,
            branches: values.branches,
            month: values.month,
            year: values.year,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            entryDate: values.entryDate,
            dueDate: values.dueDate,
            employeeLookup: values.employeeLookup,
            liabilityAccounts: values.liabilityAccounts,
            notes: values.notes,
        }),
        [values],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
                    { label: config.labels.branch, type: 'array', value: values.branches },
                    {
                        label: config.labels.numbering,
                        value: resolveDocumentRequirementValue(values.autoNumber, values.numberingType, ''),
                    },
                    { label: config.labels.entryDate, value: values.entryDate },
                    { label: config.labels.dueDate, value: values.dueDate },
                    {
                        label: config.additionalInfoFields.liabilityAccountLabel,
                        type: 'array',
                        value: values.liabilityAccounts,
                    },
                ],
                initialComparable,
                currentComparable,
            }),
        [
            config.additionalInfoFields.liabilityAccountLabel,
            config.labels.branch,
            config.labels.dueDate,
            config.labels.entryDate,
            config.labels.numbering,
            currentComparable,
            initialComparable,
            values.autoNumber,
            values.branches,
            values.dueDate,
            values.entryDate,
            values.liabilityAccounts,
            values.numberingType,
        ],
    );

    const handleSave = useCallback(async () => {
        setSaving(true);
        setErrors({});
        const loadingToastId = showCrudLoadingToast('Sedang menyimpan pencatatan gaji.');

        try {
            const payload = {
                entry_date: values.entryDate,
                due_date: values.dueDate,
                notes: values.notes,
                document_number: values.autoNumber ? null : 'MANUAL',
                status: 'Draft',
                metadata: {
                    payment_type: values.paymentType,
                    period_month: values.month,
                    period_year: values.year,
                    branches: values.branches,
                    liability_accounts: values.liabilityAccounts,
                }
            };

            await createBackendResource('payroll-entries', payload);
            
            finishCrudLoadingToast(loadingToastId);
            showCrudSuccessToast('Pencatatan gaji berhasil disimpan.');

            if (onOpenContent) {
                onOpenContent(null);
            }
        } catch (error) {
            finishCrudLoadingToast(loadingToastId);
            const message = getBackendErrorMessage(error);
            showCrudErrorToast(message);
            setErrors({ _form: message });
            
            if (error?.response?.data?.errors) {
                setErrors(prev => ({ ...prev, ...error.response.data.errors }));
            }
        } finally {
            setSaving(false);
        }
    }, [onOpenContent, values]);

    const dockActions = useMemo(
        () =>
            (config.dockActions ?? []).map((action) =>
                action.id === 'save'
                    ? {
                          ...action,
                          disabled: saveDisabled || saving,
                          items: action.items?.map(item => ({
                              ...item,
                              onClick: handleSave
                          })) ?? [],
                          onClick: handleSave
                      }
                    : action.id === 'document'
                    ? {
                          ...action,
                          icon: 'form',
                      }
                    : action,
            ),
        [config.dockActions, handleSave, saveDisabled, saving],
    );

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    return (
        <TransactionFormLayout
            header={<PayrollHeader config={{ ...config, errors }} values={values} setValues={setValues} />}
            sectionTabs={config.sectionTabs}
            activeSectionId={activeSectionId}
            onSectionChange={setActiveSectionId}
            dockActions={dockActions}
        >
            {activeSectionId === 'additional-info' ? (
                <PayrollAdditionalInfoSection config={{ ...config, errors }} values={values} setValues={setValues} />
            ) : (
                <PayrollEmployeeSection config={config} values={values} />
            )}
        </TransactionFormLayout>
    );
}
