import { useEffect, useState } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import SelectField from '@/components/ui/SelectField';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { DataTable, DataTableBody, DataTableHead, DataTableHeader, DataTableRow, DataTableCell } from '@/components/ui/DataTable';
import { listBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Semua Karyawan' },
    { value: 'karyawan-tetap', label: 'Karyawan Tetap' },
    { value: 'karyawan-kontrak', label: 'Karyawan Kontrak' },
];

export default function CopyEmployeesModal({ open, onClose, onConfirm }) {
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [allEmployees, setAllEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        if (open) {
            setLoading(true);
            listBackendResource('employees')
                .then((data) => {
                    const rows = data?.data || data || [];
                    setAllEmployees(rows);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Gagal memuat data karyawan:', err);
                    setLoading(false);
                });
        } else {
            setAllEmployees([]);
            setSelectedIds([]);
        }
    }, [open]);

    const filteredEmployees = allEmployees.filter((emp) => {
        if (selectedStatus === 'all') {
            return true;
        }
        const status = String(emp.employment_status || '').toLowerCase();
        if (selectedStatus === 'karyawan-tetap') {
            return status === 'permanent' || status === 'tetap';
        }
        if (selectedStatus === 'karyawan-kontrak') {
            return status === 'contract' || status === 'tidak tetap' || status === 'temporary' || status === 'kontrak';
        }
        return false;
    });

    const isAllSelected = filteredEmployees.length > 0 && filteredEmployees.every((emp) => selectedIds.includes(emp.id));

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds((prev) => prev.filter((id) => !filteredEmployees.some((emp) => emp.id === id)));
        } else {
            const newIds = filteredEmployees.map((emp) => emp.id);
            setSelectedIds((prev) => [...new Set([...prev, ...newIds])]);
        }
    };

    const handleConfirm = () => {
        const selectedList = filteredEmployees
            .filter((emp) => selectedIds.includes(emp.id))
            .map((emp) => {
                const rawValue = Number(emp.previous_income || 0);
                const taxRate = emp.subject_to_income_tax ? 0.05 : 0;
                const taxAmount = rawValue * taxRate;
                const paidSalary = rawValue - taxAmount;

                return {
                    id: String(emp.id),
                    employeeId: emp.id,
                    employeeCode: emp.employee_code ?? '',
                    employeeName: emp.full_name ?? '',
                    grossIncomeRaw: rawValue,
                    grossIncome: rawValue.toLocaleString('id-ID'),
                    incomeTaxRaw: taxAmount,
                    incomeTax: taxAmount.toLocaleString('id-ID'),
                    paidSalaryRaw: paidSalary,
                    paidSalary: paidSalary.toLocaleString('id-ID'),
                    pensionAllowance: 0,
                    basicSalary: rawValue,
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
                };
            });

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
            contentClassName="bg-white px-2.5 py-2.5 sm:px-3.5 sm:py-3.5"
            footerClassName="border-t border-ui-border-medium bg-white px-2.5 py-2 sm:px-3.5"
            footer={
                <div className="flex justify-between items-center w-full">
                    <Button variant="secondary" size="md" onClick={onClose} className="border-brand-blue text-brand-blue hover:bg-brand-blue/5 shadow-none">
                        Batal
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleConfirm}
                        disabled={loading || selectedIds.length === 0}
                    >
                        Lanjut
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col gap-1.5">
                {}
                <div className="w-full sm:max-w-[50%]">
                    <SelectField
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        placeholder="Pilih Kategori Karyawan..."
                        className="h-9 rounded-[4px] border-ui-border"
                        selectClassName="text-xs text-brand-dark"
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>
                </div>

                {}
                <div className="overflow-y-auto max-h-[380px] min-h-[320px] border border-slate-200 rounded-[4px] mt-2">
                    <DataTable>
                        <DataTableHeader>
                            <DataTableRow className="border-t-0 text-white">
                                <DataTableHead className="text-center" style={{ width: '36px', minWidth: '36px' }}>
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={toggleSelectAll}
                                        disabled={loading || filteredEmployees.length === 0}
                                        className="h-3.5 w-3.5 rounded-[3px] border-slate-300 text-brand-blue-accent focus:ring-brand-blue-accent"
                                    />
                                </DataTableHead>
                                <DataTableHead className="text-left font-normal">
                                    Karyawan
                                </DataTableHead>
                                <DataTableHead className="text-center font-normal w-[160px]">
                                    Nilai
                                </DataTableHead>
                            </DataTableRow>
                        </DataTableHeader>
                        <DataTableBody>
                            {loading ? (
                                <DataTableRow>
                                    <DataTableCell colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">
                                        Memuat data karyawan...
                                    </DataTableCell>
                                </DataTableRow>
                            ) : filteredEmployees.length === 0 ? (
                                <DataTableRow>
                                    <DataTableCell colSpan={3} className="px-4 py-8">
                                        <EmptyState
                                            title="Belum ada data"
                                            description="Data karyawan tidak ditemukan untuk kategori ini."
                                            size="sm"
                                            tone="subtle"
                                        />
                                    </DataTableCell>
                                </DataTableRow>
                            ) : (
                                filteredEmployees.map((emp) => {
                                    const isSelected = selectedIds.includes(emp.id);
                                    return (
                                        <DataTableRow key={emp.id} className={isSelected ? 'bg-slate-50' : ''}>
                                            <DataTableCell className="text-center" style={{ width: '36px', minWidth: '36px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(emp.id)}
                                                    className="h-3.5 w-3.5 rounded-[3px] border-slate-300 text-brand-blue-accent focus:ring-brand-blue-accent cursor-pointer"
                                                />
                                            </DataTableCell>
                                            <DataTableCell className="text-left font-normal">
                                                <span className="text-black font-normal">{emp.full_name}</span>
                                            </DataTableCell>
                                            <DataTableCell className="text-right text-black font-normal pr-4 w-[160px]">
                                                {Number(emp.previous_income || 0).toLocaleString('id-ID')}
                                            </DataTableCell>
                                        </DataTableRow>
                                    );
                                })
                            )}
                        </DataTableBody>
                    </DataTable>
                </div>
            </div>
        </WorkspaceDialog>
    );
}
