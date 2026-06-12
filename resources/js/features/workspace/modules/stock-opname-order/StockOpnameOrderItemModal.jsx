import ModalBase from '@/components/ui/ModalBase';
import TextInput from '@/components/ui/TextInput';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { CloseIcon, PencilIcon } from '@/features/workspace/shared/Icons';

function ModalFieldRow({ label, children }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[168px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
            <TransactionFieldLabel label={label} className="text-base" />
            <div>{children}</div>
        </div>
    );
}

export default function StockOpnameOrderItemModal({ open, onClose, modal, item }) {
    if (!open || !modal || !item) {
        return null;
    }

    return (
        <ModalBase
            open={open}
            onBackdropClick={onClose}
            className="bg-[rgba(15,23,42,0.72)]"
            panelClassName="max-w-[620px] overflow-hidden rounded-[8px] px-0 py-0 shadow-[0_18px_44px_rgba(15,23,42,0.28)]"
        >
            <div className="bg-[#173968] px-4 py-3 text-white">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <PencilIcon className="h-5 w-5 text-white" />
                        <h2 className="text-base font-medium">{modal.title}</h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-white transition hover:bg-white/10"
                        aria-label="Tutup rincian barang"
                    >
                        <CloseIcon className="h-5 w-5 text-white" />
                    </button>
                </div>
            </div>

            <div className="bg-white px-4 pb-4 pt-3">
                <div className="flex items-end gap-1 border-b border-[#d8dde7]">
                    <button
                        type="button"
                        className="border-b-2 border-[#ff4836] px-3 py-2 text-base text-[#ff4836]"
                    >
                        Rincian Barang
                    </button>
                </div>

                <div className="space-y-3 px-2 py-4">
                    <ModalFieldRow label="Kode #">
                        <div className="flex h-[36px] items-center text-base font-semibold text-[#22a3f2]">
                            {item.code}
                        </div>
                    </ModalFieldRow>

                    <ModalFieldRow label="Nama Barang">
                        <TextInput
                            value={item.name}
                            readOnly
                            className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        />
                    </ModalFieldRow>

                    <ModalFieldRow label="Kuantitas (Sistem)">
                        <TextInput
                            value={item.systemQuantity}
                            readOnly
                            className="h-[36px] rounded-[4px] border-[#cfd6e2] max-w-[160px]"
                            inputClassName="text-right text-xs sm:text-sm text-[#1f2436]"
                        />
                    </ModalFieldRow>

                    <ModalFieldRow label="Kuantitas (Hitung)">
                        <TextInput
                            value={item.countedQuantity}
                            readOnly
                            className="h-[36px] rounded-[4px] border-[#cfd6e2] max-w-[160px]"
                            inputClassName="text-right text-xs sm:text-sm text-[#1f2436]"
                        />
                    </ModalFieldRow>

                    <ModalFieldRow label="Satuan">
                        <TextInput
                            value={item.unit}
                            readOnly
                            className="h-[36px] rounded-[4px] border-[#cfd6e2] max-w-[120px]"
                            inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        />
                    </ModalFieldRow>
                </div>

                <div className="flex justify-end border-t border-[#d8dde7] pt-4">
                    <button
                        type="button"
                        className="inline-flex h-[40px] items-center justify-center rounded-[4px] bg-[#1d52a5] px-5 text-base font-medium text-white"
                        onClick={onClose}
                    >
                        {modal.submitLabel ?? 'Lanjut'}
                    </button>
                </div>
            </div>
        </ModalBase>
    );
}
