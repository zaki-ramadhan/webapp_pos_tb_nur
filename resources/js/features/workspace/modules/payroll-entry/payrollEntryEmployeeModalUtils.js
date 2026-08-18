import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';

export function formatNum(val) {
    if (val === undefined || val === null || val === '') return '';
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
    if (isNaN(num)) return '';
    return num > 0 ? num.toLocaleString('id-ID') : '';
}

export function parse(val) {
    return parseAmountInput(val) ?? 0;
}

export function calculatePph21(employeeModalValues) {
    const basicSalary = parse(employeeModalValues.basicSalary);
    if (basicSalary <= 0) return 0;

    const mealAllowance = parse(employeeModalValues.mealAllowance);
    const transportAllowance = parse(employeeModalValues.transportAllowance);
    const overtimeAllowance = parse(employeeModalValues.overtimeAllowance);

    const grossMonthly = basicSalary + mealAllowance + transportAllowance + overtimeAllowance;
    const biayaJabatan = Math.min(500000, Math.round(grossMonthly * 0.05));
    const netMonthly = Math.max(0, grossMonthly - biayaJabatan);
    const netAnnual = netMonthly * 12;

    const ptkp = 54000000; // PTKP TK/0 = 54jt/tahun
    const pkp = Math.max(0, netAnnual - ptkp);

    if (pkp <= 0) return 0;

    let annualTax = 0;
    if (pkp <= 60000000) {
        annualTax = pkp * 0.05;
    } else if (pkp <= 250000000) {
        annualTax = 60000000 * 0.05 + (pkp - 60000000) * 0.15;
    } else if (pkp <= 500000000) {
        annualTax = 60000000 * 0.05 + 190000000 * 0.15 + (pkp - 250000000) * 0.25;
    } else {
        annualTax = 60000000 * 0.05 + 190000000 * 0.15 + 250000000 * 0.25 + (pkp - 500000000) * 0.30;
    }

    return Math.round(annualTax / 12);
}

export function calculatePayrollTotals(employeeModalValues) {
    const basicSalary = parse(employeeModalValues.basicSalary);
    const mealAllowance = parse(employeeModalValues.mealAllowance);
    const transportAllowance = parse(employeeModalValues.transportAllowance);
    const overtimeAllowance = parse(employeeModalValues.overtimeAllowance);

    const grossIncome = basicSalary + mealAllowance + transportAllowance + overtimeAllowance;

    const installmentDeduction = parse(employeeModalValues.installmentDeduction);
    const salaryReduction = parse(employeeModalValues.salaryReduction);
    const incomeTax = calculatePph21(employeeModalValues);

    const totalDeductions = installmentDeduction + salaryReduction + incomeTax;
    const paidSalary = Math.max(0, grossIncome - totalDeductions);

    return {
        basicSalary,
        mealAllowance,
        transportAllowance,
        overtimeAllowance,
        grossIncome,
        installmentDeduction,
        salaryReduction,
        incomeTax,
        totalDeductions,
        paidSalary,
    };
}
