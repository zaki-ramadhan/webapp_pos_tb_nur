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
import DockActionButton from '@/features/workspace/shared/DockActionButton';

export function PeriodDockButton({ label, onClick, disabled, loading }) {
    return (
        <DockActionButton
            label={label}
            onClick={onClick}
            disabled={disabled}
            loading={loading}
            icon={<SaveIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
        />
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

export function PeriodEndRatesSection({
    config,
    month,
    setMonth,
    year,
    setYear,
    monthOptions,
    yearOptions,
    ratesRows,
    onSave,
    saveDisabled,
    saving,
}) {
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
                    <PeriodDockButton
                        label={config.saveLabel}
                        onClick={onSave}
                        disabled={saveDisabled}
                        loading={saving}
                    />
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
                                        className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'}`.trim()}
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
