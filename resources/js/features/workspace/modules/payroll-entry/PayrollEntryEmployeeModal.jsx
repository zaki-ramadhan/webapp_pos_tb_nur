import { useEffect, useState } from 'react';
import { Calculator } from 'lucide-react';

import Button from '@/components/ui/Button';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import { TransactionHeaderButton } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';
import { PencilIcon } from '@/features/workspace/shared/Icons';
import { showErrorToast, showSuccessToast } from '@/components/feedback/toast';

function formatNum(val) {
    if (val === undefined || val === null || val === '') return '';
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
    if (isNaN(num)) return '';
    return num > 0 ? num.toLocaleString('id-ID') : '';
}

export default function PayrollEntryEmployeeModal({
    open,
    onClose,
    selectedEmployeeRow,
    onSave,
    onDelete,
}) {
    const [activeTab, setActiveTab] = useState('rincian-gaji');
    const [fetchingLast, setFetchingLast] = useState(false);

    const [employeeModalValues, setEmployeeModalValues] = useState({
        employeeId: '',
        employeeCode: '',
        employeeName: '',
        pensionAllowance: '',
        basicSalary: '',
        taxAllowance: '',
        positionAllowance: '',
        mealAllowance: '',
        transportAllowance: '',
        telecommunicationAllowance: '',
        overtimeAllowance: '',
        healthPremiAllowance: '',
        jkkAllowance: '',
        jkmAllowance: '',
        salaryReduction: '',
        monthlyDeduction: '',
        installmentDeduction: '',
        pensionDeduction: '',
        healthPremiDeduction: '',
        incomeTax: '',
        notes: '',
    });

    useEffect(() => {
        if (open && selectedEmployeeRow) {
            setActiveTab('rincian-gaji');
            setEmployeeModalValues({
                employeeId: selectedEmployeeRow.employeeId ?? '',
                employeeCode: selectedEmployeeRow.employeeCode ?? '',
                employeeName: selectedEmployeeRow.employeeName ?? '',
                pensionAllowance: formatNum(selectedEmployeeRow.pensionAllowance),
                basicSalary: formatNum(selectedEmployeeRow.basicSalary),
                taxAllowance: formatNum(selectedEmployeeRow.taxAllowance),
                positionAllowance: formatNum(selectedEmployeeRow.positionAllowance),
                mealAllowance: formatNum(selectedEmployeeRow.mealAllowance),
                transportAllowance: formatNum(selectedEmployeeRow.transportAllowance),
                telecommunicationAllowance: formatNum(selectedEmployeeRow.telecommunicationAllowance),
                overtimeAllowance: formatNum(selectedEmployeeRow.overtimeAllowance),
                healthPremiAllowance: formatNum(selectedEmployeeRow.healthPremiAllowance),
                jkkAllowance: formatNum(selectedEmployeeRow.jkkAllowance),
                jkmAllowance: formatNum(selectedEmployeeRow.jkmAllowance),
                salaryReduction: formatNum(selectedEmployeeRow.salaryReduction),
                monthlyDeduction: formatNum(selectedEmployeeRow.monthlyDeduction),
                installmentDeduction: formatNum(selectedEmployeeRow.installmentDeduction),
                pensionDeduction: formatNum(selectedEmployeeRow.pensionDeduction),
                healthPremiDeduction: formatNum(selectedEmployeeRow.healthPremiDeduction),
                incomeTax: formatNum(selectedEmployeeRow.incomeTaxRaw ?? selectedEmployeeRow.incomeTax),
                notes: selectedEmployeeRow.notes ?? '',
            });
        }
    }, [open, selectedEmployeeRow]);

    const parse = (val) => parseAmountInput(val) ?? 0;

    const basicSalary = parse(employeeModalValues.basicSalary);
    const taxAllowance = parse(employeeModalValues.taxAllowance);
    const positionAllowance = parse(employeeModalValues.positionAllowance);
    const mealAllowance = parse(employeeModalValues.mealAllowance);
    const transportAllowance = parse(employeeModalValues.transportAllowance);
    const telecommunicationAllowance = parse(employeeModalValues.telecommunicationAllowance);
    const overtimeAllowance = parse(employeeModalValues.overtimeAllowance);
    const healthPremiAllowance = parse(employeeModalValues.healthPremiAllowance);
    const jkkAllowance = parse(employeeModalValues.jkkAllowance);
    const jkmAllowance = parse(employeeModalValues.jkmAllowance);

    const grossIncome = basicSalary + taxAllowance + positionAllowance + mealAllowance +
        transportAllowance + telecommunicationAllowance + overtimeAllowance +
        healthPremiAllowance + jkkAllowance + jkmAllowance;

    const salaryReduction = parse(employeeModalValues.salaryReduction);
    const monthlyDeduction = parse(employeeModalValues.monthlyDeduction);
    const installmentDeduction = parse(employeeModalValues.installmentDeduction);
    const pensionDeduction = parse(employeeModalValues.pensionDeduction);
    const healthPremiDeduction = parse(employeeModalValues.healthPremiDeduction);
    const incomeTax = parse(employeeModalValues.incomeTax);

    const totalDeductions = salaryReduction + monthlyDeduction + installmentDeduction +
        pensionDeduction + healthPremiDeduction + incomeTax;

    const paidSalary = Math.max(0, grossIncome - totalDeductions);

    const handleCalculate = (fieldName) => {
        const basic = parse(employeeModalValues.basicSalary);
        let calculatedVal = 0;

        if (fieldName === 'pensionAllowance') {
            calculatedVal = Math.round(basic * 0.057);
        } else if (fieldName === 'taxAllowance') {
            calculatedVal = parse(employeeModalValues.incomeTax);
        } else if (fieldName === 'healthPremiAllowance') {
            calculatedVal = Math.round(basic * 0.04);
        } else if (fieldName === 'jkmAllowance') {
            calculatedVal = Math.round(basic * 0.003);
        } else if (fieldName === 'pensionDeduction') {
            calculatedVal = Math.round(basic * 0.03);
        } else if (fieldName === 'healthPremiDeduction') {
            calculatedVal = Math.round(basic * 0.01);
        }

        setEmployeeModalValues(prev => ({
            ...prev,
            [fieldName]: calculatedVal > 0 ? calculatedVal.toLocaleString('id-ID') : '',
        }));
    };

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
                    pensionAllowance: formatNum(attr.pensionAllowance),
                    basicSalary: formatNum(attr.basicSalary),
                    taxAllowance: formatNum(attr.taxAllowance),
                    positionAllowance: formatNum(attr.positionAllowance),
                    mealAllowance: formatNum(attr.mealAllowance),
                    transportAllowance: formatNum(attr.transportAllowance),
                    telecommunicationAllowance: formatNum(attr.telecommunicationAllowance),
                    overtimeAllowance: formatNum(attr.overtimeAllowance),
                    healthPremiAllowance: formatNum(attr.healthPremiAllowance),
                    jkkAllowance: formatNum(attr.jkkAllowance),
                    jkmAllowance: formatNum(attr.jkmAllowance),
                    salaryReduction: formatNum(attr.salaryReduction),
                    monthlyDeduction: formatNum(attr.monthlyDeduction),
                    installmentDeduction: formatNum(attr.installmentDeduction),
                    pensionDeduction: formatNum(attr.pensionDeduction),
                    healthPremiDeduction: formatNum(attr.healthPremiDeduction),
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
            pensionAllowance: parse(employeeModalValues.pensionAllowance),
            basicSalary: basicSalary,
            taxAllowance: taxAllowance,
            positionAllowance: positionAllowance,
            mealAllowance: mealAllowance,
            transportAllowance: transportAllowance,
            telecommunicationAllowance: telecommunicationAllowance,
            overtimeAllowance: overtimeAllowance,
            healthPremiAllowance: healthPremiAllowance,
            jkkAllowance: jkkAllowance,
            jkmAllowance: jkmAllowance,
            salaryReduction: salaryReduction,
            monthlyDeduction: monthlyDeduction,
            installmentDeduction: installmentDeduction,
            pensionDeduction: pensionDeduction,
            healthPremiDeduction: healthPremiDeduction,
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
            title="Rincian Karyawan"
            headerIcon={PencilIcon}
            maxWidthClassName="max-w-[550px]"
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
                            {employeeModalValues.employeeName} [{employeeModalValues.employeeId}]
                        </span>
                        <TransactionHeaderButton
                            label={fetchingLast ? 'Memuat...' : 'Ambil Gaji bulan lalu'}
                            disabled={fetchingLast}
                            onClick={handleFetchLastSalary}
                            className="h-8 text-xs font-normal"
                        />
                    </div>

                    <div className="space-y-2.5">
                        <h3 className="text-sm font-normal text-black border-b border-zinc-200 pb-1.5">
                            Tunjangan Pensiun dibayarkan Toko
                        </h3>
                        <InputRow
                            label="Tunjangan Pensiun/THT/JHT"
                            id="pensionAllowance"
                            value={employeeModalValues.pensionAllowance}
                            onChange={(e) => formatFieldChange('pensionAllowance', e.target.value)}
                            showCalc
                            onCalc={() => handleCalculate('pensionAllowance')}
                            indent
                        />
                    </div>

                    <div className="space-y-2.5 pt-2">
                        <h3 className="text-sm font-normal text-black border-b border-zinc-200 pb-1.5">
                            Pendapatan Bruto
                        </h3>
                        <InputRow
                            label="Gaji Pokok"
                            id="basicSalary"
                            value={employeeModalValues.basicSalary}
                            onChange={(e) => formatFieldChange('basicSalary', e.target.value)}
                            indent
                        />
                        <InputRow
                            label="Tunjangan PPh"
                            id="taxAllowance"
                            value={employeeModalValues.taxAllowance}
                            onChange={(e) => formatFieldChange('taxAllowance', e.target.value)}
                            showCalc
                            onCalc={() => handleCalculate('taxAllowance')}
                            indent
                        />
                        <InputRow
                            label="Tunjangan Jabatan"
                            id="positionAllowance"
                            value={employeeModalValues.positionAllowance}
                            onChange={(e) => formatFieldChange('positionAllowance', e.target.value)}
                            indent
                        />
                        <InputRow
                            label="Tunjangan Makan"
                            id="mealAllowance"
                            value={employeeModalValues.mealAllowance}
                            onChange={(e) => formatFieldChange('mealAllowance', e.target.value)}
                            indent
                        />
                        <InputRow
                            label="Tunjangan Transportasi"
                            id="transportAllowance"
                            value={employeeModalValues.transportAllowance}
                            onChange={(e) => formatFieldChange('transportAllowance', e.target.value)}
                            indent
                        />
                        <InputRow
                            label="Tunjangan Telekomunikasi"
                            id="telecommunicationAllowance"
                            value={employeeModalValues.telecommunicationAllowance}
                            onChange={(e) => formatFieldChange('telecommunicationAllowance', e.target.value)}
                            indent
                        />
                        <InputRow
                            label="Tunjangan Lembur"
                            id="overtimeAllowance"
                            value={employeeModalValues.overtimeAllowance}
                            onChange={(e) => formatFieldChange('overtimeAllowance', e.target.value)}
                            indent
                        />
                        <InputRow
                            label="Tunjangan Premi Kesehatan"
                            id="healthPremiAllowance"
                            value={employeeModalValues.healthPremiAllowance}
                            onChange={(e) => formatFieldChange('healthPremiAllowance', e.target.value)}
                            showCalc
                            onCalc={() => handleCalculate('healthPremiAllowance')}
                            indent
                        />
                        <InputRow
                            label="Tunjangan Program JKK"
                            id="jkkAllowance"
                            value={employeeModalValues.jkkAllowance}
                            onChange={(e) => formatFieldChange('jkkAllowance', e.target.value)}
                            indent
                        />
                        <InputRow
                            label="Tunjangan Program JKM"
                            id="jkmAllowance"
                            value={employeeModalValues.jkmAllowance}
                            onChange={(e) => formatFieldChange('jkmAllowance', e.target.value)}
                            showCalc
                            onCalc={() => handleCalculate('jkmAllowance')}
                            indent
                        />
                    </div>

                    <div className="space-y-2.5 pt-2">
                        <h3 className="text-sm font-normal text-black border-b border-zinc-200 pb-1.5">
                            Potongan
                        </h3>
                        <InputRow
                            label="Pengurangan Gaji"
                            id="salaryReduction"
                            value={employeeModalValues.salaryReduction}
                            onChange={(e) => formatFieldChange('salaryReduction', e.target.value)}
                            indent
                        />
                        <InputRow
                            label="Iuran Bulanan dan lainnya"
                            id="monthlyDeduction"
                            value={employeeModalValues.monthlyDeduction}
                            onChange={(e) => formatFieldChange('monthlyDeduction', e.target.value)}
                            indent
                        />
                        <InputRow
                            label="Potongan Cicilan"
                            id="installmentDeduction"
                            value={employeeModalValues.installmentDeduction}
                            onChange={(e) => formatFieldChange('installmentDeduction', e.target.value)}
                            indent
                        />
                        <InputRow
                            label="Iuran Pensiun/THT/JHT"
                            id="pensionDeduction"
                            value={employeeModalValues.pensionDeduction}
                            onChange={(e) => formatFieldChange('pensionDeduction', e.target.value)}
                            showCalc
                            onCalc={() => handleCalculate('pensionDeduction')}
                            indent
                        />
                        <InputRow
                            label="Potongan Premi Kesehatan"
                            id="healthPremiDeduction"
                            value={employeeModalValues.healthPremiDeduction}
                            onChange={(e) => formatFieldChange('healthPremiDeduction', e.target.value)}
                            showCalc
                            onCalc={() => handleCalculate('healthPremiDeduction')}
                            indent
                        />
                        <InputRow
                            label="Pajak Penghasilan"
                            id="incomeTax"
                            value={employeeModalValues.incomeTax}
                            onChange={(e) => formatFieldChange('incomeTax', e.target.value)}
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
                            placeholder="Tulis catatan di sini..."
                            className="w-full rounded-[4px] border border-ui-border p-3 text-sm text-black font-normal focus:border-input-focus focus:ring-1 focus:ring-input-focus-ring outline-none transition"
                        />
                    </div>
                </div>
            )}
        </WorkspaceDialog>
    );
}

function InputRow({ label, value, onChange, id, showCalc, onCalc, indent = false, disabled = false }) {
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
                {showCalc && (
                    <button
                        type="button"
                        onClick={onCalc}
                        disabled={disabled}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-[#2353a0] bg-white text-[#2353a0] hover:bg-[#2353a0]/5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Hitung BPJS / standar otomatis"
                    >
                        <Calculator className="h-4.5 w-4.5" />
                    </button>
                )}
            </div>
        </div>
    );
}
