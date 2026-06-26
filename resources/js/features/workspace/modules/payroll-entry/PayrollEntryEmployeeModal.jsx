import { useEffect, useState } from 'react';

import Button from '@/components/ui/Button';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';
import { PencilIcon } from '@/features/workspace/shared/Icons';
import { showErrorToast, showSuccessToast } from '@/components/feedback/toast';

export default function PayrollEntryEmployeeModal({
    open,
    onClose,
    selectedEmployeeRow,
    onSave,
    onDelete,
}) {
    const [employeeModalValues, setEmployeeModalValues] = useState({
        employeeCode: '',
        employeeName: '',
        grossIncome: '',
        incomeTax: '',
    });

    useEffect(() => {
        if (open && selectedEmployeeRow) {
            const gross = selectedEmployeeRow.grossIncomeRaw ?? 0;
            const tax = selectedEmployeeRow.incomeTaxRaw ?? 0;
            setEmployeeModalValues({
                employeeCode: selectedEmployeeRow.employeeCode ?? '',
                employeeName: selectedEmployeeRow.employeeName ?? '',
                grossIncome: gross > 0 ? gross.toLocaleString('id-ID') : '',
                incomeTax: tax > 0 ? tax.toLocaleString('id-ID') : '',
            });
        }
    }, [open, selectedEmployeeRow]);

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
        onSave?.(gross, tax, paid);
        onClose();
    }

    function handleEmployeeModalDelete() {
        if (!selectedEmployeeRow) return;
        onDelete?.();
        onClose();
    }

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
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
    );
}
