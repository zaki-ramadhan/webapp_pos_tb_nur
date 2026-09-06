import ConfirmationModal from '@/components/ui/ConfirmationModal';
import ImportItemsModal from '@/features/workspace/shared/ImportItemsModal';
import SalesDocumentItemModal from '@/features/workspace/modules/sales-document/SalesDocumentItemModal';
import SalesDocumentItemEditModal from '@/features/workspace/modules/sales-document/SalesDocumentItemEditModal';
import SalesDocumentCostEditModal from '@/features/workspace/modules/sales-document/SalesDocumentCostEditModal';
import SalesDocumentAdvanceEditModal from '@/features/workspace/modules/sales-document/SalesDocumentAdvanceEditModal';
import SalesReturnFetchItemsModal from '@/features/workspace/modules/sales-document/modals/SalesReturnFetchItemsModal';
import { parseNumericInput } from '@/features/workspace/backend/operationDocumentBackend';
import { showSuccessToast } from '@/components/feedback/toast';
import { applyComputedTotals } from '../salesDocumentFormShared';

export default function SalesDocumentModals({
    pageId,
    values,
    setValues,
    handlers = {},
    saving = false,
    onDelete,
    itemModalOpen,
    setItemModalOpen,
    editItemOpen,
    setEditItemOpen,
    editingProduct,
    editingItem,
    handleItemEditSubmit,
    handleItemDelete,
    editCostOpen,
    setEditCostOpen,
    editingCostItem,
    setEditingCostItem,
    editAdvanceOpen,
    setEditAdvanceOpen,
    editingAdvanceItem,
    returnFetchItemsModalOpen,
    setReturnFetchItemsModalOpen,
    importModalOpen,
    setImportModalOpen,
    deleteConfirmationOpen,
    setDeleteConfirmationOpen,
    stockWarningOpen,
    setStockWarningOpen,
    stockWarningData,
    handleContinueSave,
}) {
    return (
        <>
            <SalesDocumentItemModal
                open={itemModalOpen}
                onClose={() => setItemModalOpen(false)}
                modal={values.itemModal}
            />
            <SalesDocumentItemEditModal
                open={editItemOpen}
                onClose={() => setEditItemOpen(false)}
                product={editingProduct}
                item={editingItem}
                onSubmit={handleItemEditSubmit}
                onDelete={handleItemDelete}
            />
            <SalesDocumentCostEditModal
                open={editCostOpen}
                onClose={() => {
                    setEditCostOpen(false);
                    setEditingCostItem(null);
                }}
                item={editingCostItem}
                onSubmit={(nextCost) => {
                    const exists = (values.additionalCosts ?? []).some((entry) => entry.id === editingCostItem?.id);
                    setValues((current) => {
                        const nextCosts = exists
                            ? (current.additionalCosts ?? []).map((entry) =>
                                  entry.id === editingCostItem.id ? nextCost : entry
                              )
                            : [...(current.additionalCosts ?? []), nextCost];
                        const updatedValues = {
                            ...current,
                            additionalCosts: nextCosts,
                        };
                        return applyComputedTotals(updatedValues, updatedValues.items);
                    });
                    showSuccessToast({
                        message: exists
                            ? 'Biaya diperbarui.'
                            : `Biaya [${nextCost.code ?? ''}] ${nextCost.name} ditambahkan.`
                    });
                }}
                onDelete={(target) => {
                    setValues((current) => {
                        const updatedValues = {
                            ...current,
                            additionalCosts: (current.additionalCosts ?? []).filter((entry) =>
                                entry.id !== target.id
                            ),
                        };
                        return applyComputedTotals(updatedValues, updatedValues.items);
                    });
                    showSuccessToast({ message: 'Biaya dihapus.' });
                }}
            />
            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={onDelete}
                title="Konfirmasi"
                message={
                    values.items && values.items.length > 0 ? (
                        `Apakah Anda yakin akan melakukan penghapusan data:\n${values.documentNumber}\n\nDokumen ini memiliki ${values.items.length} baris detail transaksi yang akan ikut terhapus permanen.`
                    ) : (
                        `Apakah Anda yakin akan melakukan penghapusan data:\n${values.documentNumber}`
                    )
                }
                confirmLabel="Ya"
                cancelLabel="Batal"
                confirmVariant="primary"
                confirmLoading={saving}
            />
            <SalesDocumentAdvanceEditModal
                open={editAdvanceOpen}
                onClose={() => setEditAdvanceOpen(false)}
                item={editingAdvanceItem}
                maxAllowed={(() => {
                    const remainingInvoice = Math.max(0, parseNumericInput(values.total) - (values.advancePayments ?? [])
                        .filter((entry) => entry.id !== editingAdvanceItem?.id && entry.__depositId !== editingAdvanceItem?.__depositId)
                        .reduce((sum, entry) => sum + parseNumericInput(entry.amount), 0));
                    const depositAvailable = editingAdvanceItem?.availableAmount ?? Infinity;
                    return Math.min(remainingInvoice, depositAvailable);
                })()}
                onSubmit={(nextAdvance) => {
                    const exists = (values.advancePayments ?? []).some((entry) => entry.id === nextAdvance.id || entry.__depositId === nextAdvance.__depositId);
                    setValues((current) => {
                        const list = current.advancePayments ?? [];
                        const nextList = exists
                            ? list.map((entry) => (entry.id === nextAdvance.id || entry.__depositId === nextAdvance.__depositId) ? nextAdvance : entry)
                            : [...list, nextAdvance];
                        return {
                            ...current,
                            advancePayments: nextList,
                        };
                    });
                    showSuccessToast({
                        message: exists
                            ? `Uang muka [${nextAdvance.number}] diperbarui.`
                            : `Uang muka [${nextAdvance.number}] ditambahkan.`
                    });
                }}
                onDelete={(target) => {
                    setValues((current) => ({
                        ...current,
                        advancePayments: (current.advancePayments ?? []).filter((entry) =>
                            entry.id !== target.id && entry.__depositId !== target.__depositId
                        ),
                    }));
                    showSuccessToast({ message: `Rujukan uang muka [${target.number}] dihapus.` });
                }}
            />
            <SalesReturnFetchItemsModal
                open={returnFetchItemsModalOpen}
                onClose={() => setReturnFetchItemsModalOpen(false)}
                relatedDocumentId={values.__relatedDocumentId}
                relatedDocumentRecord={values.__relatedDocumentRecord}
                relatedDocumentNumber={Array.isArray(values.returnSourceReferences) ? values.returnSourceReferences[0] : ''}
                isPurchase={String(pageId || '').toLowerCase().includes('purchase')}
                onConfirmItems={handlers.onConfirmReturnItems}
            />
            <ImportItemsModal
                open={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onImport={handlers.onImportItems}
                mode={String(pageId || '').toLowerCase().includes('purchase') || String(pageId || '').toLowerCase().includes('receipt') ? 'purchasing' : 'sales'}
            />
            {stockWarningOpen && stockWarningData && (
                <ConfirmationModal
                    open={stockWarningOpen}
                    onClose={() => setStockWarningOpen(false)}
                    title="Faktur Penjualan"
                    message={`Stok barang "${stockWarningData.product_name}" di gudang "${stockWarningData.warehouse_name}" tidak mencukupi.\n\nStok untuk dijual dari barang "${stockWarningData.product_name}" tidak mencukupi.`}
                    confirmLabel="Lanjutkan"
                    cancelLabel="Batal"
                    confirmVariant="success"
                    onConfirm={handleContinueSave}
                />
            )}
        </>
    );
}
