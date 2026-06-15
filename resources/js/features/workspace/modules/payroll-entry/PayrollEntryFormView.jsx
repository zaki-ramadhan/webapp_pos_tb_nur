import { useCallback, useEffect, useMemo, useState } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { TransactionFormLayout, TransactionDualTotalCard } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';
import { PayrollAdditionalInfoSection, PayrollEmployeeSection, PayrollHeader } from './PayrollEntrySections';
import { buildDefaultValues } from './payrollEntryShared';
import CopyEmployeesModal from './CopyEmployeesModal';
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
    const [employeeRows, setEmployeeRows] = useState([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [copyModalOpen, setCopyModalOpen] = useState(false);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'employees');
        setValues(buildDefaultValues(config));
        setEmployeeRows(config.employeeTable?.rows ?? []);
        setErrors({});
    }, [pageId]);

    const initialComparable = useMemo(() => {
        const initialValues = buildDefaultValues(config);

        return {
            paymentType: initialValues.paymentType,
            month: initialValues.month,
            year: initialValues.year,
            autoNumber: initialValues.autoNumber,
            numberingType: initialValues.numberingType,
            entryDate: initialValues.entryDate,
            dueDate: initialValues.dueDate,
            employeeLookup: initialValues.employeeLookup,
            liabilityAccounts: initialValues.liabilityAccounts,
            notes: initialValues.notes,
            employeeRows: config.employeeTable?.rows ?? [],
        };
    }, [config]);

    const currentComparable = useMemo(
        () => ({
            paymentType: values.paymentType,
            month: values.month,
            year: values.year,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            entryDate: values.entryDate,
            dueDate: values.dueDate,
            employeeLookup: values.employeeLookup,
            liabilityAccounts: values.liabilityAccounts,
            notes: values.notes,
            employeeRows,
        }),
        [values, employeeRows],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
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
                    {
                        label: config.employeeSectionTitle || 'Rincian Karyawan',
                        type: 'array',
                        value: employeeRows,
                    },
                ],
                initialComparable,
                currentComparable,
            }),
        [
            config.additionalInfoFields.liabilityAccountLabel,
            config.labels.dueDate,
            config.labels.entryDate,
            config.labels.numbering,
            config.employeeSectionTitle,
            currentComparable,
            initialComparable,
            values.autoNumber,
            values.dueDate,
            values.entryDate,
            values.liabilityAccounts,
            values.numberingType,
            employeeRows,
        ],
    );

    const handleCopyEmployees = useCallback((newEmployees) => {
        setEmployeeRows((prev) => {
            const existingIds = new Set(prev.map((emp) => emp.employeeId));
            const filteredNew = newEmployees.filter((emp) => !existingIds.has(emp.employeeId));
            return [...prev, ...filteredNew];
        });
    }, []);

    const { totalGross, totalPaid } = useMemo(() => {
        return employeeRows.reduce(
            (acc, row) => {
                const gross = typeof row.grossIncomeRaw === 'number' ? row.grossIncomeRaw : parseFloat(String(row.grossIncome ?? '').replace(/[^0-9.-]+/g, '')) || 0;
                const paid = typeof row.paidSalaryRaw === 'number' ? row.paidSalaryRaw : parseFloat(String(row.paidSalary ?? '').replace(/[^0-9.-]+/g, '')) || 0;
                acc.totalGross += gross;
                acc.totalPaid += paid;
                return acc;
            },
            { totalGross: 0, totalPaid: 0 }
        );
    }, [employeeRows]);

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
                },
                lines: employeeRows.map((row, index) => {
                    const gross = typeof row.grossIncomeRaw === 'number' ? row.grossIncomeRaw : parseFloat(String(row.grossIncome ?? '').replace(/[^0-9.-]+/g, '')) || 0;
                    const tax = typeof row.incomeTaxRaw === 'number' ? row.incomeTaxRaw : parseFloat(String(row.incomeTax ?? '').replace(/[^0-9.-]+/g, '')) || 0;
                    const paid = typeof row.paidSalaryRaw === 'number' ? row.paidSalaryRaw : parseFloat(String(row.paidSalary ?? '').replace(/[^0-9.-]+/g, '')) || 0;

                    return {
                        description: row.employeeName,
                        quantity: 1,
                        unit_price: gross,
                        tax_amount: tax,
                        total_amount: paid,
                        sort_order: index,
                        attributes: {
                            employee_id: row.employeeId,
                            employee_code: row.employeeCode,
                            employee_name: row.employeeName,
                        }
                    };
                })
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
    }, [onOpenContent, values, employeeRows]);

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

    const resolvedConfig = useMemo(() => {
        return {
            ...config,
            employeeTable: {
                ...config.employeeTable,
                rows: employeeRows,
            },
            summaryItems: [
                {
                    id: 'gross-income',
                    label: 'Pendapatan Bruto',
                    value: `Rp ${totalGross.toLocaleString('id-ID')}`,
                },
                {
                    id: 'paid-salary',
                    label: 'Gaji dibayarkan',
                    value: `Rp ${totalPaid.toLocaleString('id-ID')}`,
                },
            ],
        };
    }, [config, employeeRows, totalGross, totalPaid]);

    return (
        <>
            <TransactionFormLayout
                header={<PayrollHeader config={{ ...config, errors }} values={values} setValues={setValues} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                footer={<TransactionDualTotalCard items={resolvedConfig.summaryItems} className="min-w-[360px] sm:min-w-[565px]" />}
                dockActions={dockActions}
            >
                {activeSectionId === 'additional-info' ? (
                    <PayrollAdditionalInfoSection config={{ ...config, errors }} values={values} setValues={setValues} />
                ) : (
                    <PayrollEmployeeSection
                        config={resolvedConfig}
                        values={values}
                        setValues={setValues}
                        onTake={() => setCopyModalOpen(true)}
                    />
                )}
            </TransactionFormLayout>
            <CopyEmployeesModal
                open={copyModalOpen}
                onClose={() => setCopyModalOpen(false)}
                onConfirm={handleCopyEmployees}
            />
        </>
    );
}
