import { useEffect, useState } from 'react';

import Button from '@/components/ui/Button';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import { TransactionHeaderButton } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import { PencilIcon } from '@/features/workspace/shared/Icons';
import { showErrorToast, showSuccessToast } from '@/components/feedback/toast';
import { formatNum, parse, calculatePayrollTotals } from './payrollEntryEmployeeModalUtils';

export default function PayrollEntryEmployeeModal({
    open,
    onClose,
    selectedEmployeeRow,
    onSave,
    onDelete,
}) {
    const [activeTab, setActiveTab] = useState('rincian-gaji');
    const [fetchingLast, setFetchingLast] = useState(false);
    const [hasLastPayroll, setHasLastPayroll] = useState(false);

    const [employeeModalValues, setEmployeeModalValues] = useState({
        employeeId: '',
        employeeCode: '',
        employeeName: '',
        basicSalary: '',
        mealAllowance: '',
        transportAllowance: '',
        overtimeAllowance: '',
        installmentDeduction: '',
        salaryReduction: '',
        incomeTax: '',
        notes: '',
    });

    useEffect(() => {
        let isMounted = true;
        if (open && selectedEmployeeRow?.employeeId) {
            window.axios
                .get(`/api/backend/employees/${selectedEmployeeRow.employeeId}/last-payroll-line`)
                .then((res) => {
                    if (!isMounted) return;
                    const data = res?.data?.data;
                    setHasLastPayroll(Boolean(data && data.attributes));
                })
                .catch(() => {
                    if (isMounted) setHasLastPayroll(false);
                });
        } else {
            setHasLastPayroll(false);
        }
        return () => {
            isMounted = false;
        };
    }, [open, selectedEmployeeRow?.employeeId]);

    useEffect(() => {
        if (open && selectedEmployeeRow) {
            setActiveTab('rincian-gaji');
            setEmployeeModalValues({
                employeeId: selectedEmployeeRow.employeeId ?? '',
                employeeCode: selectedEmployeeRow.employeeCode ?? '',
                employeeName: selectedEmployeeRow.employeeName ?? '',
                basicSalary: formatNum(selectedEmployeeRow.basicSalary),
                mealAllowance: formatNum(selectedEmployeeRow.mealAllowance),
                transportAllowance: formatNum(selectedEmployeeRow.transportAllowance),
                overtimeAllowance: formatNum(selectedEmployeeRow.overtimeAllowance),
                installmentDeduction: formatNum(selectedEmployeeRow.installmentDeduction),
                salaryReduction: formatNum(selectedEmployeeRow.salaryReduction),
                incomeTax: formatNum(selectedEmployeeRow.incomeTaxRaw ?? selectedEmployeeRow.incomeTax),
                notes: selectedEmployeeRow.notes ?? '',
            });
        }
    }, [open, selectedEmployeeRow]);

    const {
        basicSalary,
        mealAllowance = 0,
        transportAllowance = 0,
        overtimeAllowance = 0,
        grossIncome,
        installmentDeduction = 0,
        salaryReduction = 0,
        incomeTax = 0,
        totalDeductions,
        paidSalary,
    } = calculatePayrollTotals(employeeModalValues);

    const handleFetchLastSalary = async () => {
        if (!selectedEmployeeRow?.employeeId) return;
        setFetchingLast(true);
        try {
            const response = await window.axios.get(`/api/backend/employees/${selectedEmployeeRow.employeeId}/last-payroll-line`);
            const data = response?.data?.data;
            if (data && data.attributes) {
                const attr = data.attributes;
                setEmployeeModalValues(prev => ({
                    ...prev,
                    basicSalary: formatNum(attr.basicSalary),
                    mealAllowance: formatNum(attr.mealAllowance),
                    transportAllowance: formatNum(attr.transportAllowance),
                    overtimeAllowance: formatNum(attr.overtimeAllowance),
                    installmentDeduction: formatNum(attr.installmentDeduction),
                    salaryReduction: formatNum(attr.salaryReduction),
                    incomeTax: formatNum(data.tax_amount),
                    notes: attr.notes ?? '',
                }));
                showSuccessToast({ message: 'Rincian gaji bulan lalu berhasil disalin.' });
            } else {
                showErrorToast({ message: 'Tidak ditemukan rincian gaji sebelumnya untuk karyawan ini.' });
            }
        } catch (e) {
            showErrorToast({ message: 'Gagal mengambil rincian gaji bulan lalu.' });
        } finally {
            setFetchingLast(false);
        }
    };

    function handleEmployeeModalSubmit(e) {
        if (e) e.preventDefault();

        if (grossIncome <= 0) {
            showErrorToast({
                message: 'Pendapatan bruto harus diisi dan lebih dari 0.',
            });
            return;
        }

        const breakdown = {
            basicSalary: basicSalary,
            mealAllowance: mealAllowance,
            transportAllowance: transportAllowance,
            overtimeAllowance: overtimeAllowance,
            installmentDeduction: installmentDeduction,
            salaryReduction: salaryReduction,
            notes: employeeModalValues.notes,
        };

        onSave?.(grossIncome, incomeTax, paidSalary, breakdown);
        onClose();
    }

    function handleEmployeeModalDelete() {
        if (!selectedEmployeeRow) return;
        onDelete?.();
        onClose();
    }

    const formatFieldChange = (key, val) => {
        setEmployeeModalValues(prev => ({
            ...prev,
            [key]: val,
        }));
    };

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            title="Rincian Gaji Karyawan"
            headerIcon={PencilIcon}
            maxWidthClassName="max-w-[540px]"
            contentClassName="bg-white px-4 py-0 flex flex-col pt-3 pb-3"
            footerClassName="border-t border-ui-border-medium bg-white px-4 py-2.5"
            footer={
                <div className="flex justify-between items-center w-full">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={handleEmployeeModalDelete}
                        className="!border-[#2353a0] !text-[#2353a0] hover:!bg-[#2353a0]/5 font-normal"
                    >
                        {selectedEmployeeRow?.isNewRow ? 'Batal' : 'Hapus'}
                    </Button>
                    <Button
                        variant="brand-blue"
                        size="md"
                        onClick={handleEmployeeModalSubmit}
                        className="!bg-[#2353a0] hover:!bg-[#1f4f96] !border-transparent !text-white font-normal shadow-btn-blue-hover"
                    >
                        Lanjut
                    </Button>
                </div>
            }
        >
            <div className="flex border-b border-ui-border-medium mb-4 select-none">
                <button
                    type="button"
                    onClick={() => setActiveTab('rincian-gaji')}
                    className={`px-4 py-2.5 text-sm font-normal border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'rincian-gaji'
                            ? 'border-brand-primary text-brand-primary'
                            : 'border-transparent text-zinc-500 hover:text-black'
                    }`}
                >
                    Rincian Gaji
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('info-lainnya')}
                    className={`px-4 py-2.5 text-sm font-normal border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'info-lainnya'
                            ? 'border-brand-primary text-brand-primary'
                            : 'border-transparent text-zinc-500 hover:text-black'
                    }`}
                >
                    Info lainnya
                </button>
            </div>

            {activeTab === 'rincian-gaji' ? (
                <div className="flex-1 overflow-y-auto max-h-[385px] pr-2 space-y-4">
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-zinc-200">
                        <span className="text-sm text-black font-normal italic">
                            {employeeModalValues.employeeName} [{employeeModalValues.employeeCode || employeeModalValues.employeeId}]
                        </span>
                        {hasLastPayroll && (
                            <TransactionHeaderButton
                                label={fetchingLast ? 'Memuat...' : 'Ambil Gaji bulan lalu'}
                                disabled={fetchingLast}
                                onClick={handleFetchLastSalary}
                                className="h-8 text-xs font-normal"
                            />
                        )}
                    </div>

                    <div className="space-y-2.5 pt-2">
                        <h3 className="text-sm font-normal text-black border-b border-zinc-200 pb-1.5">
                            Pendapatan / Penghasilan
                        </h3>
                        <InputRow
                            label="Gaji / Upah Pokok"
                            id="basicSalary"
                            value={employeeModalValues.basicSalary}
                            onChange={(e) => formatFieldChange('basicSalary', e.target.value)}
                            indent
                        />
                        <InputRow
                            label="Uang Makan"
                            id="mealAllowance"
                            value={employeeModalValues.mealAllowance}
                            onChange={(e) => formatFieldChange('mealAllowance', e.target.value)}
                            indent
                        />
                        <InputRow
                            label="Uang Transport / Bensin"
                            id="transportAllowance"
                            value={employeeModalValues.transportAllowance}
                            onChange={(e) => formatFieldChange('transportAllowance', e.target.value)}
                            indent
                        />
                        <InputRow
                            label="Upah Lembur / Bongkar Muat"
                            id="overtimeAllowance"
                            value={employeeModalValues.overtimeAllowance}
                            onChange={(e) => formatFieldChange('overtimeAllowance', e.target.value)}
                            indent
                        />
                    </div>

                    <div className="space-y-2.5 pt-2">
                        <h3 className="text-sm font-normal text-black border-b border-zinc-200 pb-1.5">
                            Potongan
                        </h3>
                        <InputRow
                            label="Potongan Kasbon / Pinjaman"
                            id="installmentDeduction"
                            value={employeeModalValues.installmentDeduction}
                            onChange={(e) => formatFieldChange('installmentDeduction', e.target.value)}
                            indent
                        />
                        <InputRow
                            label="Potongan Absen / Potong Gaji"
                            id="salaryReduction"
                            value={employeeModalValues.salaryReduction}
                            onChange={(e) => formatFieldChange('salaryReduction', e.target.value)}
                            indent
                        />
                        <InputRow
                            label="Pajak Penghasilan (PPh 21)"
                            id="incomeTax"
                            value={incomeTax > 0 ? incomeTax.toLocaleString('id-ID') : '0'}
                            indent
                            disabled
                        />
                    </div>

                    <div className="space-y-2.5 pt-3 border-t border-zinc-200">
                        <div className="grid grid-cols-[210px_minmax(0,1fr)] items-center gap-2">
                            <span className="text-sm font-normal text-black">Gaji dibayarkan</span>
                            <div className="max-w-[260px] w-full">
                                <FormattedAmountInput
                                    id="paidSalary"
                                    name="paidSalary"
                                    prefix="Rp"
                                    value={paidSalary > 0 ? paidSalary.toLocaleString('id-ID') : '0'}
                                    disabled
                                    className="h-[36px] rounded-[4px] border-ui-border bg-zinc-50 font-normal text-black"
                                    prefixClassName="min-w-0 px-2 justify-center text-black font-normal border-r border-[#d4d4d8] bg-[#f4f4f5] text-sm"
                                    inputClassName="text-black text-right text-sm font-normal"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 space-y-4 py-2">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="notes" className="text-sm text-black font-normal">
                            Catatan
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={employeeModalValues.notes}
                            onChange={(e) => formatFieldChange('notes', e.target.value)}
                            rows={6}
                            placeholder="Tulis catatan rincian khusus di sini..."
                            className="w-full rounded-[4px] border border-ui-border p-3 text-sm text-black font-normal focus:border-input-focus focus:ring-1 focus:ring-input-focus-ring outline-none transition"
                        />
                    </div>
                </div>
            )}
        </WorkspaceDialog>
    );
}

function InputRow({ label, value, onChange, id, indent = false, disabled = false }) {
    return (
        <div className="grid grid-cols-[210px_minmax(0,1fr)] items-center gap-2">
            <span className={`text-sm text-black font-normal truncate ${indent ? 'pl-6' : ''}`} title={label}>
                {label}
            </span>
            <div className="flex items-center gap-1.5 max-w-[260px] w-full">
                <div className="flex-1">
                    <FormattedAmountInput
                        id={id}
                        name={id}
                        prefix="Rp"
                        value={value}
                        onChange={onChange}
                        maxLength={11}
                        allowNegative={false}
                        placeholder="0"
                        disabled={disabled}
                        className={`h-[36px] rounded-[4px] border-ui-border font-normal text-black ${disabled ? 'bg-zinc-50' : ''}`}
                        prefixClassName="min-w-0 px-2 justify-center text-black font-normal border-r border-[#d4d4d8] bg-[#f4f4f5] text-sm"
                        inputClassName="text-black text-right text-sm font-normal"
                    />
                </div>
            </div>
        </div>
    );
}
