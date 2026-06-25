import { useCallback, useEffect, useMemo, useState } from 'react';
 
import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { TransactionFormLayout, TransactionDualTotalCard } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { PencilIcon } from '@/features/workspace/shared/Icons';
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
} from '@/features/workspace/backend/workspaceBackendApi';
import { useTransactionForm } from '@/features/workspace/shared/hooks/useTransactionForm';

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
    const [localRecord, setLocalRecord] = useState(null);

    useEffect(() => {
        setLocalRecord(null);
    }, [activeRecordId]);

    const sourceRecord = useMemo(() => {
        if (localRecord) {
            return localRecord;
        }

        if (activeRecordId) {
            const row = config.rowMap?.[activeRecordId];

            if (row?.__backendRecord && buildRecord) {
                return buildRecord(row.__backendRecord, config);
            }

            return config.records?.[activeRecordId] ?? config.draft;
        }

        return config.draft;
    }, [activeRecordId, buildRecord, config, localRecord]);

    const [values, setValues] = useState(() => {
        const initial = sourceRecord ? sourceRecord : buildDefaultValues(config);
        return {
            ...buildDefaultValues(config),
            ...initial,
        };
    });
    const [employeeRows, setEmployeeRows] = useState(() => sourceRecord?.employeeRows ?? []);
    const [copyModalOpen, setCopyModalOpen] = useState(false);
    const [pendingEmployee, setPendingEmployee] = useState(null);
    const [liabilityWarningOpen, setLiabilityWarningOpen] = useState(false);

    const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
    const [selectedEmployeeRow, setSelectedEmployeeRow] = useState(null);
    const [employeeModalValues, setEmployeeModalValues] = useState({
        employeeCode: '',
        employeeName: '',
        grossIncome: '',
        incomeTax: '',
    });

    const isDetail = Boolean(values.__backendRecordId ?? activeRecordId);

    useEffect(() => {
        const initial = sourceRecord ? sourceRecord : buildDefaultValues(config);
        setValues({
            ...buildDefaultValues(config),
            ...initial,
        });
        setEmployeeRows(sourceRecord?.employeeRows ?? []);
    }, [sourceRecord, config]);

    const initialComparable = useMemo(() => {
        const initial = sourceRecord ? sourceRecord : buildDefaultValues(config);
        const resolved = {
            ...buildDefaultValues(config),
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
    }, [config, sourceRecord]);

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
        () => !areComparableValuesEqual(initialComparable, currentComparable),
        [initialComparable, currentComparable]
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

    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

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

                const payload = {
                    entry_date: values.entryDate,
                    due_date: values.dueDate,
                    notes: values.notes,
                    document_number: resolvedDocumentNumber,
                    status: values.status ?? 'Draft',
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

    function addEmployeeToRows(emp) {
        setEmployeeRows((prev) => {
            const existingIds = new Set(prev.map((r) => String(r.employeeId)));
            if (existingIds.has(String(emp.id))) {
                showErrorToast({ message: `Karyawan ${emp.full_name ?? emp.name} sudah ada di daftar.` });
                return prev;
            }
            return [
                ...prev,
                {
                    employeeId: emp.id,
                    employeeCode: emp.employee_code ?? '',
                    employeeName: emp.full_name ?? emp.name ?? '',
                    grossIncomeRaw: 0,
                    grossIncome: '',
                    incomeTaxRaw: 0,
                    incomeTax: '',
                    paidSalaryRaw: 0,
                    paidSalary: '',
                }
            ];
        });
    }

    const handlers = {
        onEditEmployeeRow: (row) => {
            setSelectedEmployeeRow(row);
            const gross = typeof row.grossIncomeRaw === 'number' ? row.grossIncomeRaw : (parseAmountInput(row.grossIncome) ?? 0);
            const tax = typeof row.incomeTaxRaw === 'number' ? row.incomeTaxRaw : (parseAmountInput(row.incomeTax) ?? 0);
            setEmployeeModalValues({
                employeeCode: row.employeeCode ?? '',
                employeeName: row.employeeName ?? '',
                grossIncome: gross > 0 ? gross.toLocaleString('id-ID') : '',
                incomeTax: tax > 0 ? tax.toLocaleString('id-ID') : '',
            });
            setEmployeeModalOpen(true);
        },
        onSelectEmployee: (emp) => {
            if (!emp) return;

            if (!emp.liability_account_label) {
                setPendingEmployee(emp);
                setLiabilityWarningOpen(true);
                return;
            }

            addEmployeeToRows(emp);
        }
    };

    function handleEmployeeModalSubmit(e) {
        if (e) e.preventDefault();

        const gross = parseAmountInput(employeeModalValues.grossIncome) ?? 0;
        const tax = parseAmountInput(employeeModalValues.incomeTax) ?? 0;

        if (gross <= 0) {
            showErrorToast({
                message: 'Pendapatan bruto harus diisi dan lebih dari 0.',
            });
            return;
        }

        const paid = gross - tax;

        setEmployeeRows((current) =>
            current.map((row) =>
                row.employeeId === selectedEmployeeRow.employeeId
                    ? {
                          ...row,
                          grossIncomeRaw: gross,
                          grossIncome: gross.toLocaleString('id-ID'),
                          incomeTaxRaw: tax,
                          incomeTax: tax.toLocaleString('id-ID'),
                          paidSalaryRaw: paid,
                          paidSalary: paid.toLocaleString('id-ID'),
                      }
                    : row
            )
        );

        setEmployeeModalOpen(false);
        showSuccessToast({
            message: 'Rincian karyawan diperbarui.',
        });
    }

    function handleEmployeeModalDelete() {
        if (!selectedEmployeeRow) return;

        setEmployeeRows((current) =>
            current.filter((row) => row.employeeId !== selectedEmployeeRow.employeeId)
        );

        setEmployeeModalOpen(false);
        showSuccessToast({
            message: 'Rincian karyawan dihapus.',
        });
    }

    return (
        <>
            <TransactionFormLayout
                header={<PayrollHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />}
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
                        onTake={() => setCopyModalOpen(true)}
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
                open={liabilityWarningOpen}
                title="Akun Hutang Beban Belum Diset"
                message={`Karyawan "${pendingEmployee?.full_name ?? ''}" belum memiliki akun hutang beban. Harap set terlebih dahulu di halaman Data Karyawan > tab Rekening Gaji.\n\nTetap tambahkan karyawan ini?`}
                confirmLabel="Tetap Tambahkan"
                confirmVariant="primary"
                cancelLabel="Batal"
                onConfirm={() => {
                    setLiabilityWarningOpen(false);
                    if (pendingEmployee) addEmployeeToRows(pendingEmployee);
                    setPendingEmployee(null);
                }}
                onCancel={() => {
                    setLiabilityWarningOpen(false);
                    setPendingEmployee(null);
                }}
            />
            <WorkspaceDialog
                open={employeeModalOpen}
                onClose={() => setEmployeeModalOpen(false)}
                title="Rincian Karyawan"
                headerIcon={PencilIcon}
                maxWidthClassName="max-w-[480px]"
                contentClassName="bg-white px-3.5 py-0 sm:px-4 min-h-[220px] flex flex-col pt-3 pb-3"
                footerClassName="border-t border-ui-border-medium bg-white px-3.5 py-2.5 sm:px-4"
                footer={
                    <div className="flex justify-between items-center w-full">
                        <div>
                            <Button
                                variant="secondary"
                                size="md"
                                onClick={handleEmployeeModalDelete}
                                className="border-red-150 hover:bg-danger-border text-error-border font-semibold"
                            >
                                Hapus
                            </Button>
                        </div>
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleEmployeeModalSubmit}
                            className="bg-brand-blue-dark hover:bg-brand-blue-darker font-semibold shadow-btn-blue-hover"
                        >
                            Lanjut
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4 flex-1 pb-4">
                    <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                        <span className="text-sm text-slate-700 font-normal">Karyawan</span>
                        <span className="text-sm text-slate-700 font-medium select-all">
                            {employeeModalValues.employeeName}
                        </span>
                    </div>

                    <div className="grid grid-cols-[130px_minmax(0,1fr)] items-start gap-4">
                        <span className="text-sm text-slate-700 font-normal pt-2">
                            Pendapatan Bruto <span className="text-red-500">*</span>
                        </span>
                        <div className="w-full max-w-[240px]">
                            <FormattedAmountInput
                                id="grossIncome"
                                name="grossIncome"
                                prefix="Rp"
                                value={employeeModalValues.grossIncome}
                                onChange={(e) =>
                                    setEmployeeModalValues((prev) => ({
                                        ...prev,
                                        grossIncome: e.target.value,
                                    }))
                                }
                                allowNegative={false}
                                placeholder="0"
                                className="h-[36px] rounded-[4px] border-ui-border"
                                prefixClassName="min-w-0 px-3 justify-center text-slate-500 font-normal border-r-ui-border-medium bg-ui-bg-hover text-sm"
                                inputClassName="text-slate-700 text-right text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-[130px_minmax(0,1fr)] items-start gap-4">
                        <span className="text-sm text-slate-700 font-normal pt-2">
                            Pajak Penghasilan
                        </span>
                        <div className="w-full max-w-[240px]">
                            <FormattedAmountInput
                                id="incomeTax"
                                name="incomeTax"
                                prefix="Rp"
                                value={employeeModalValues.incomeTax}
                                onChange={(e) =>
                                    setEmployeeModalValues((prev) => ({
                                        ...prev,
                                        incomeTax: e.target.value,
                                    }))
                                }
                                allowNegative={false}
                                placeholder="0"
                                className="h-[36px] rounded-[4px] border-ui-border"
                                prefixClassName="min-w-0 px-3 justify-center text-slate-500 font-normal border-r-ui-border-medium bg-ui-bg-hover text-sm"
                                inputClassName="text-slate-700 text-right text-sm"
                            />
                        </div>
                    </div>
                </div>
            </WorkspaceDialog>
        </>
    );
}
