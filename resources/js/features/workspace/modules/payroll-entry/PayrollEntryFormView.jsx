import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
 
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import PayrollEntryEmployeeModal from './PayrollEntryEmployeeModal';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { useTransactionDetailLoader } from '@/features/workspace/shared/hooks/useTransactionDetailLoader';
import { TransactionFormLayout, TransactionDualTotalCard } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { showSuccessToast, showErrorToast } from '@/components/feedback/toast';
import {
    areComparableValuesEqual,
    validateRequiredChecks,
} from '@/features/workspace/shared/formValidation';
import { PayrollAdditionalInfoSection, PayrollEmployeeSection, PayrollHeader } from './PayrollEntrySections';
import { buildDefaultValues, buildGeneratedPayrollEntryNumber } from './payrollEntryShared';
import CopyEmployeesModal from './CopyEmployeesModal';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
    getBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useTransactionForm } from '@/features/workspace/shared/hooks/useTransactionForm';
import { normalizeDisplayDate } from '@/features/workspace/backend/adapters/dateHelpers';

export default function PayrollEntryFormView({
    pageId,
    activeLevel2Tab,
    config,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
    buildRecord,
}) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'employees');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const [sourceRecord, setLocalRecord, isLoading] = useTransactionDetailLoader({
        resourceName: 'payroll-entries',
        activeRecordId,
        buildRecord,
        config,
    });

    const [values, setValues] = useState(() => {
        const initial = sourceRecord ? sourceRecord : buildDefaultValues(config);
        return {
            ...buildDefaultValues(config),
            ...initial,
        };
    });
    const [employeeRows, setEmployeeRows] = useState(() => sourceRecord?.employeeRows ?? []);
    const [copyModalOpen, setCopyModalOpen] = useState(false);

    const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
    const [selectedEmployeeRow, setSelectedEmployeeRow] = useState(null);

    const isDetail = Boolean(values.__backendRecordId ?? activeRecordId);

    const configRef = useRef(config);
    configRef.current = config;

    const initialComparable = useMemo(() => {
        const cfg = configRef.current;
        const initial = sourceRecord ? sourceRecord : buildDefaultValues(cfg);
        const resolved = {
            ...buildDefaultValues(cfg),
            ...initial,
        };

        return {
            paymentType: resolved.paymentType,
            month: resolved.month,
            year: resolved.year,
            autoNumber: resolved.autoNumber,
            numberingType: resolved.numberingType,
            documentNumber: resolved.documentNumber,
            entryDate: resolved.entryDate,
            dueDate: resolved.dueDate,
            employeeLookup: resolved.employeeLookup,
            liabilityAccounts: resolved.liabilityAccounts,
            notes: resolved.notes,
            employeeRows: initial.employeeRows ?? [],
        };
    }, [sourceRecord]);

    const currentComparable = useMemo(
        () => ({
            paymentType: values.paymentType,
            month: values.month,
            year: values.year,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            documentNumber: values.documentNumber,
            entryDate: values.entryDate,
            dueDate: values.dueDate,
            employeeLookup: values.employeeLookup,
            liabilityAccounts: values.liabilityAccounts,
            notes: values.notes,
            employeeRows,
        }),
        [values, employeeRows],
    );

    const lastInitialComparableRef = useRef(initialComparable);

    useEffect(() => {
        const cfg = configRef.current;
        const initial = sourceRecord ? sourceRecord : buildDefaultValues(cfg);
        const nextValues = {
            ...buildDefaultValues(cfg),
            ...initial,
        };
        const nextEmployeeRows = sourceRecord?.employeeRows ?? [];

        setValues((current) => {
            const userHasEdited = !areComparableValuesEqual(lastInitialComparableRef.current, {
                paymentType: current.paymentType,
                month: current.month,
                year: current.year,
                autoNumber: current.autoNumber,
                numberingType: current.numberingType,
                documentNumber: current.documentNumber,
                entryDate: current.entryDate,
                dueDate: current.dueDate,
                employeeLookup: current.employeeLookup,
                liabilityAccounts: current.liabilityAccounts,
                notes: current.notes,
                employeeRows,
            });
            return userHasEdited ? current : nextValues;
        });

        setEmployeeRows((current) => {
            const userHasEdited = !areComparableValuesEqual(lastInitialComparableRef.current, {
                paymentType: values.paymentType,
                month: values.month,
                year: values.year,
                autoNumber: values.autoNumber,
                numberingType: values.numberingType,
                documentNumber: values.documentNumber,
                entryDate: values.entryDate,
                dueDate: values.dueDate,
                employeeLookup: values.employeeLookup,
                liabilityAccounts: values.liabilityAccounts,
                notes: values.notes,
                employeeRows: current,
            });
            return userHasEdited ? current : nextEmployeeRows;
        });

        lastInitialComparableRef.current = initialComparable;
    }, [sourceRecord, initialComparable]);

    const validationMessage = useMemo(() => {
        const requiredMessage = validateRequiredChecks([
            { label: config.labels.paymentType, value: values.paymentType },
            { label: config.labels.periodMonth, value: values.month },
            { label: config.labels.periodYear, value: values.year },
            { label: config.labels.entryDate, value: values.entryDate },
            isDetail
                ? { label: config.labels.numbering, value: values.documentNumber }
                : { label: 'Tipe penomoran', value: values.numberingType },
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
        ]);

        if (requiredMessage) {
            return requiredMessage;
        }

        const invalidRow = employeeRows.find((row) => {
            const gross = typeof row.grossIncomeRaw === 'number' ? row.grossIncomeRaw : (parseAmountInput(row.grossIncome) ?? 0);
            return !row.employeeId || gross <= 0;
        });

        if (invalidRow) {
            return 'Setiap rincian karyawan wajib memiliki pendapatan bruto lebih dari 0.';
        }

        return '';
    }, [config, values, employeeRows, isDetail]);

    const isDirty = useMemo(
        () => !areComparableValuesEqual(lastInitialComparableRef.current, currentComparable),
        [currentComparable]
    );

    const {
        status,
        saving,
        deleteConfirmationOpen,
        setDeleteConfirmationOpen,
        handleSave,
        requestDelete,
        handleDelete,
    } = useTransactionForm({ validationMessage });

    const saveDisabled = saving || !isDirty || Boolean(validationMessage && (validationMessage.includes('wajib diisi') || validationMessage.includes('wajib dipilih') || validationMessage.includes('wajib diisi minimal 1')));

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

    const onDelete = useCallback(async () => {
        if (!values.__backendRecordId) {
            return;
        }

        await handleDelete({
            loadingMessage: 'Sedang menghapus pencatatan gaji.',
            successMessage: 'Pencatatan gaji berhasil dihapus.',
            execute: () => deleteBackendResource('payroll-entries', values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                if (isDetail && record && activeLevel2Tab?.id) {
                    window.dispatchEvent(
                        new CustomEvent('workspace:update-tab-label', {
                            detail: {
                                pageId: pageId ?? (typeof page !== 'undefined' ? page?.id : null),
                                tabId: activeLevel2Tab.id,
                                label: record?.name ?? record?.full_name ?? record?.countryName ?? record?.country_name ?? record?.number ?? values?.name ?? values?.fullName ?? values?.groupName ?? '',
                            },
                        })
                    );
                }
                if (onCloseDetail) {
                    onCloseDetail(activeLevel2Tab?.id);
                } else if (onOpenContent) {
                    onOpenContent(null);
                }
            },
        });
    }, [values.__backendRecordId, handleDelete, onRefresh, onCloseDetail, activeLevel2Tab, onOpenContent]);

    const onSave = useCallback(async () => {
        await handleSave({
            loadingMessage: isDetail ? 'Sedang memperbarui pencatatan gaji.' : 'Sedang menyimpan pencatatan gaji.',
            successMessage: isDetail ? 'Pencatatan gaji berhasil diperbarui.' : 'Pencatatan gaji berhasil disimpan.',
            execute: async () => {
                const resolvedDocumentNumber = isDetail
                    ? values.documentNumber
                    : buildGeneratedPayrollEntryNumber();

                const totalAmount = employeeRows.reduce((sum, row) => {
                    const paid = typeof row.paidSalaryRaw === 'number' ? row.paidSalaryRaw : parseFloat(String(row.paidSalary ?? '').replace(/[^0-9.-]+/g, '')) || 0;
                    return sum + paid;
                }, 0);

                const payload = {
                    entry_date: normalizeDisplayDate(values.entryDate) || new Date().toISOString().slice(0, 10),
                    due_date: normalizeDisplayDate(values.dueDate) || null,
                    notes: values.notes,
                    document_number: resolvedDocumentNumber,
                    status: values.status ?? 'Draft',
                    primary_account_id: values.__liabilityAccountId,
                    total_amount: totalAmount,
                    metadata: {
                        payment_type: values.paymentType,
                        period_month: values.month,
                        period_year: values.year,
                        branches: values.branches,
                        liability_accounts: values.liabilityAccounts,
                        liability_account_id: values.__liabilityAccountId,
                    },
                    lines: employeeRows.map((row, index) => {
                        const gross = typeof row.grossIncomeRaw === 'number' ? row.grossIncomeRaw : parseFloat(String(row.grossIncome ?? '').replace(/[^0-9.-]+/g, '')) || 0;
                        const tax = typeof row.incomeTaxRaw === 'number' ? row.incomeTaxRaw : parseFloat(String(row.incomeTax ?? '').replace(/[^0-9.-]+/g, '')) || 0;
                        const paid = typeof row.paidSalaryRaw === 'number' ? row.paidSalaryRaw : parseFloat(String(row.paidSalary ?? '').replace(/[^0-9.-]+/g, '')) || 0;

                        return {
                            id: row.__lineId ?? undefined,
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
                                pensionAllowance: row.pensionAllowance ?? 0,
                                basicSalary: row.basicSalary ?? 0,
                                taxAllowance: row.taxAllowance ?? 0,
                                positionAllowance: row.positionAllowance ?? 0,
                                mealAllowance: row.mealAllowance ?? 0,
                                transportAllowance: row.transportAllowance ?? 0,
                                telecommunicationAllowance: row.telecommunicationAllowance ?? 0,
                                overtimeAllowance: row.overtimeAllowance ?? 0,
                                healthPremiAllowance: row.healthPremiAllowance ?? 0,
                                jkkAllowance: row.jkkAllowance ?? 0,
                                jkmAllowance: row.jkmAllowance ?? 0,
                                salaryReduction: row.salaryReduction ?? 0,
                                monthlyDeduction: row.monthlyDeduction ?? 0,
                                installmentDeduction: row.installmentDeduction ?? 0,
                                pensionDeduction: row.pensionDeduction ?? 0,
                                healthPremiDeduction: row.healthPremiDeduction ?? 0,
                                notes: row.notes ?? '',
                            }
                        };
                    })
                };

                const response = isDetail && values.__backendRecordId
                    ? await updateBackendResource('payroll-entries', values.__backendRecordId, payload)
                    : await createBackendResource('payroll-entries', payload);

                return {
                    record: response?.data ?? null,
                    resolvedDocumentNumber,
                };
            },
            onSuccess: async ({ record, resolvedDocumentNumber }) => {
                await onRefresh?.();

                if (record) {
                    const parsed = buildRecord ? buildRecord(record, config) : record;
                    setLocalRecord(parsed);
                    window.__savedRecordsCache = window.__savedRecordsCache || {};
                    window.__savedRecordsCache[String(record.id)] = parsed;
                }

                if (!isDetail && record?.id && onOpenDetail) {
                    onOpenDetail({
                        recordId: String(record.id),
                        label: record.document_number ?? resolvedDocumentNumber,
                        tabLabel: record.document_number ?? resolvedDocumentNumber,
                    });
                }
            },
        });
    }, [isDetail, values, employeeRows, handleSave, onRefresh, buildRecord, config, onOpenDetail]);

    const onRequestDelete = useCallback(() => {
        if (!values.__backendRecordId) {
            return;
        }
        requestDelete();
    }, [values.__backendRecordId, requestDelete]);

    const dockActions = useMemo(() => {
        const baseActions = config.dockActions ?? [];

        return baseActions
            .filter((action) => (isDetail ? true : action.id !== 'delete'))
            .map((action) => {
                if (action.id === 'save') {
                    return {
                        ...action,
                        tone: 'primary',
                        disabled: saveDisabled || saving,
                        items: action.items?.map(item => ({
                            ...item,
                            onClick: onSave
                        })) ?? [],
                        onClick: onSave
                    };
                }

                if (action.id === 'delete') {
                    return {
                        ...action,
                        disabled: saving,
                        onClick: onRequestDelete,
                    };
                }

                return action;
            });
    }, [config.dockActions, isDetail, saveDisabled, saving, onSave, onRequestDelete]);

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

    const [warningModalOpen, setWarningModalOpen] = useState(false);

    const addEmployeeToRows = useCallback((emp) => {
        setEmployeeRows((prev) => {
            const existingIds = new Set(prev.map((r) => String(r.employeeId)));
            if (existingIds.has(String(emp.id))) {
                showErrorToast({ message: `Karyawan ${emp.full_name ?? emp.name} sudah ada di daftar.` });
                return prev;
            }
            return [
                ...prev,
                {
                    id: String(emp.id),
                    employeeId: emp.id,
                    employeeCode: emp.employee_code ?? '',
                    employeeName: emp.full_name ?? emp.name ?? '',
                    grossIncomeRaw: 0,
                    grossIncome: '',
                    incomeTaxRaw: 0,
                    incomeTax: '',
                    paidSalaryRaw: 0,
                    paidSalary: '',
                    pensionAllowance: 0,
                    basicSalary: 0,
                    taxAllowance: 0,
                    positionAllowance: 0,
                    mealAllowance: 0,
                    transportAllowance: 0,
                    telecommunicationAllowance: 0,
                    overtimeAllowance: 0,
                    healthPremiAllowance: 0,
                    jkkAllowance: 0,
                    jkmAllowance: 0,
                    salaryReduction: 0,
                    monthlyDeduction: 0,
                    installmentDeduction: 0,
                    pensionDeduction: 0,
                    healthPremiDeduction: 0,
                    notes: '',
                }
            ];
        });
    }, []);

    const handlers = useMemo(
        () => ({
            onEditEmployeeRow: (row) => {
                setSelectedEmployeeRow(row);
                setEmployeeModalOpen(true);
            },
            onSelectEmployee: (emp) => {
                if (!emp) return;
                if (!values.liabilityAccounts || values.liabilityAccounts.length === 0) {
                    setWarningModalOpen(true);
                    return;
                }
                const existingIds = new Set(employeeRows.map((r) => String(r.employeeId)));
                if (existingIds.has(String(emp.id))) {
                    showErrorToast({ message: `Karyawan ${emp.full_name ?? emp.name} sudah ada di daftar.` });
                    return;
                }
                setSelectedEmployeeRow({
                    id: String(emp.id),
                    employeeId: emp.id,
                    employeeCode: emp.employee_code ?? '',
                    employeeName: emp.full_name ?? emp.name ?? '',
                    isNewRow: true,
                });
                setEmployeeModalOpen(true);
            },
            onProcessGaji: (formValues) => {
                if (!formValues.__backendRecordId) return;

                window.__pendingImportPayrollEntry = { id: formValues.__backendRecordId };

                window.dispatchEvent(
                    new CustomEvent('workspace:open-page', {
                        detail: {
                            pageId: 'cash-payment',
                            targetTabId: 'cash-payment-create',
                        },
                    })
                );
            },
        }),
        [values.liabilityAccounts, employeeRows],
    );

    const handleSaveEmployee = useCallback((gross, tax, paid, breakdown) => {
        setEmployeeRows((current) => {
            if (selectedEmployeeRow?.isNewRow) {
                return [
                    ...current,
                    {
                        id: String(selectedEmployeeRow.employeeId),
                        employeeId: selectedEmployeeRow.employeeId,
                        employeeCode: selectedEmployeeRow.employeeCode ?? '',
                        employeeName: selectedEmployeeRow.employeeName ?? '',
                        grossIncomeRaw: gross,
                        grossIncome: gross.toLocaleString('id-ID'),
                        incomeTaxRaw: tax,
                        incomeTax: tax.toLocaleString('id-ID'),
                        paidSalaryRaw: paid,
                        paidSalary: paid.toLocaleString('id-ID'),
                        ...breakdown,
                    }
                ];
            }
            return current.map((row) =>
                row.employeeId === selectedEmployeeRow.employeeId
                    ? {
                          ...row,
                          grossIncomeRaw: gross,
                          grossIncome: gross.toLocaleString('id-ID'),
                          incomeTaxRaw: tax,
                          incomeTax: tax.toLocaleString('id-ID'),
                          paidSalaryRaw: paid,
                          paidSalary: paid.toLocaleString('id-ID'),
                          ...breakdown,
                      }
                    : row
            );
        });
    }, [selectedEmployeeRow]);

    const handleDeleteEmployee = useCallback(() => {
        if (!selectedEmployeeRow) return;
        if (selectedEmployeeRow.isNewRow) return;
        setEmployeeRows((current) =>
            current.filter((row) => row.employeeId !== selectedEmployeeRow.employeeId)
        );
    }, [selectedEmployeeRow]);

    return (
        <>
            <TransactionFormLayout
            isLoading={isLoading}
            validationMessage={validationMessage}
                header={<PayrollHeader config={config} values={values} setValues={setValues} isDetail={isDetail} handlers={handlers} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                footer={<TransactionDualTotalCard items={resolvedConfig.summaryItems} className="min-w-[360px] sm:min-w-[565px]" />}
                dockActions={dockActions}
            >
                <CrudStatusMessage status={status} className="mb-4" />
                {activeSectionId === 'additional-info' ? (
                    <PayrollAdditionalInfoSection config={config} values={values} setValues={setValues} />
                ) : (
                    <PayrollEmployeeSection
                        config={resolvedConfig}
                        values={values}
                        setValues={setValues}
                        onTake={() => {
                            if (!values.liabilityAccounts || values.liabilityAccounts.length === 0) {
                                setWarningModalOpen(true);
                                return;
                            }
                            setCopyModalOpen(true);
                        }}
                        handlers={handlers}
                    />
                )}
            </TransactionFormLayout>
            <CopyEmployeesModal
                open={copyModalOpen}
                onClose={() => setCopyModalOpen(false)}
                onConfirm={handleCopyEmployees}
            />
            <ConfirmationModal
                open={deleteConfirmationOpen}
                title="Konfirmasi"
                message={`Apakah Anda yakin akan melakukan penghapusan data:\n${values.documentNumber}`}
                confirmLabel="Ya"
                confirmVariant="primary"
                cancelLabel="Batal"
                onConfirm={onDelete}
                onCancel={() => setDeleteConfirmationOpen(false)}
                confirmLoading={saving}
            />
            <ConfirmationModal
                open={warningModalOpen}
                onClose={() => setWarningModalOpen(false)}
                title="Peringatan"
                message="Akun Hutang Beban (Utang Gaji) di tab Info Lainnya wajib diisi terlebih dahulu sebelum menambahkan rincian karyawan."
                confirmLabel="OK"
                confirmVariant="primary"
                onConfirm={() => setWarningModalOpen(false)}
            />
            <PayrollEntryEmployeeModal
                open={employeeModalOpen}
                onClose={() => setEmployeeModalOpen(false)}
                selectedEmployeeRow={selectedEmployeeRow}
                onSave={handleSaveEmployee}
                onDelete={handleDeleteEmployee}
            />
        </>
    );
}
