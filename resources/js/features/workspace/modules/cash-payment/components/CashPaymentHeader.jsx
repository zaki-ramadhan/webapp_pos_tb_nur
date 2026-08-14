import { useState, useRef } from 'react';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import { CloseIcon, ChevronDownIcon } from '@/features/workspace/shared/Icons';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import {
    TransactionDateInput,
    TransactionFieldLabel,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function CashPaymentHeader({ config, values, setValues, activeRecordId, handlers = {} }) {
    const [openAmbil, setOpenAmbil] = useState(false);
    const ambilButtonRef = useRef(null);

    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.cashBank} required htmlFor="cashBank" />
                    <div className="max-w-[320px] w-full">
                        <AccountLookupField
                            id="cashBank"
                            value={values.bankAccounts?.[0] ?? ''}
                            placeholder={config.cashBankPlaceholder}
                            searchLabel="Cari kas atau bank"
                            queryParams={{ account_type: 'Cash/Bank' }}
                            onRemove={() =>
                                setValues((current) => ({
                                    ...current,
                                    __primaryAccountId: null,
                                    bankAccounts: [],
                                }))
                            }
                            onSelectAccount={(record, label) =>
                                setValues((current) => ({
                                    ...current,
                                    __primaryAccountId: record?.id ?? null,
                                    bankAccounts: record ? [label] : [],
                                }))
                            }
                        />
                    </div>
                </div>

                <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.entryDate} required htmlFor="entryDate" />
                    <TransactionDateInput
                        id="entryDate"
                        value={values.entryDate}
                        onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div className="flex items-center justify-start gap-4">
                        <TransactionFieldLabel label={config.labels.documentNumber} required htmlFor="documentNumber" />
                    </div>

                    <div className="max-w-[240px] w-full justify-self-end">
                        {values.autoNumber ? (
                            <SelectField
                                id="documentNumber"
                                value={values.numberingType}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        numberingType: event.target.value,
                                    }))
                                }
                                className="h-[40px] rounded-[4px] border-ui-border"
                                selectClassName="text-xs sm:text-sm text-brand-dark"
                            >
                                {config.numberingOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </SelectField>
                        ) : (
                            <TextInput
                                id="documentNumber"
                                value={values.documentNumber}
                                onChange={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value }))}
                                onBlur={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value.trim() }))}
                                maxLength={120}
                                readOnly={isDetail}
                                trailing={isDetail ? null : <CloseIcon className="h-4 w-4 text-brand-dark" />}
                                className="h-[40px] rounded-[4px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-brand-dark font-normal"
                                trailingClassName="px-3"
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div />
                    <div className="flex justify-end relative justify-self-end w-full">
                        <div className="relative flex-1 max-w-[120px] w-full">
                            <button
                                ref={ambilButtonRef}
                                type="button"
                                onClick={() => setOpenAmbil((o) => !o)}
                                className="inline-flex h-[40px] w-full items-center justify-center gap-1 rounded-[4px] border border-brand-blue-border bg-white px-3 text-xs sm:text-sm text-brand-blue-accent cursor-pointer transition hover:bg-brand-blue-lightest"
                            >
                                <span>{config.takeButtonLabel}</span>
                                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${openAmbil ? 'rotate-180' : ''}`.trim()} />
                            </button>
                            <DropdownMenu
                                open={openAmbil}
                                onClose={() => setOpenAmbil(false)}
                                anchorRef={ambilButtonRef}
                                align="start"
                                widthClassName="w-[180px]"
                            >
                                <DropdownMenuItem
                                    onClick={() => {
                                        setOpenAmbil(false);
                                        handlers.onTakeExpenseEntry?.();
                                    }}
                                >
                                    Pencatatan Beban
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setOpenAmbil(false);
                                        handlers.onTakePayrollEntry?.();
                                    }}
                                >
                                    Pencatatan Gaji
                                </DropdownMenuItem>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
