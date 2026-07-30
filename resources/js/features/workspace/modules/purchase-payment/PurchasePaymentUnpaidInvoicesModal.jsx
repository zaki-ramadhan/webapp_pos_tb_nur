import UnpaidDocumentsSelectionModal from '@/features/workspace/modules/shared/document-modal/UnpaidDocumentsSelectionModal';

export default function PurchasePaymentUnpaidInvoicesModal({
    open = false,
    onClose,
    onConfirm,
    supplierId = null,
}) {
    return (
        <UnpaidDocumentsSelectionModal
            open={open}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Daftar Faktur Pembelian Belum Lunas"
            resource="purchase-invoices"
            partnerId={supplierId}
            partnerQueryKey="supplier_id"
        />
    );
}
