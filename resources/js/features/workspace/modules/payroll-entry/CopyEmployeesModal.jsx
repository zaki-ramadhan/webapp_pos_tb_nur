import { useEffect, useState } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import { listBackendResource } from '@/features/workspace/backend/workspaceBackendApi';

export default function CopyEmployeesModal({ open, onClose, onConfirm, existingEmployeeIds = [], currentDocumentId = null }) {
    const [allEmployees, setAllEmployees] = useState([]);
    const [lastPayrolls, setLastPayrolls] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        let isMounted = true;
        if (open) {
            setLoading(true);
            Promise.all([
                listBackendResource('employees', { per_page: 250 }),
                window.axios
                    ? window.axios
                          .get('/api/backend/employees/last-payroll-lines', {
                              params: currentDocumentId ? { exclude_document_id: currentDocumentId } : {},
                          })
                          .then((res) => res?.data?.data || {})
                          .catch(() => ({}))
                    : Promise.resolve({}),
            ])
                .then(([data, lastPayrollMap]) => {
                    if (!isMounted) return;
                    const rows = data?.data || data || [];
                    setAllEmployees(Array.isArray(rows) ? rows : []);
                    setLastPayrolls(lastPayrollMap || {});
                    setLoading(false);
                })
                .catch((err) => {
                    if (!isMounted) return;
                    console.error('Gagal memuat data karyawan:', err);
                    setLoading(false);
                });
        } else {
            setAllEmployees([]);
            setLastPayrolls({});
            setSelectedIds([]);
        }
        return () => {
            isMounted = false;
        };
    }, [open, currentDocumentId]);

    const getLastData = (emp) => {
        return (
            lastPayrolls[String(emp.id)] ||
            lastPayrolls[emp.id] ||
            (emp.employee_code ? lastPayrolls[`code:${emp.employee_code}`] : null) ||
            (emp.full_name ? lastPayrolls[`name:${emp.full_name}`] : null) ||
            null
        );
    };

    const existingSet = new Set((existingEmployeeIds || []).map((id) => String(id)));
    const availableEmployees = allEmployees.filter((emp) => !existingSet.has(String(emp.id)));

    const isAllSelected = availableEmployees.length > 0 && availableEmployees.every((emp) => selectedIds.includes(emp.id));

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds((prev) => prev.filter((id) => !availableEmployees.some((emp) => emp.id === id)));
        } else {
            const newIds = availableEmployees.map((emp) => emp.id);
            setSelectedIds((prev) => [...new Set([...prev, ...newIds])]);
        }
    };

    const handleConfirm = () => {
        const selectedList = availableEmployees
            .filter((emp) => selectedIds.includes(emp.id))
            .map((emp) => {
                const lastData = getLastData(emp);
                const attr = lastData?.attributes || {};

                const grossValue = lastData ? Number(lastData.gross_income || 0) : 0;
                const taxAmount = lastData ? Number(lastData.tax_amount || 0) : 0;
                const paidSalary = lastData ? Number(lastData.total_amount || 0) : (grossValue - taxAmount);

                const basicSalary = Number(attr.basicSalary ?? grossValue);
                const mealAllowance = Number(attr.mealAllowance ?? 0);
                const transportAllowance = Number(attr.transportAllowance ?? 0);
                const overtimeAllowance = Number(attr.overtimeAllowance ?? 0);
                const installmentDeduction = Number(attr.installmentDeduction ?? 0);
                const salaryReduction = Number(attr.salaryReduction ?? 0);
                const positionAllowance = Number(attr.positionAllowance ?? 0);
                const notes = attr.notes ?? '';

                return {
                    id: String(emp.id),
                    employeeId: emp.id,
                    employeeCode: emp.employee_code ?? '',
                    employeeName: emp.full_name ?? '',
                    grossIncomeRaw: grossValue,
                    grossIncome: grossValue.toLocaleString('id-ID'),
                    incomeTaxRaw: taxAmount,
                    incomeTax: taxAmount.toLocaleString('id-ID'),
                    paidSalaryRaw: paidSalary,
                    paidSalary: paidSalary.toLocaleString('id-ID'),
                    basicSalary: basicSalary,
                    mealAllowance: mealAllowance,
                    transportAllowance: transportAllowance,
                    overtimeAllowance: overtimeAllowance,
                    installmentDeduction: installmentDeduction,
                    salaryReduction: salaryReduction,
                    positionAllowance: positionAllowance,
                    notes: notes,
                };
            });

        if (selectedIds.length === 0) {
            onClose();
            return;
        }

        if (onConfirm) {
            onConfirm(selectedList);
        }
        onClose();
    };

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            title="Salin Karyawan"
            maxWidthClassName="max-w-[580px]"
            contentClassName="bg-white px-2.5 py-2.5 sm:px-3.5 sm:py-3.5 min-h-[360px] sm:min-h-[380px] flex flex-col"
            footerClassName="border-t border-ui-border-medium bg-white px-2.5 py-2 sm:px-3.5"
            footer={
                <div className="flex justify-between items-center w-full">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={onClose}
                        className="border-brand-blue text-brand-blue hover:bg-brand-blue/5 rounded-[4px]"
                    >
                        Batal
                    </Button>
                    <Button
                        variant="brand-blue"
                        size="md"
                        onClick={handleConfirm}
                        disabled={loading}
                        className="rounded-[4px] min-w-[80px]"
                    >
                        Lanjut
                    </Button>
                </div>
            }
        >
            <DataTable bordered="x" wrapperClassName="max-h-[380px] overflow-y-auto bg-white">
                <DataTableHeader>
                    <DataTableRow className="border-t-0 text-white">
                        <DataTableHead className="w-px px-3 text-center">
                            <Checkbox
                                checked={isAllSelected}
                                onChange={toggleSelectAll}
                                disabled={loading || availableEmployees.length === 0}
                                size="sm"
                                aria-label="Pilih semua karyawan"
                            />
                        </DataTableHead>
                        <DataTableHead className="text-left font-light">
                            Karyawan
                        </DataTableHead>
                        <DataTableHead className="text-center font-light w-[160px]">
                            Nilai
                        </DataTableHead>
                    </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                    {loading ? (
                        <DataTableRow>
                            <DataTableCell colSpan={3} className="text-center py-2 text-xs sm:text-sm font-normal text-black">
                                Memuat data...
                            </DataTableCell>
                        </DataTableRow>
                    ) : availableEmployees.length === 0 ? (
                        <DataTableRow>
                            <DataTableCell colSpan={3} className="text-center py-2 text-xs sm:text-sm font-normal text-black">
                                {allEmployees.length > 0
                                    ? 'Semua karyawan sudah ditambahkan'
                                    : 'Belum ada data'}
                            </DataTableCell>
                        </DataTableRow>
                    ) : (
                        availableEmployees.map((emp) => {
                            const checked = selectedIds.includes(emp.id);
                            const lastData = getLastData(emp);
                            const rawValue = lastData ? Number(lastData.gross_income || 0) : 0;

                            return (
                                <DataTableRow
                                    key={emp.id}
                                    onClick={() => toggleSelect(emp.id)}
                                    className={`cursor-pointer transition hover:bg-slate-50 ${checked ? 'bg-blue-50/60' : ''}`}
                                >
                                    <DataTableCell className="w-px px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={checked}
                                            onChange={() => toggleSelect(emp.id)}
                                            size="sm"
                                            aria-label={`Pilih ${emp.full_name}`}
                                        />
                                    </DataTableCell>
                                    <DataTableCell className="text-left font-normal">
                                        <span className="text-black font-normal">{emp.full_name}</span>
                                    </DataTableCell>
                                    <DataTableCell className="text-right text-black font-normal pr-4 w-[160px]">
                                        {rawValue.toLocaleString('id-ID')}
                                    </DataTableCell>
                                </DataTableRow>
                            );
                        })
                    )}
                </DataTableBody>
            </DataTable>
        </WorkspaceDialog>
    );
}
