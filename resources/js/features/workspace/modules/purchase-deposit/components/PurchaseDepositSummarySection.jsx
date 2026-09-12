import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function PurchaseDepositSummarySection({
    config,
    values,
    setValues,
    onDepositAmountBlur,
}) {
    return (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Column: Uang Muka & Pajak */}
            <section className="flex-1 w-full lg:max-w-[50%]">
                <TransactionSectionHeading title={config.depositTitle || 'Uang Muka'} icon="payment" />
                <div className="mt-4 flex flex-col gap-y-2 pl-3 sm:pl-5">
                    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                        <TransactionFieldLabel label={config.labels.depositAmount} required />
                        <div className="max-w-[320px] w-full">
                            <FormattedAmountInput
                                id="depositAmount"
                                name="depositAmount"
                                value={values.depositAmount}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        depositAmount: event.target.value,
                                    }))
                                }
                                onBlur={() => onDepositAmountBlur?.(values.depositAmount)}
                                prefix="Rp"
                                prefixClassName="min-w-0 px-3 justify-center text-table-row-text font-normal bg-ui-bg-hover text-sm"
                                containerClassName="!max-w-[320px] w-full"
                                className="h-[40px] rounded-[4px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                        <TransactionFieldLabel label={config.labels.tax} />
                        <div className="flex flex-wrap gap-8 text-xs sm:text-sm text-brand-dark">
                            <CheckboxField
                                label="Kena Pajak"
                                checked={values.taxEnabled}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        taxEnabled: event.target.checked,
                                        ...(!event.target.checked
                                            ? { __taxId: null, taxName: '', taxRate: 0 }
                                            : { taxTransactionType: current.taxTransactionType || 'Faktur Pajak' }),
                                    }))
                                }
                                align="center"
                                inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                containerClassName="w-auto inline-flex"
                            />
                            <CheckboxField
                                label={config.labels.taxIncluded || 'Total termasuk Pajak'}
                                checked={values.taxIncluded}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        taxIncluded: event.target.checked,
                                    }))
                                }
                                align="center"
                                inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                containerClassName="w-auto inline-flex"
                            />
                        </div>
                    </div>

                    {values.taxEnabled && (
                        <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                            <TransactionFieldLabel label="PPN" required />
                            <div className="max-w-[320px] w-full">
                                <AccountLookupTextInput
                                    id="tax"
                                    resource="taxes"
                                    value={values.taxName || ''}
                                    placeholder="Cari/Pilih PPN..."
                                    searchLabel="Cari pajak"
                                    queryParams={{ code: ['PPN-11', 'PPN-12'] }}
                                    onSelectAccount={(record, label) => {
                                        setValues((current) => ({
                                            ...current,
                                            __taxId: record ? record.id : null,
                                            taxName: label || '',
                                            taxRate: record ? parseFloat(record.rate) : 0,
                                        }));
                                    }}
                                    className="h-[40px] rounded-[4px] border-slate-400 bg-slate-50"
                                    inputClassName="text-xs sm:text-sm text-brand-dark bg-transparent"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Right Column: Info Pajak */}
            {values.taxEnabled && (
                <section className="flex-1 w-full lg:max-w-[50%] mt-8 lg:mt-0">
                    <TransactionSectionHeading title="Info Pajak" icon="tax" />
                    <div className="mt-4 flex flex-col gap-y-2 pl-3 sm:pl-5">
                        <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                            <TransactionFieldLabel label="Tgl Faktur Pajak" required />
                            <div className="max-w-[160px] w-full">
                                <TransactionDateInput
                                    value={values.taxInvoiceDate}
                                    onChange={(nextValue) => setValues((current) => ({ ...current, taxInvoiceDate: nextValue }))}
                                    className="bg-slate-50"
                                    inputClassName="bg-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                            <TransactionFieldLabel label="Tipe Transaksi" required />
                            <div className="max-w-[320px] w-full">
                                <SelectField
                                    value={values.taxTransactionType}
                                    onChange={(event) => setValues((current) => ({ ...current, taxTransactionType: event.target.value }))}
                                    className="h-[40px] rounded-[4px] border-ui-border w-full bg-slate-50"
                                    selectClassName="text-xs sm:text-sm text-brand-dark"
                                >
                                    <option value="Faktur Pajak">Faktur Pajak (Standar)</option>
                                    <option value="Digunggung">Digunggung (Penjualan Eceran)</option>
                                </SelectField>
                            </div>
                        </div>

                        {values.taxTransactionType === 'Faktur Pajak' && (
                            <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                                <TransactionFieldLabel label="No. Faktur Pajak" />
                                <div className="max-w-[320px] w-full">
                                    <TextInput
                                        id="taxInvoiceNumber"
                                        name="taxInvoiceNumber"
                                        value={values.taxInvoiceNumber}
                                        onChange={(event) =>
                                            setValues((current) => ({
                                                ...current,
                                                taxInvoiceNumber: event.target.value,
                                            }))
                                        }
                                        maxLength={20}
                                        className="h-[34px] rounded-[4px] border-ui-border bg-slate-50"
                                        inputClassName="text-slate-700 text-sm bg-transparent"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
