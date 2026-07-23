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
            acc.totalGross += gross;
            acc.totalPaid += paid;
            return acc;
        },
        { totalGross: 0, totalPaid: 0 }
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
                    },
                };
            }),
        },
        resolvedDocumentNumber,
    };
}
