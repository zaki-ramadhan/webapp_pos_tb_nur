import { useRef, useState } from 'react';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import {
    TransactionDateInput,
    TransactionFieldLabel,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { ChevronDownIcon } from '@/features/workspace/shared/Icons';

export default function SalesDepositHeader({ config, values, setValues, isDetail, handlers }) {
    const processAnchorRef = useRef(null);
    const [processOpen, setProcessOpen] = useState(false);

    const handleProcessPembayaran = () => {
        setProcessOpen(false);
        if (handlers?.onProcessPembayaran) {
            handlers.onProcessPembayaran(values);
        } else {
            if (!values.__backendRecordId) return;
            window.__pendingImportSalesDeposit = { id: values.__backendRecordId };
            window.dispatchEvent(
                new CustomEvent('workspace:open-page', {
                    detail: {
                        pageId: 'sales-receipt',
                        targetTabId: 'sales-receipt-create',
                    },
                })
            );
        }
    };

    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.customer} required />
                    <div className="max-w-[320px] w-full">
                        <AccountLookupTextInput
                            id="customer"
                            resource="customers"
                            value={values.customer?.[0] ?? ''}
                            placeholder="Cari/Pilih Pelanggan..."
                            searchLabel="Cari pelanggan"
                            onSelectAccount={(record, label) => {
                                setValues((current) => ({
                                    ...current,
                                    __customerId: record ? record.id : null,
                                    customer: label ? [label] : [],
                                    __salesOrderId: null,
                                    salesOrderNumber: '',
                                }));
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.entryDate} required />
                    <TransactionDateInput
                        value={values.entryDate}
                        onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px] md:pl-12 lg:pl-16 xl:pl-20 2xl:pl-28">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div className="flex items-center justify-start gap-4">
                        <TransactionFieldLabel label={config.labels.documentNumber} required />
                    </div>

                    <div className="max-w-[320px] w-full justify-self-end">
                        {!isDetail && values.autoNumber ? (
                            <SelectField
                                value={values.numberingType}
                                onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))}
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
                                value={values.documentNumber}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        documentNumber: event.target.value,
                                    }))
                                }
                                onBlur={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        documentNumber: event.target.value.trim(),
                                    }))
                                }
                                maxLength={120}
                                trailing={<span className="text-lg font-semibold text-brand-dark">x</span>}
                                className="h-[40px] rounded-[4px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                                trailingClassName="px-3"
                            />
                        )}
                    </div>
                </div>

                {((isDetail && values.processButtonLabel) || !isDetail) && (
                    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4 w-full">
                        <div />
                        <div className="flex justify-end w-full max-w-[320px] justify-self-end relative">
                            <button
                                ref={processAnchorRef}
                                type="button"
                                disabled={!isDetail}
                                onClick={() => setProcessOpen((prev) => !prev)}
                                className="inline-flex h-[34px] items-center justify-center gap-1 rounded-[4px] border border-brand-blue-border bg-white px-4 text-xs sm:text-sm text-brand-blue-accent transition hover:bg-brand-blue-lightest disabled:opacity-50 disabled:bg-zinc-50 disabled:border-slate-350 disabled:text-tab-inactive-border-l disabled:cursor-not-allowed"
                            >
                                <span>{values.processButtonLabel || 'Proses'}</span>
                                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${processOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isDetail && (
                                <DropdownMenu
                                    open={processOpen}
                                    onClose={() => setProcessOpen(false)}
                                    anchorRef={processAnchorRef}
                                    align="end"
                                    widthClassName="w-[140px]"
                                >
                                    <DropdownMenuItem onClick={handleProcessPembayaran}>
                                        Penerimaan
                                    </DropdownMenuItem>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
