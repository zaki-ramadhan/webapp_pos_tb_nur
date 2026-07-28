import { normalizeDisplayDate } from '@/features/workspace/backend/adapters/dateHelpers';
import { buildGeneratedPayrollEntryNumber } from './payrollEntryShared';

export function calculatePayrollTotals(employeeRows = []) {
    return employeeRows.reduce(
        (acc, row) => {
            const gross =
                typeof row.grossIncomeRaw === 'number'
                    ? row.grossIncomeRaw
                    : parseFloat(String(row.grossIncome ?? '').replace(/[^0-9.-]+/g, '')) || 0;
            const paid =
                typeof row.paidSalaryRaw === 'number'
                    ? row.paidSalaryRaw
                    : parseFloat(String(row.paidSalary ?? '').replace(/[^0-9.-]+/g, '')) || 0;
            const healthPremi =
                typeof row.healthPremiDeductionRaw === 'number'
                    ? row.healthPremiDeductionRaw
                    : parseFloat(String(row.healthPremiDeduction ?? row.healthPremiAllowance ?? row.breakdown?.healthPremiDeduction ?? '').replace(/[^0-9.-]+/g, '')) || 0;
            const pensionJkkJkm =
                (typeof row.pensionAllowanceRaw === 'number' ? row.pensionAllowanceRaw : parseFloat(String(row.pensionAllowance ?? row.breakdown?.pensionAllowance ?? '').replace(/[^0-9.-]+/g, '')) || 0) +
                (typeof row.jkkAllowanceRaw === 'number' ? row.jkkAllowanceRaw : parseFloat(String(row.jkkAllowance ?? row.breakdown?.jkkAllowance ?? '').replace(/[^0-9.-]+/g, '')) || 0) +
                (typeof row.jkmAllowanceRaw === 'number' ? row.jkmAllowanceRaw : parseFloat(String(row.jkmAllowance ?? row.breakdown?.jkmAllowance ?? '').replace(/[^0-9.-]+/g, '')) || 0) +
                (typeof row.pensionDeductionRaw === 'number' ? row.pensionDeductionRaw : parseFloat(String(row.pensionDeduction ?? row.breakdown?.pensionDeduction ?? '').replace(/[^0-9.-]+/g, '')) || 0);

            const incomeTax =
                typeof row.incomeTaxRaw === 'number'
                    ? row.incomeTaxRaw
                    : parseFloat(String(row.incomeTax ?? row.breakdown?.incomeTax ?? '').replace(/[^0-9.-]+/g, '')) || 0;

            acc.totalGross += gross;
            acc.totalPaid += paid;
            acc.totalHealthPremi += healthPremi;
            acc.totalPensionJkkJkm += pensionJkkJkm;
            acc.totalIncomeTax += incomeTax;
            return acc;
        },
        { totalGross: 0, totalPaid: 0, totalHealthPremi: 0, totalPensionJkkJkm: 0, totalIncomeTax: 0 }
    );
}

export function buildPayrollPayload(values, employeeRows, isDetail) {
    const resolvedDocumentNumber = isDetail
        ? values.documentNumber
        : buildGeneratedPayrollEntryNumber();

    const totalAmount = employeeRows.reduce((sum, row) => {
        const paid =
            typeof row.paidSalaryRaw === 'number'
                ? row.paidSalaryRaw
                : parseFloat(String(row.paidSalary ?? '').replace(/[^0-9.-]+/g, '')) || 0;
        return sum + paid;
    }, 0);

    return {
        payload: {
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
                const gross =
                    typeof row.grossIncomeRaw === 'number'
                        ? row.grossIncomeRaw
                        : parseFloat(String(row.grossIncome ?? '').replace(/[^0-9.-]+/g, '')) || 0;
                const tax =
                    typeof row.incomeTaxRaw === 'number'
                        ? row.incomeTaxRaw
                        : parseFloat(String(row.incomeTax ?? '').replace(/[^0-9.-]+/g, '')) || 0;
                const paid =
                    typeof row.paidSalaryRaw === 'number'
                        ? row.paidSalaryRaw
                        : parseFloat(String(row.paidSalary ?? '').replace(/[^0-9.-]+/g, '')) || 0;

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
                        basicSalary: row.basicSalary ?? 0,
                        taxAllowance: row.taxAllowance ?? 0,
                        positionAllowance: row.positionAllowance ?? 0,
                        mealAllowance: row.mealAllowance ?? 0,
                        transportAllowance: row.transportAllowance ?? 0,
                        overtimeAllowance: row.overtimeAllowance ?? 0,
                        healthPremiAllowance: row.healthPremiAllowance ?? 0,
                        jkkAllowance: row.jkkAllowance ?? 0,
                        jkmAllowance: row.jkmAllowance ?? 0,
                        salaryReduction: row.salaryReduction ?? 0,
                        installmentDeduction: row.installmentDeduction ?? 0,
                        pensionDeduction: row.pensionDeduction ?? 0,
                        healthPremiDeduction: row.healthPremiDeduction ?? 0,
                        notes: row.notes ?? '',
                    },
                };
            }),
        },
        resolvedDocumentNumber,
    };
}
