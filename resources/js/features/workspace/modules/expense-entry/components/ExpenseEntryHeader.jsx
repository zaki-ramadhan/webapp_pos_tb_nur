import { useRef, useState } from 'react';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import { CloseIcon, ChevronDownIcon } from '@/features/workspace/shared/Icons';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';
import {
    TransactionDateInput,
    TransactionFieldLabel,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function ExpenseEntryHeader({ config, values, setValues, showAutoNumberSwitch, handlers = {} }) {
    const processAnchorRef = useRef(null);
    const [processOpen, setProcessOpen] = useState(false);

    const handleProcessPembayaran = async () => {
        setProcessOpen(false);
        if (values.__backendRecordId) {
            handlers.onProcessPembayaran?.(values);
        } else {
            await showSystemErrorModal({
                title: 'Terjadi Permasalahan pada Pemrosesan',
                description: 'Silakan perbaiki permasalahan berikut ini:',
                message: 'Data tidak ditemukan atau sudah dihapus',
            });
        }
    };

    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.liabilityAccount} required htmlFor="liabilityAccount" />
                    <div className="max-w-[320px] w-full">
                        <AccountLookupField
                            id="liabilityAccount"
                            values={values.liabilityAccounts}
                            placeholder={config.liabilityAccountPlaceholder}
                            dialogTitle="Pilih Akun Hutang Beban"
                            showType={true}
                            queryParams={{ account_type: ['Payable', 'Other Current Liability'] }}
                            onRemove={(value) =>
                                handlers.onRemoveLiabilityAccount
                                    ? handlers.onRemoveLiabilityAccount(value)
                                    : setValues((current) => ({
                                          ...current,
                                          liabilityAccounts: current.liabilityAccounts.filter((item) => item !== value),
                                        }))
                            }
                            searchLabel="Cari akun hutang beban"
                            onSelectAccount={(record) => handlers.onSelectLiabilityAccount?.(record)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.entryDate} required htmlFor="entryDate" />
                    <TransactionDateInput
                        id="entryDate"
                        value={values.entryDate}
                        onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div className="flex items-center justify-start gap-4">
                        <TransactionFieldLabel label={config.labels.documentNumber} required htmlFor="documentNumber" />
                    </div>

                    <div className="max-w-[320px] w-full justify-self-end">
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

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div />
                    <div className="flex justify-end relative justify-self-end w-full">
                        <div className="relative flex-1 max-w-[120px] w-full">
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
                                <DropdownMenuItem onClick={handleProcessPembayaran}>
                                    Pembayaran
                                </DropdownMenuItem>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
