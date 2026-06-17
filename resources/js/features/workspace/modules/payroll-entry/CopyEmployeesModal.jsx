import { useEffect, useState } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import SelectField from '@/components/ui/SelectField';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { DataTable, DataTableBody, DataTableHead, DataTableHeader, DataTableRow, DataTableCell } from '@/components/ui/DataTable';
import { listBackendResource } from '@/features/workspace/backend/workspaceBackendApi';

const STATUS_OPTIONS = [
    { value: 'pegawai-tetap', label: 'Pegawai Tetap' },
    { value: 'pegawai-tidak-tetap', label: 'Pegawai Tidak Tetap' },
    { value: 'bukan-pegawai-mlm', label: 'Bukan Pegawai - Distributor MLM' },
    { value: 'bukan-pegawai-asuransi', label: 'Bukan Pegawai - Petugas Dinas Luar Asuransi' },
    { value: 'bukan-pegawai-penjaja', label: 'Bukan Pegawai - Penjaja Barang Dagangan' },
    { value: 'bukan-pegawai-tenaga-ahli', label: 'Bukan Pegawai - Tenaga Ahli' },
    { value: 'dewan-komisaris', label: 'Anggota Dewan Komisaris atau Dewan Pengawas' },
    { value: 'bukan-pegawai-berkesinambungan', label: 'Bukan Pegawai yang Menerima Imbalan Bersifat Berkesinambungan' },
    { value: 'bukan-pegawai-tidak-berkesinambungan', label: 'Bukan Pegawai yang Menerima Imbalan Tidak Bersifat Berkesinambungan' },
];

export default function CopyEmployeesModal({ open, onClose, onConfirm }) {
    const [selectedStatus, setSelectedStatus] = useState('pegawai-tetap');
    const [allEmployees, setAllEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [valuesMap, setValuesMap] = useState({});

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
            setValuesMap({});
        }
    }, [open]);

    const filteredEmployees = allEmployees.filter((emp) => {
        const status = String(emp.employment_status || '').toLowerCase();
        if (selectedStatus === 'pegawai-tetap') {
            return status === 'permanent' || status === 'tetap';
        }
        if (selectedStatus === 'pegawai-tidak-tetap') {
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

    const handleValueChange = (id, val) => {
        setValuesMap((prev) => ({
            ...prev,
            [id]: val,
        }));
    };

    const handleConfirm = () => {
        const selectedList = filteredEmployees
            .filter((emp) => selectedIds.includes(emp.id))
            .map((emp) => {
                const rawValue = parseFloat(valuesMap[emp.id] || 0);
                const taxRate = emp.subject_to_income_tax ? 0.05 : 0;
                const taxAmount = rawValue * taxRate;
                const paidSalary = rawValue - taxAmount;

                return {
                    employeeId: emp.id,
                    employeeCode: emp.employee_code,
                    employeeName: emp.full_name,
                    grossIncomeRaw: rawValue,
                    grossIncome: rawValue.toLocaleString('id-ID'),
                    incomeTaxRaw: taxAmount,
                    incomeTax: taxAmount.toLocaleString('id-ID'),
                    paidSalaryRaw: paidSalary,
                    paidSalary: paidSalary.toLocaleString('id-ID'),
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
            maxWidthClassName="max-w-[720px]"
            footer={
                <div className="flex justify-end gap-2.5">
                    <Button variant="secondary" size="sm" onClick={onClose}>
                        Batal
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleConfirm}
                        disabled={loading || selectedIds.length === 0}
                    >
                        Lanjut
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col gap-4">
                {}
                <div className="w-full sm:max-w-[75%]">
                    <SelectField
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        placeholder="Pilih Kategori Karyawan..."
                        className="h-9 rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-xs text-[#1f2436]"
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>
                </div>

                {}
                <div className="mt-2">
                    <DataTable>
                        <DataTableHeader>
                            <DataTableRow className="bg-[#173664] text-white border-t-0">
                                <DataTableHead className="w-[48px] text-center">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={toggleSelectAll}
                                        disabled={loading || filteredEmployees.length === 0}
                                        className="h-4 w-4 rounded border-slate-300 text-[#21539b] focus:ring-[#21539b]"
                                    />
                                </DataTableHead>
                                <DataTableHead className="text-left font-semibold">
                                    Karyawan
                                </DataTableHead>
                                <DataTableHead className="text-center font-semibold w-[160px]">
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
                                            <DataTableCell className="w-[48px] text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(emp.id)}
                                                    className="h-4 w-4 rounded border-slate-300 text-[#21539b] focus:ring-[#21539b] cursor-pointer"
                                                />
                                            </DataTableCell>
                                            <DataTableCell className="text-left font-normal">
                                                <span className="text-slate-500 font-mono mr-2">[{emp.employee_code}]</span>
                                                <span className="text-slate-800 font-semibold">{emp.full_name}</span>
                                                {emp.position && <span className="text-xs text-slate-400 block">{emp.position}</span>}
                                            </DataTableCell>
                                            <DataTableCell className="text-center w-[160px]">
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={valuesMap[emp.id] ?? ''}
                                                    onChange={(e) => handleValueChange(emp.id, e.target.value)}
                                                    className="w-full h-8 px-2 border border-slate-300 rounded-[4px] text-right text-xs focus:outline-none focus:border-[#21539b]"
                                                />
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
