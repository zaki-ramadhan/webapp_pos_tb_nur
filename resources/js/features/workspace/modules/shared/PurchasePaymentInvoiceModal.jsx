import { useEffect, useMemo, useState } from 'react';

import ModalBase from '@/components/ui/ModalBase';
import TextInput from '@/components/ui/TextInput';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import {
    CloseIcon,
    PencilIcon,
    PlusIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';

function normalizeLookupValue(value) {
    if (Array.isArray(value)) {
        return value;
    }

    return value ? [value] : [];
}

function buildModalState(modal, invoice) {
    const invoiceState = invoice ?? {};
    const invoiceTab = modal?.invoice ?? {};
    const discountState = modal?.discountInfo ?? {};

    return {
        formNumber: invoiceState.formNumber ?? invoiceTab.formNumber ?? '',
        billNumber: invoiceState.number ?? invoiceTab.billNumber ?? '',
        outstanding: invoiceTab.outstanding ?? invoiceState.outstanding ?? '',
        pay: invoiceTab.pay ?? invoiceState.pay ?? '',
        payment: invoiceTab.payment ?? invoiceState.payment ?? '',
        pphChecked: invoiceTab.pphChecked ?? invoiceState.pphChecked ?? false,
        pphLabel: invoiceTab.pphLabel ?? invoiceState.pphLabel ?? '',
        pphAmount: invoiceTab.pphAmount ?? invoiceState.pphAmount ?? '',
        withholdingProof: invoiceTab.withholdingProof ?? invoiceState.withholdingProof ?? '',
        notice: invoiceTab.notice ?? '',
        discountAccount: normalizeLookupValue(discountState.discountAccount ?? invoiceState.discountAccount),
        discountAmount: discountState.discountAmount ?? invoiceState.discountValue ?? '',
        discountNotes: discountState.discountNotes ?? invoiceState.discountNotes ?? '',
        department: normalizeLookupValue(discountState.department ?? invoiceState.department),
        discountRows: [...(discountState.rows ?? [])],
    };
}

function ModalTabButton({ active, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`border-b-2 px-3 py-2 text-[16px] ${
                active ? 'border-[#ff4836] text-[#ff4836]' : 'border-transparent text-[#5f6980]'
            }`.trim()}
        >
            {label}
        </button>
    );
}

function ModalFooter() {
    return (
        <div className="flex items-center justify-between border-t border-[#d8dde7] pt-3">
            <button
                type="button"
                className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-5 text-[18px] text-[#21539b]"
            >
                Hapus
            </button>
            <button
                type="button"
                className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-[#1d52a5] bg-[#1d52a5] px-6 text-[18px] text-white"
            >
                Lanjut
            </button>
        </div>
    );
}

function CurrencyField({ value, onChange, readOnly = false, prefix = 'Rp', inputClassName = '' }) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            prefix={prefix}
            className="h-[36px] rounded-[4px] border-[#cfd6e2]"
            prefixClassName="min-w-[48px] justify-center bg-[#f5f6f8] px-0 text-[#9aa3b1]"
            inputClassName={`text-right text-[15px] text-[#111827] ${inputClassName}`.trim()}
        />
    );
}

function InvoiceTab({ values, setValues }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-y-4 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-x-4">
                <TransactionFieldLabel label="No Form #" />
                <TextInput
                    value={values.formNumber}
                    readOnly
                    className="h-[36px] rounded-[4px] border-[#9ed66f] bg-[#f1fee9]"
                    inputClassName="text-[15px] font-semibold text-[#67b52c]"
                />

                <TransactionFieldLabel label="No. Faktur" />
                <TextInput
                    value={values.billNumber}
                    readOnly
                    className="h-[36px] rounded-[4px] border-[#9ed66f] bg-[#f1fee9]"
                    inputClassName="text-[15px] font-semibold text-[#67b52c]"
                />

                <TransactionFieldLabel label="Terhutang" />
                <TextInput
                    value={values.outstanding}
                    readOnly
                    className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-right text-[15px] text-[#64748b]"
                />

                <TransactionFieldLabel label="Bayar" />
                <CurrencyField
                    value={values.pay}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            pay: event.target.value,
                        }))
                    }
                    inputClassName="font-semibold"
                />
            </div>

            <label className="inline-flex items-center gap-2 text-[16px] text-[#1f2436]">
                <input
                    type="checkbox"
                    checked={values.pphChecked}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            pphChecked: event.target.checked,
                        }))
                    }
                    className="h-[22px] w-[22px] rounded-[4px] border border-[#cfd6e2]"
                />
                <span>Dipotong PPh</span>
            </label>

            <div className="space-y-3 pl-[44px]">
                <div className="flex items-center justify-between gap-4 text-[15px] text-[#1f2436]">
                    <span>{values.pphLabel}</span>
                    <span>{values.pphAmount}</span>
                </div>

                <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-x-4">
                    <TransactionFieldLabel label="No. Bukti Potong" />
                    <TextInput
                        value={values.withholdingProof}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                withholdingProof: event.target.value,
                            }))
                        }
                        trailing={<CloseIcon className="h-4 w-4 text-[#1f2436]" />}
                        className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#111827]"
                    />

                    <TransactionFieldLabel label="Pembayaran" />
                    <TextInput
                        value={values.payment}
                        readOnly
                        className="h-[36px] rounded-[4px] border-[#cfd6e2] bg-[#f7f8fb]"
                        inputClassName="text-right text-[15px] text-[#64748b]"
                    />
                </div>

                <div className="border-l-4 border-[#c7ccd8] pl-3 text-[13px] italic leading-6 text-[#ff4836]">
                    {values.notice}
                </div>
            </div>
        </div>
    );
}

function DiscountInfoTab({ values, setValues }) {
    const discountColumns = useMemo(
        () => [
            { id: 'spacer', label: '', widthClassName: 'w-[52px]', align: 'center' },
            { id: 'account', label: 'Akun Diskon', widthClassName: 'w-[68%]', align: 'left' },
            { id: 'amount', label: 'Diskon', widthClassName: 'w-[32%]', align: 'right' },
        ],
        [],
    );

    return (
        <div className="space-y-4">
            <div className="grid gap-y-4 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-x-4">
                <TransactionFieldLabel label="Akun Diskon" />
                <AccountLookupField
                    values={values.discountAccount}
                    placeholder="Cari/Pilih..."
                    onRemove={() =>
                        setValues((current) => ({
                            ...current,
                            discountAccount: [],
                        }))
                    }
                    searchLabel="Cari akun diskon"
                    dialogTitle="Pilih Akun Diskon"
                    onSelectAccount={(_, label) =>
                        setValues((current) => ({
                            ...current,
                            discountAccount: label ? [label] : [],
                        }))
                    }
                    heightClassName="h-[36px]"
                />

                <TransactionFieldLabel label="Diskon" />
                <div className="max-w-[170px]">
                    <TextInput
                        value={values.discountAmount}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                discountAmount: event.target.value,
                            }))
                        }
                        className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#111827]"
                    />
                </div>

                <TransactionFieldLabel label="Keterangan Diskon" />
                <textarea
                    value={values.discountNotes}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            discountNotes: event.target.value,
                        }))
                    }
                    rows={3}
                    className="min-h-[56px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-[15px] text-[#1f2436] outline-none"
                />

                <TransactionFieldLabel label="Departemen" />
                <ChipLookupField
                    values={values.department}
                    placeholder="Cari/Pilih..."
                    onRemove={() => {}}
                    searchLabel="Cari departemen"
                    heightClassName="h-[36px]"
                />
            </div>

            <div>
                <button
                    type="button"
                    className="inline-flex h-[34px] w-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#21539b]"
                    aria-label="Tambah diskon"
                >
                    <PlusIcon className="h-5 w-5 text-[#21539b]" />
                </button>
            </div>

            <div className="overflow-hidden rounded-[4px] border border-[#d1d8e4]">
                <DataTable wrapperClassName="border-none">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {discountColumns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName} px-2.5 text-[15px] font-medium text-white ${
                                        column.align === 'right'
                                            ? 'text-right'
                                            : column.align === 'center'
                                              ? 'text-center'
                                              : 'text-left'
                                    }`.trim()}
                                >
                                    {column.label}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {values.discountRows.length ? (
                            values.discountRows.map((row, index) => (
                                <DataTableRow
                                    key={`${row.account}-${row.amount}-${index}`}
                                    className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                >
                                    <DataTableCell className="px-2.5 text-center text-[#a8afbe]">
                                        <span className="inline-flex items-center justify-center">
                                            <TableActionIcon className="h-4 w-4" />
                                        </span>
                                    </DataTableCell>
                                    <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">
                                        <span className="block truncate">{row.account}</span>
                                    </DataTableCell>
                                    <DataTableCell className="px-2.5 text-right text-[15px] text-[#131a28]">
                                        <span className="block truncate">{row.amount}</span>
                                    </DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="border-[#dde1e8] bg-white">
                                <DataTableCell className="px-2.5 text-center text-[#a8afbe]">
                                    <span className="inline-flex items-center justify-center">
                                        <TableActionIcon className="h-4 w-4" />
                                    </span>
                                </DataTableCell>
                                <DataTableCell colSpan={2} className="px-2.5 py-6 text-center text-[15px] text-[#131a28]">
                                    Belum ada data
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

export default function PurchasePaymentInvoiceModal({ open, onClose, modal, invoice }) {
    const tabs = modal?.tabs ?? [
        { id: 'invoice', label: 'Faktur' },
        { id: 'discount-info', label: 'Informasi Diskon' },
    ];
    const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? 'invoice');
    const [values, setValues] = useState(() => buildModalState(modal, invoice));

    useEffect(() => {
        setActiveTabId(tabs[0]?.id ?? 'invoice');
        setValues(buildModalState(modal, invoice));
    }, [invoice, modal, open, tabs]);

    if (!modal || !invoice) {
        return null;
    }

    return (
        <ModalBase
            open={open}
            onBackdropClick={onClose}
            className="bg-[rgba(15,23,42,0.72)]"
            panelClassName="max-w-[572px] overflow-hidden rounded-[8px] px-0 py-0 shadow-[0_18px_44px_rgba(15,23,42,0.28)]"
        >
            <div className="bg-[#173968] px-4 py-3 text-white">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <PencilIcon className="h-5 w-5 text-white" />
                        <h2 className="text-[16px] font-medium">{modal.title ?? 'Faktur'}</h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-white transition hover:bg-white/10"
                        aria-label="Tutup rincian faktur"
                    >
                        <CloseIcon className="h-5 w-5 text-white" />
                    </button>
                </div>
            </div>

            <div className="bg-white px-4 pb-4 pt-3">
                <div className="flex flex-wrap border-b border-[#d8dde7]">
                    {tabs.map((tab) => (
                        <ModalTabButton
                            key={tab.id}
                            active={activeTabId === tab.id}
                            label={tab.label}
                            onClick={() => setActiveTabId(tab.id)}
                        />
                    ))}
                </div>

                <div className="min-h-[430px] py-3">
                    {activeTabId === 'discount-info' ? (
                        <DiscountInfoTab values={values} setValues={setValues} />
                    ) : (
                        <InvoiceTab values={values} setValues={setValues} />
                    )}
                </div>

                <ModalFooter />
            </div>
        </ModalBase>
    );
}
