import { useRef, useState } from 'react';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import {
    TransactionDateInput,
    TransactionFieldLabel,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { ChevronDownIcon } from '@/features/workspace/shared/Icons';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';

export function PayrollHeader({ config, values, setValues, isDetail, handlers = {} }) {
    const [processOpen, setProcessOpen] = useState(false);
    const processAnchorRef = useRef(null);

    const handleProcessGaji = async () => {
        setProcessOpen(false);
        handlers.onProcessGaji?.(values);
    };
    return (
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-y-4 gap-x-8">
            <div className="flex flex-col gap-y-2 w-full lg:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.paymentType} />
                    <SelectField
                        value={values.paymentType}
                        onChange={(event) => setValues((current) => ({ ...current, paymentType: event.target.value }))}
                        disabled={isDetail}
                        className="h-[40px] rounded-[4px] border-ui-border"
                        selectClassName="text-xs sm:text-sm text-brand-dark"
                    >
                        {config.paymentTypeOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.periodMonth} />
                    <div className="grid gap-3 grid-cols-[minmax(0,1fr)_96px]">
                        <SelectField
                            value={values.month}
                            onChange={(event) => setValues((current) => ({ ...current, month: event.target.value }))}
                            disabled={isDetail}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            selectClassName="text-xs sm:text-sm text-brand-dark"
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
                            disabled={isDetail}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            selectClassName="text-xs sm:text-sm text-brand-dark"
                        >
                            {config.yearOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-y-2 w-full lg:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.numbering} required htmlFor="documentNumber" />
                    <div className="max-w-[320px] w-full">
                        {isDetail ? (
                             <TextInput
                                 id="documentNumber"
                                 value={values.documentNumber}
                                 onChange={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value }))}
                                 onBlur={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value.trim() }))}
                                 maxLength={120}
                                 className="h-[40px] rounded-[4px] border-ui-border w-full"
                                 inputClassName="text-xs sm:text-sm text-brand-dark"
                             />
                        ) : (
                            <SelectField
                                id="documentNumber"
                                value={values.numberingType}
                                onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))}
                                className="h-[40px] rounded-[4px] border-ui-border w-full"
                                selectClassName="text-xs sm:text-sm text-brand-dark"
                            >
                                {config.numberingOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </SelectField>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.entryDate} required />
                    <TransactionDateInput
                        value={values.entryDate}
                        onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                        className="w-full max-w-full"
                    />
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.dueDate} required />
                    <div className="grid gap-3 grid-cols-[minmax(0,1fr)_120px]">
                        <TransactionDateInput
                            value={values.dueDate}
                            onChange={(nextValue) => setValues((current) => ({ ...current, dueDate: nextValue }))}
                            className="w-full max-w-full"
                        />
                        <div className="relative flex-1 max-w-[120px]">
                            <button
                                ref={processAnchorRef}
                                type="button"
                                disabled={!values.__backendRecordId}
                                onClick={() => setProcessOpen(prev => !prev)}
                                className="inline-flex h-[40px] w-full items-center justify-center gap-1 rounded-[4px] border border-brand-blue-border bg-white px-3 text-xs sm:text-sm text-brand-blue-accent disabled:opacity-50 disabled:bg-zinc-50 disabled:border-slate-350 disabled:text-tab-inactive-border-l disabled:cursor-not-allowed cursor-pointer transition hover:bg-brand-blue-lightest"
                            >
                                <span>{config.processButtonLabel || 'Proses'}</span>
                                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${processOpen ? 'rotate-180' : ''}`.trim()} />
                            </button>
                            <DropdownMenu
                                open={processOpen}
                                onClose={() => setProcessOpen(false)}
                                anchorRef={processAnchorRef}
                                align="start"
                                widthClassName="w-[140px]"
                            >
                                <DropdownMenuItem onClick={handleProcessGaji}>
                                    Gaji
                                </DropdownMenuItem>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
