import React from 'react';
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
    showZeroBalance: 'Tampilkan Saldo Nol',
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

export function ReportDateField({ type, value, onChange }) {
    const yearOptions = buildYearOptions();

    if (type === 'single') {
        return (
            <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Per Tanggal</label>
                <TransactionDateInput
                    value={value.singleDate}
                    onChange={(displayVal) => onChange({ ...value, singleDate: displayVal })}
                    className="w-full"
                />
            </div>
        );
    }

    if (type === 'period') {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Dari Periode</label>
                        <div className="flex gap-2">
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
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">s/d Periode</label>
                        <div className="flex gap-2">
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
                    </div>
                </div>
            </div>
        );
    }

    // Default: 'range'
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Dari</label>
                <TransactionDateInput
                    value={value.startDate}
                    onChange={(displayVal) => onChange({ ...value, startDate: displayVal })}
                    className="w-full"
                />
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">s/d</label>
                <TransactionDateInput
                    value={value.endDate}
                    onChange={(displayVal) => onChange({ ...value, endDate: displayVal })}
                    className="w-full"
                />
            </div>
        </div>
    );
}

export function ReportBranchField() {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Cabang</label>
            <div className="flex h-11 w-full items-center rounded-md border border-slate-300 bg-slate-50 px-4 text-sm text-slate-500 cursor-not-allowed">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    Semua Cabang
                </span>
            </div>
        </div>
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
            <label className="text-sm font-medium text-slate-700">Tampilkan</label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
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
        </div>
    );
}
