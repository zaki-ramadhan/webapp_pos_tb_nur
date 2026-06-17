import DocumentModalLayout, {
    DocumentModalFooter,
} from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import TextInput from '@/components/ui/TextInput';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

function ModalFieldRow({ label, children }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[168px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
            <TransactionFieldLabel label={label} className="text-xs font-normal text-slate-700" />
            <div>{children}</div>
        </div>
    );
}

export default function StockOpnameOrderItemModal({ open, onClose, modal, item }) {
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
            panelClassName="max-w-[620px] overflow-hidden rounded-[8px] px-0 py-0 shadow-[0_18px_44px_rgba(15,23,42,0.28)]"
            bodyClassName="min-h-[220px] py-4"
            footer={
                <DocumentModalFooter
                    submitLabel={modal.submitLabel}
                    onDelete={onClose}
                    onSubmit={onClose}
                />
            }
        >
            <div className="space-y-3 px-2">
                <ModalFieldRow label="Kode #">
                    <div className="flex h-[36px] items-center text-xs sm:text-sm font-medium text-[#22a3f2]">
                        {item.code}
                    </div>
                </ModalFieldRow>

                <ModalFieldRow label="Nama Barang">
                    <TextInput
                        value={item.name}
                        readOnly
                        className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs text-[#1f2436]"
                    />
                </ModalFieldRow>

                <ModalFieldRow label="Kuantitas (Sistem)">
                    <TextInput
                        value={item.systemQuantity}
                        readOnly
                        className="h-[36px] rounded-[4px] border-[#cfd6e2] max-w-[160px]"
                        inputClassName="text-right text-xs text-[#1f2436]"
                    />
                </ModalFieldRow>

                <ModalFieldRow label="Kuantitas (Hitung)">
                    <TextInput
                        value={item.countedQuantity}
                        readOnly
                        className="h-[36px] rounded-[4px] border-[#cfd6e2] max-w-[160px]"
                        inputClassName="text-right text-xs text-[#1f2436]"
                    />
                </ModalFieldRow>

                <ModalFieldRow label="Satuan">
                    <TextInput
                        value={item.unit}
                        readOnly
                        className="h-[36px] rounded-[4px] border-[#cfd6e2] max-w-[120px]"
                        inputClassName="text-xs text-[#1f2436]"
                    />
                </ModalFieldRow>
            </div>
        </DocumentModalLayout>
    );
}
