import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import {
    TransactionDateInput,
    TransactionFieldLabel,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { addDaysToDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';

export default function SupplierPriceHeader({ config, values, setValues }) {
    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-2 gap-x-8">
            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.supplier} required />
                    <AccountLookupTextInput
                        id="supplierPriceSupplier"
                        resource="suppliers"
                        value={values.supplier?.[0] ?? ''}
                        placeholder={config.supplierPlaceholder}
                        searchLabel="Cari pemasok"
                        onSelectAccount={(record, label) => {
                            if (record) {
                                setValues((current) => ({
                                    ...current,
                                    __supplierId: record.id,
                                    supplier: [label],
                                }));
                            } else {
                                setValues((current) => ({
                                    ...current,
                                    __supplierId: null,
                                    supplier: [],
                                }));
                            }
                        }}
                    />
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-start gap-x-4">
                    <div className="flex flex-col gap-y-2">
                        <TransactionFieldLabel label={config.labels.effectiveDate} required className="pt-2" />
                        <CheckboxField
                            id="supplier-price-auto-end-date"
                            label={config.labels.autoEndDate}
                            checked={values.autoEndDate}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    autoEndDate: event.target.checked,
                                    endDate: event.target.checked ? (current.endDate || addDaysToDisplayDate(current.effectiveDate, 1)) : '',
                                }))
                            }
                            align="center"
                            labelClassName="text-xs sm:text-sm text-brand-dark ml-1 whitespace-nowrap"
                            inputClassName="mt-0 h-[16px] w-[16px]"
                            containerClassName="w-auto shrink-0 mt-6"
                        />
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                        <TransactionDateInput 
                            value={values.effectiveDate} 
                            onChange={(nextVal) => setValues(curr => ({ 
                                ...curr, 
                                effectiveDate: nextVal,
                                endDate: addDaysToDisplayDate(nextVal, 1)
                            }))}
                            className="w-[160px] shrink-0" 
                        />
                        {values.autoEndDate && (
                            <>
                                <span className="text-xs sm:text-sm text-brand-dark shrink-0">s/d</span>
                                <TransactionDateInput 
                                    value={values.endDate || addDaysToDisplayDate(values.effectiveDate, 1)} 
                                    onChange={(nextVal) => setValues(curr => ({ ...curr, endDate: nextVal }))}
                                    minDate={values.effectiveDate}
                                    className="w-[160px] shrink-0" 
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div className="flex items-center justify-start gap-4">
                        <TransactionFieldLabel label={config.labels.documentNumber} required />
                    </div>

                    <div className="max-w-[320px] w-full justify-self-end">
                        <SelectField
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
                    </div>
                </div>
            </div>
        </div>
    );
}
