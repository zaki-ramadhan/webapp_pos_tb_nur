import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import { SaveIcon } from '@/features/workspace/shared/Icons';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import SelectField from '@/components/ui/SelectField';

export function PeriodDockButton({ label }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className="inline-flex h-12 w-[84px] shrink-0 items-center justify-center rounded-[8px] border border-[#c8ccd4] bg-[#ececec] text-[#9aa0aa] shadow-[0_4px_10px_rgba(15,23,42,0.08)] sm:h-[54px] sm:w-[92px] md:h-[58px] md:w-[96px]"
        >
            <SaveIcon className="h-9 w-9" />
        </button>
    );
}

export function PeriodFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 md:grid-cols-[140px_minmax(0,1fr)] md:items-center">
            <label className="text-xs sm:text-sm text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

export function PeriodEndRatesSection({ config, month, setMonth, year, setYear, monthOptions, yearOptions, ratesRows }) {
    return (
        <>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="w-full max-w-[760px] space-y-3">
                    <PeriodFieldRow label={config.labels.month} required>
                        <SelectField
                            value={month}
                            onChange={(event) => setMonth(event.target.value)}
                            className="h-[40px] w-full max-w-[424px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-xs sm:text-sm text-[#1f2436]"
                        >
                            {monthOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </PeriodFieldRow>

                    <PeriodFieldRow label={config.labels.year}>
                        <SelectField
                            value={year}
                            onChange={(event) => setYear(event.target.value)}
                            className="h-[40px] w-full max-w-[118px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-xs sm:text-sm text-[#1f2436]"
                        >
                            {yearOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </PeriodFieldRow>
                </div>

                <div className="flex justify-end">
                    <PeriodDockButton label={config.saveLabel} />
                </div>
            </div>

            <div className="mt-3 flex gap-3">
                <button
                    type="button"
                    aria-label={config.gridButtonLabel}
                    className="inline-flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[4px] border border-[#f39bb8] bg-white text-[#ff2d7a]"
                >
                    <NavigationIcon type="format" className="h-5 w-5" />
                </button>

                <div className="min-w-0 flex-1 overflow-x-auto">
                    <div className="min-w-[720px]">
                        <DataTable wrapperClassName="border-[#d1d8e4]">
                            <DataTableHeader className="bg-[#5f7690]">
                                <tr>
                                    {config.ratesTable.columns.map((column) => (
                                        <DataTableHead
                                            key={column.id}
                                            className={`${column.widthClassName ?? ''} px-3 text-base font-medium text-white ${column.align === 'right' ? 'text-right' : 'text-center'}`.trim()}
                                        >
                                            {column.label}
                                        </DataTableHead>
                                    ))}
                                </tr>
                            </DataTableHeader>

                            <DataTableBody>
                                {ratesRows.map((row, index) => (
                                    <DataTableRow
                                        key={row.id}
                                        className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                    >
                                        <DataTableCell className="w-[36px] px-3 text-center text-[#a4acbc]">≡</DataTableCell>
                                        <DataTableCell className="px-3 text-base text-[#131a28]">{row.currencyName}</DataTableCell>
                                        <DataTableCell className="px-3 text-right text-base text-[#131a28]">{row.rate}</DataTableCell>
                                    </DataTableRow>
                                ))}
                            </DataTableBody>
                        </DataTable>
                    </div>
                </div>
            </div>
        </>
    );
}
