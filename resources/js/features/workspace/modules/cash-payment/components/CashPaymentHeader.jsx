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
    TransactionHeaderButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function CashPaymentHeader({ config, values, setValues, activeRecordId, isDetail = Boolean(activeRecordId || values?.__backendRecordId), handlers = {} }) {
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
                            queryParams={{ account_type: 'Cash/Bank', leaf_only: true }}
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
                    <div className="flex justify-end w-full max-w-[320px] justify-self-end relative">
                        <TransactionHeaderButton
                            ref={ambilButtonRef}
                            onClick={() => setOpenAmbil((o) => !o)}
                            trailingChevron
                            open={openAmbil}
                        >
                            {config.takeButtonLabel}
                        </TransactionHeaderButton>
                        <DropdownMenu
                            open={openAmbil}
                            onClose={() => setOpenAmbil(false)}
                            anchorRef={ambilButtonRef}
                            align="end"
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
    );
}
