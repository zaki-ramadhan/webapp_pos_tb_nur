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

export function calculatePayrollTotals(employeeModalValues) {
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

    return {
        basicSalary,
        grossIncome,
        totalDeductions,
        paidSalary,
        incomeTax,
        salaryReduction,
        monthlyDeduction,
        installmentDeduction,
        pensionDeduction,
        healthPremiDeduction,
    };
}

export function calculateSingleField(fieldName, employeeModalValues) {
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

    return calculatedVal > 0 ? calculatedVal.toLocaleString('id-ID') : '';
}
