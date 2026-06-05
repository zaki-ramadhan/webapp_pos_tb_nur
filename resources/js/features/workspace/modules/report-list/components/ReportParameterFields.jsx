import React from 'react';
import { X, Search } from 'lucide-react';
import TransactionDateInput from '@/features/workspace/modules/shared/transaction/TransactionDateInput';
import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';

const MONTHS = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
];

const CHECKBOX_LABELS = {
    totalOnly: 'Hanya Tampilkan Total',
    showParentAccount: 'Tampilkan Akun Induk',
    showChildAccount: 'Tampilkan Akun Anak',
    showZeroBalance: 'Tampilkan data dengan Saldo Nol',
    showParentBalance: 'Tampilkan Saldo Akun Induk',
    showConsolidated: 'Tampilkan Konsolidasi',
    showTransactionDetails: 'Tampilkan Rincian Transaksi'
};

export function getTodayString() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

export function getFirstDayOfMonthString() {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `01/${mm}/${yyyy}`;
}

export function buildYearOptions() {
    const currentYear = new Date().getFullYear();
    const options = [];
    for (let year = 2020; year <= currentYear + 2; year++) {
        options.push({ value: String(year), label: String(year) });
    }
    return options;
}

export function ReportFormRow({ label, required = false, children }) {
    return (
        <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[140px_minmax(0,1fr)] py-1">
            <label className="text-[15px] font-semibold text-[#1f2436] flex items-center select-none">
                <span>{label}</span>
                {required && <span className="ml-1 text-[#e31a1a]">*</span>}
            </label>
            <div className="w-full">
                {children}
            </div>
        </div>
    );
}

export function ReportSectionHeading({ title }) {
    return (
        <div className="space-y-1 pb-1 pt-1.5 border-b border-slate-200">
            <h3 className="text-[19px] font-semibold text-[#1f2436] leading-7">
                {title}
            </h3>
        </div>
    );
}

export function ReportDateField({ type, value, onChange }) {
    const yearOptions = buildYearOptions();

    if (type === 'single') {
        return (
            <ReportFormRow label="Per Tanggal" required>
                <div className="w-[220px]">
                    <TransactionDateInput
                        value={value.singleDate}
                        onChange={(displayVal) => onChange({ ...value, singleDate: displayVal })}
                        className="w-full"
                    />
                </div>
            </ReportFormRow>
        );
    }

    if (type === 'period') {
        return (
            <div className="space-y-4">
                <ReportFormRow label="Dari Periode">
                    <div className="flex gap-2 w-full max-w-[280px]">
                        <SelectField
                            value={value.startPeriodMonth}
                            onChange={(e) => onChange({ ...value, startPeriodMonth: e.target.value })}
                            containerClassName="flex-1"
                        >
                            {MONTHS.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </SelectField>
                        <SelectField
                            value={value.startPeriodYear}
                            onChange={(e) => onChange({ ...value, startPeriodYear: e.target.value })}
                            containerClassName="w-[100px]"
                        >
                            {yearOptions.map(y => (
                                <option key={y.value} value={y.value}>{y.label}</option>
                            ))}
                        </SelectField>
                    </div>
                </ReportFormRow>

                <ReportFormRow label="s/d Periode">
                    <div className="flex gap-2 w-full max-w-[280px]">
                        <SelectField
                            value={value.endPeriodMonth}
                            onChange={(e) => onChange({ ...value, endPeriodMonth: e.target.value })}
                            containerClassName="flex-1"
                        >
                            {MONTHS.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </SelectField>
                        <SelectField
                            value={value.endPeriodYear}
                            onChange={(e) => onChange({ ...value, endPeriodYear: e.target.value })}
                            containerClassName="w-[100px]"
                        >
                            {yearOptions.map(y => (
                                <option key={y.value} value={y.value}>{y.label}</option>
                            ))}
                        </SelectField>
                    </div>
                </ReportFormRow>
            </div>
        );
    }

    // Default: 'range'
    return (
        <div className="space-y-4">
            <ReportFormRow label="Dari">
                <div className="w-[220px]">
                    <TransactionDateInput
                        value={value.startDate}
                        onChange={(displayVal) => onChange({ ...value, startDate: displayVal })}
                        className="w-full"
                    />
                </div>
            </ReportFormRow>
            <ReportFormRow label="s/d">
                <div className="w-[220px]">
                    <TransactionDateInput
                        value={value.endDate}
                        onChange={(displayVal) => onChange({ ...value, endDate: displayVal })}
                        className="w-full"
                    />
                </div>
            </ReportFormRow>
        </div>
    );
}

export function ReportBranchField() {
    return (
        <ReportFormRow label="Cabang" required>
            <div className="relative flex h-11 w-full items-center rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]">
                <div className="flex flex-1 items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 border border-slate-200 pl-2 pr-1 py-0.5 text-xs font-semibold text-slate-600 select-none">
                        [Semua Cabang]
                        <button type="button" className="text-slate-400 hover:text-slate-600 ml-1 p-0.5 rounded-full hover:bg-slate-200">
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                </div>
                <Search className="h-4.5 w-4.5 text-slate-400 select-none pointer-events-none" />
            </div>
        </ReportFormRow>
    );
}

export function ReportCheckboxList({ list = [], values = {}, onChange }) {
    if (!list.length) return null;

    const handleCheckboxChange = (key, checked) => {
        onChange({
            ...values,
            [key]: checked
        });
    };

    return (
        <div className="space-y-3 pt-2">
            {list.map((key) => {
                const label = CHECKBOX_LABELS[key] || key;
                const isChecked = Boolean(values[key]);
                return (
                    <CheckboxField
                        key={key}
                        id={`report-param-chk-${key}`}
                        label={label}
                        checked={isChecked}
                        onChange={(e) => handleCheckboxChange(key, e.target.checked)}
                        containerClassName="w-full"
                    />
                );
            })}
        </div>
    );
}
