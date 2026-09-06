import { useRef, useState } from 'react';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionHeaderButton,
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
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
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

            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px] md:pl-12 lg:pl-16 xl:pl-20 2xl:pl-28">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <TransactionFieldLabel label={config.labels.numbering} required htmlFor="documentNumber" />
                    <div className="max-w-[320px] w-full justify-self-end">
                        {isDetail ? (
                             <TextInput
                                 id="documentNumber"
                                 value={values.documentNumber}
                                 onChange={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value }))}
                                 onBlur={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value.trim() }))}
                                 maxLength={120}
                                 readOnly={isDetail}
                                 className="h-[40px] rounded-[4px] border-ui-border w-full"
                                 inputClassName="text-xs sm:text-sm text-brand-dark font-normal"
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

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <TransactionFieldLabel label={config.labels.entryDate} required />
                    <div className="max-w-[320px] w-full justify-self-end">
                        <TransactionDateInput
                            value={values.entryDate}
                            onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <TransactionFieldLabel label={config.labels.dueDate} required />
                    <div className="max-w-[320px] w-full justify-self-end flex items-center justify-between gap-3">
                        <TransactionDateInput
                            value={values.dueDate}
                            onChange={(nextValue) => setValues((current) => ({ ...current, dueDate: nextValue }))}
                        />
                        <div className="relative shrink-0">
                            <TransactionHeaderButton
                                ref={processAnchorRef}
                                disabled={!values.__backendRecordId}
                                onClick={() => setProcessOpen(prev => !prev)}
                                trailingChevron
                                open={processOpen}
                            >
                                {config.processButtonLabel || 'Proses'}
                            </TransactionHeaderButton>
                            <DropdownMenu
                                open={processOpen}
                                onClose={() => setProcessOpen(false)}
                                anchorRef={processAnchorRef}
                                align="end"
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
