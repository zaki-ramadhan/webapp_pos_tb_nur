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

export function calculatePph21(employeeModalValues, customTaxAllowance = null) {
    const basicSalary = parse(employeeModalValues.basicSalary);
    if (basicSalary <= 0) return 0;

    const taxAllowance = customTaxAllowance !== null ? customTaxAllowance : parse(employeeModalValues.taxAllowance);
    const positionAllowance = parse(employeeModalValues.positionAllowance);
    const mealAllowance = parse(employeeModalValues.mealAllowance);
    const transportAllowance = parse(employeeModalValues.transportAllowance);
    const overtimeAllowance = parse(employeeModalValues.overtimeAllowance);
    const healthPremiAllowance = parse(employeeModalValues.healthPremiAllowance);
    const jkkAllowance = parse(employeeModalValues.jkkAllowance);
    const jkmAllowance = parse(employeeModalValues.jkmAllowance);

    const grossMonthly = basicSalary + taxAllowance + positionAllowance + mealAllowance +
        transportAllowance + overtimeAllowance + healthPremiAllowance + jkkAllowance + jkmAllowance;

    const jabatanDeduction = Math.min(500000, Math.round(grossMonthly * 0.05));
    const pensionDeduction = parse(employeeModalValues.pensionDeduction);

    const netMonthly = Math.max(0, grossMonthly - jabatanDeduction - pensionDeduction);
    const netAnnual = netMonthly * 12;

    const ptkp = 54000000;
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

export function calculateGrossUpTaxAllowance(employeeModalValues) {
    const basic = parse(employeeModalValues.basicSalary);
    if (basic <= 0) return 0;

    let tax = calculatePph21(employeeModalValues, 0);
    if (tax <= 0) return 0;

    let allowance = tax;
    for (let i = 0; i < 5; i++) {
        const nextTax = calculatePph21(employeeModalValues, allowance);
        const diff = nextTax - allowance;
        if (Math.abs(diff) < 1) break;
        allowance = Math.round(allowance + diff / 0.85);
    }
    return allowance;
}

export function calculatePayrollTotals(employeeModalValues) {
    const basicSalary = parse(employeeModalValues.basicSalary);
    const taxAllowance = parse(employeeModalValues.taxAllowance);
    const positionAllowance = parse(employeeModalValues.positionAllowance);
    const mealAllowance = parse(employeeModalValues.mealAllowance);
    const transportAllowance = parse(employeeModalValues.transportAllowance);
    const overtimeAllowance = parse(employeeModalValues.overtimeAllowance);
    const healthPremiAllowance = parse(employeeModalValues.healthPremiAllowance);
    const jkkAllowance = parse(employeeModalValues.jkkAllowance);
    const jkmAllowance = parse(employeeModalValues.jkmAllowance);

    const grossIncome = basicSalary + taxAllowance + positionAllowance + mealAllowance +
        transportAllowance + overtimeAllowance + healthPremiAllowance + jkkAllowance + jkmAllowance;

    const salaryReduction = parse(employeeModalValues.salaryReduction);
    const installmentDeduction = parse(employeeModalValues.installmentDeduction);
    const pensionDeduction = parse(employeeModalValues.pensionDeduction);
    const healthPremiDeduction = parse(employeeModalValues.healthPremiDeduction);

    const autoIncomeTax = calculatePph21(employeeModalValues);
    const incomeTax = autoIncomeTax;

    const totalDeductions = salaryReduction + installmentDeduction +
        pensionDeduction + healthPremiDeduction + incomeTax;

    const paidSalary = Math.max(0, grossIncome - totalDeductions);

    return {
        basicSalary,
        grossIncome,
        totalDeductions,
        paidSalary,
        incomeTax,
        salaryReduction,
        installmentDeduction,
        pensionDeduction,
        healthPremiDeduction,
    };
}

export function calculateSingleField(fieldName, employeeModalValues) {
    const basic = parse(employeeModalValues.basicSalary);
    let calculatedVal = 0;

    if (fieldName === 'taxAllowance') {
        calculatedVal = calculateGrossUpTaxAllowance(employeeModalValues);
    } else if (fieldName === 'healthPremiAllowance') {
        calculatedVal = Math.round(basic * 0.04);
    } else if (fieldName === 'jkkAllowance') {
        calculatedVal = Math.round(basic * 0.0024);
    } else if (fieldName === 'jkmAllowance') {
        calculatedVal = Math.round(basic * 0.003);
    } else if (fieldName === 'pensionDeduction') {
        calculatedVal = Math.round(basic * 0.02);
    } else if (fieldName === 'healthPremiDeduction') {
        calculatedVal = Math.round(basic * 0.01);
    }

    return calculatedVal > 0 ? calculatedVal.toLocaleString('id-ID') : '';
}
