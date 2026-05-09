import { useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { LinkIcon, SearchIcon } from '@/features/workspace/shared/Icons';

function MonitorSearchField({ value, onChange, placeholder }) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
            inputClassName="text-[15px] text-[#1f2436]"
        />
    );
}

function MonitorToolbar({ config, values, setValues }) {
    return (
        <div className="grid gap-3 xl:grid-cols-[minmax(0,294px)_170px_170px_minmax(0,1fr)_280px_48px]">
            <SelectField
                value={values.type}
                onChange={(event) => setValues((current) => ({ ...current, type: event.target.value }))}
                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                selectClassName="text-[15px] text-[#1f2436]"
            >
                {config.typeOptions.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </SelectField>

            <SelectField
                value={values.month}
                onChange={(event) => setValues((current) => ({ ...current, month: event.target.value }))}
                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                selectClassName="text-[15px] text-[#1f2436]"
            >
                {config.monthOptions.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </SelectField>

            <SelectField
                value={values.year}
                onChange={(event) => setValues((current) => ({ ...current, year: event.target.value }))}
                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                selectClassName="text-[15px] text-[#1f2436]"
            >
                {config.yearOptions.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </SelectField>

            <MonitorSearchField
                value={values.account}
                onChange={(event) => setValues((current) => ({ ...current, account: event.target.value }))}
                placeholder={config.accountPlaceholder}
            />

            <MonitorSearchField
                value={values.branch}
                onChange={(event) => setValues((current) => ({ ...current, branch: event.target.value }))}
                placeholder={config.branchPlaceholder}
            />

            <button
                type="button"
                aria-label={config.syncLabel}
                title={config.syncLabel}
                className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
            >
                <LinkIcon className="h-4.5 w-4.5" />
            </button>
        </div>
    );
}

export default function BudgetMonitorView({ page }) {
    const config = page.budgetMonitor;
    const [values, setValues] = useState({
        type: config.defaults?.type ?? config.typeOptions?.[0] ?? '',
        month: config.defaults?.month ?? config.monthOptions?.[0] ?? '',
        year: config.defaults?.year ?? config.yearOptions?.[0] ?? '',
        account: '',
        branch: '',
    });

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-2 py-2 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <MonitorToolbar config={config} values={values} setValues={setValues} />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className="min-w-[1180px]" wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {config.table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 text-[15px] font-medium text-white ${
                                        column.align === 'right' ? 'text-right' : 'text-center'
                                    }`.trim()}
                                >
                                    {column.label}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        <DataTableRow className="bg-white">
                            <DataTableCell colSpan={config.table.columns.length} className="px-3 py-3 text-center text-[15px] text-[#131a28]">
                                {config.table.emptyLabel}
                            </DataTableCell>
                        </DataTableRow>
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}
