import { useRef, useState } from 'react';
import { toast } from 'sonner';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionHeaderButton,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';

export default function PurchaseDepositHeader({ config, values, setValues, isDetail, handlers }) {
    const processAnchorRef = useRef(null);
    const [processOpen, setProcessOpen] = useState(false);

    const handleProcessPembayaran = () => {
        setProcessOpen(false);
        if (handlers?.onProcessPembayaran) {
            handlers.onProcessPembayaran(values);
            return;
        }

        if (!values.__backendRecordId) {
            toast.warning('Silakan simpan uang muka pembelian terlebih dahulu sebelum memproses pembayaran.');
            return;
        }

        const supplierName = values.supplier?.[0] || '';
        window.__pendingInitialValues = window.__pendingInitialValues || {};
        window.__pendingInitialValues['purchase-payment'] = {
            __supplierId: values.__supplierId,
            payee: supplierName ? [supplierName] : [],
            paymentAmountDisplay: values.depositAmount,
        };

        window.dispatchEvent(
            new CustomEvent('workspace:open-page', {
                detail: {
                    pageId: 'purchase-payment',
                    targetTabId: 'purchase-payment-create',
                },
            })
        );
    };

    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.supplier} required />
                    <div className="max-w-[320px] w-full">
                        <AccountLookupTextInput
                            id="supplier"
                            resource="suppliers"
                            value={values.supplier?.[0] ?? ''}
                            placeholder="Cari/Pilih Pemasok..."
                            searchLabel="Cari pemasok"
                            disabled={isDetail}
                            onSelectAccount={(record, label) => {
                                setValues((current) => ({
                                    ...current,
                                    __supplierId: record ? record.id : null,
                                    supplier: label ? [label] : [],
                                    address: record?.billing_address || record?.address || current.address,
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
                    <TransactionFieldLabel label={config.labels.documentNumber || 'Nomor Faktur #'} required />

                    <div className="max-w-[320px] w-full justify-self-end">
                        <TextInput
                            value={values.documentNumber}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    documentNumber: event.target.value,
                                    autoNumber: !event.target.value.trim(),
                                }))
                            }
                            onBlur={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    documentNumber: event.target.value.trim(),
                                }))
                            }
                            maxLength={120}
                            readOnly={isDetail}
                            placeholder="[Otomatis]"
                            trailing={isDetail ? null : (values.documentNumber ? (
                                <button
                                    type="button"
                                    onClick={() => setValues((c) => ({ ...c, documentNumber: '', autoNumber: true }))}
                                    className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                                >
                                    ×
                                </button>
                            ) : null)}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark font-normal"
                            trailingClassName="px-3"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div />
                    <div className="flex justify-end w-full max-w-[320px] justify-self-end relative">
                        <TransactionHeaderButton
                            ref={processAnchorRef}
                            onClick={() => setProcessOpen((prev) => !prev)}
                            trailingChevron
                            open={processOpen}
                        >
                            {values.processButtonLabel || 'Proses'}
                        </TransactionHeaderButton>
                        <DropdownMenu
                            open={processOpen}
                            onClose={() => setProcessOpen(false)}
                            anchorRef={processAnchorRef}
                            align="end"
                            widthClassName="w-[150px]"
                        >
                            <DropdownMenuItem onClick={handleProcessPembayaran}>
                                Pembayaran
                            </DropdownMenuItem>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    );
}
