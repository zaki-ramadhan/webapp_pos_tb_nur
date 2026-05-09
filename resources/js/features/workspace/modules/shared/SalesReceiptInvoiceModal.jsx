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
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    CloseIcon,
    PencilIcon,
    PlusIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';

function buildModalState(modal) {
    const source = modal ?? {};

    return {
        invoiceNumber: source.invoiceNumber ?? '',
        invoiceDate: source.invoiceDate ?? '',
        outstanding: source.outstanding ?? '',
        payment: source.payment ?? '',
        discountAccount: [...(source.discountAccount ?? [])],
        discountAmount: source.discountAmount ?? '',
        discountNotes: source.discountNotes ?? '',
        department: [...(source.department ?? [])],
        discountRows: [...(source.discountRows ?? [])],
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

function CurrencyField({
    value,
    onChange,
    readOnly = false,
    prefix = 'Rp',
    className = '',
    inputClassName = '',
}) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            prefix={prefix}
            className={`h-[36px] rounded-[4px] border-[#cfd6e2] ${className}`.trim()}
            prefixClassName="min-w-[48px] justify-center bg-[#f5f6f8] px-0 text-[#9aa3b1]"
            inputClassName={`text-right text-[15px] text-[#111827] ${inputClassName}`.trim()}
        />
    );
}

function FakturTab({ values, setValues }) {
    return (
        <div className="grid gap-y-4 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-x-4">
            <TransactionFieldLabel label="No. Faktur" />
            <TextInput
                value={values.invoiceNumber}
                readOnly
                className="h-[36px] rounded-[4px] border-[#9ed66f] bg-[#f1fee9]"
                inputClassName="text-[15px] font-semibold text-[#67b52c]"
            />

            <TransactionFieldLabel label="Tgl Faktur" />
            <div className="flex h-[36px] items-center text-[15px] text-[#1f2436]">{values.invoiceDate}</div>

            <TransactionFieldLabel label="Terhutang" />
            <TextInput
                value={values.outstanding}
                readOnly
                className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                inputClassName="text-right text-[15px] text-[#64748b]"
            />

            <TransactionFieldLabel label="Bayar" />
            <CurrencyField
                value={values.payment}
                onChange={(event) =>
                    setValues((current) => ({
                        ...current,
                        payment: event.target.value,
                    }))
                }
                inputClassName="font-semibold"
            />
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
                <ChipLookupField
                    values={values.discountAccount}
                    placeholder="Cari/Pilih..."
                    onRemove={() => {}}
                    searchLabel="Cari akun diskon"
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

export default function SalesReceiptInvoiceModal({ open, onClose, modal }) {
    const [activeTabId, setActiveTabId] = useState('invoice');
    const [values, setValues] = useState(() => buildModalState(modal));

    useEffect(() => {
        if (!open) {
            setActiveTabId('invoice');
        }

        setValues(buildModalState(modal));
    }, [modal, open]);

    if (!modal) {
        return null;
    }

    return (
        <ModalBase
            open={open}
            onBackdropClick={onClose}
            className="bg-[rgba(15,23,42,0.72)]"
            panelClassName="max-w-[570px] overflow-hidden rounded-[8px] px-0 py-0 shadow-[0_18px_44px_rgba(15,23,42,0.28)]"
        >
            <div className="bg-[#173968] px-4 py-3 text-white">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <PencilIcon className="h-5 w-5 text-white" />
                        <h2 className="text-[16px] font-medium">Faktur</h2>
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
                    <ModalTabButton active={activeTabId === 'invoice'} label="Faktur" onClick={() => setActiveTabId('invoice')} />
                    <ModalTabButton active={activeTabId === 'discount'} label="Informasi Diskon" onClick={() => setActiveTabId('discount')} />
                </div>

                <div className="min-h-[378px] py-3">
                    {activeTabId === 'discount' ? (
                        <DiscountInfoTab values={values} setValues={setValues} />
                    ) : (
                        <FakturTab values={values} setValues={setValues} />
                    )}
                </div>

                <ModalFooter />
            </div>
        </ModalBase>
    );
}
