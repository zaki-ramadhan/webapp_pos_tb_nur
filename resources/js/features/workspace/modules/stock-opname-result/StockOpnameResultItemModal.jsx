import DocumentModalLayout, {
    DocumentModalFooter,
} from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import TextInput from '@/components/ui/TextInput';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { CloseIcon, SearchIcon } from '@/features/workspace/shared/Icons';

function ModalFieldRow({ label, children }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[156px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
            <TransactionFieldLabel label={label} className="text-xs font-normal text-slate-700" />
            <div>{children}</div>
        </div>
    );
}

function QuantityUnitField({ quantity, unit }) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <TextInput
                value={quantity}
                readOnly
                className="h-[34px] rounded-[4px] border-[#cfd6e2] sm:max-w-[160px]"
                inputClassName="text-right text-xs text-[#1f2436]"
            />

            <div className="inline-flex h-[34px] overflow-hidden rounded-[4px] border border-[#7aa2d5] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <span className="inline-flex items-center bg-[#eaf3ff] px-3 text-xs font-medium text-[#2353a0]">{unit}</span>
                <button
                    type="button"
                    className="inline-flex w-9 items-center justify-center border-l border-[#cfe0f4] text-[#2353a0]"
                    aria-label={`Hapus satuan ${unit}`}
                >
                    <CloseIcon className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    className="inline-flex w-10 items-center justify-center border-l border-[#cfe0f4] text-[#1f2436]"
                    aria-label="Cari satuan"
                >
                    <SearchIcon className="h-4 w-4 text-[#1f2436]" />
                </button>
            </div>
        </div>
    );
}

export default function StockOpnameResultItemModal({ open, onClose, modal, item }) {
    if (!open || !modal || !item) {
        return null;
    }

    const tabs = [{ id: 'details', label: 'Rincian Barang' }];

    return (
        <DocumentModalLayout
            open={open}
            onClose={onClose}
            title={modal.title}
            tabs={tabs}
            activeTabId="details"
            onTabChange={() => {}}
            closeAriaLabel="Tutup rincian barang"
            panelClassName="max-w-[540px] overflow-hidden rounded-[8px] px-0 py-0 shadow-[0_18px_44px_rgba(15,23,42,0.28)]"
            bodyClassName="min-h-[220px] py-4"
            footer={
                <DocumentModalFooter
                    deleteLabel={modal.deleteLabel}
                    submitLabel={modal.submitLabel}
                    onDelete={onClose}
                    onSubmit={onClose}
                />
            }
        >
            <div className="space-y-3 px-1">
                <ModalFieldRow label="Kode #">
                    <div className="flex h-[34px] items-center text-xs sm:text-sm font-medium text-[#22a3f2]">{item.code}</div>
                </ModalFieldRow>

                <ModalFieldRow label="Nama Barang">
                    <TextInput
                        value={item.name}
                        readOnly
                        className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs text-[#1f2436]"
                    />
                </ModalFieldRow>

                <ModalFieldRow label="Kuantitas">
                    <QuantityUnitField quantity={item.quantity} unit={item.unit} />
                </ModalFieldRow>
            </div>
        </DocumentModalLayout>
    );
}
