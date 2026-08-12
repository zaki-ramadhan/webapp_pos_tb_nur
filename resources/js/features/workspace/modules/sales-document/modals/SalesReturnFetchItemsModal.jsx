import { useState, useEffect } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Button from '@/components/ui/Button';
import { getBackendResource } from '@/features/workspace/backend/workspaceBackendApi';

export default function SalesReturnFetchItemsModal({
    open,
    onClose,
    relatedDocumentId,
    relatedDocumentRecord,
    relatedDocumentNumber,
    isPurchase = false,
    onConfirmItems,
}) {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());

    useEffect(() => {
        let isMounted = true;
        if (!open) {
            setItems([]);
            setSelectedIds(new Set());
            return;
        }

        async function fetchDocumentItems() {
            setLoading(true);
            try {
                let doc = relatedDocumentRecord;
                if (!doc && relatedDocumentId) {
                    const resourceName = isPurchase ? 'purchase-invoices' : 'sales-invoices';
                    doc = await getBackendResource(resourceName, relatedDocumentId);
                }

                if (!isMounted) return;

                const rawItems = doc?.items ?? doc?.details ?? doc?.attributes?.items ?? [];
                const parsedItems = rawItems.map((item, idx) => {
                    const qty = parseFloat(item.quantity ?? item.qty ?? 1) || 1;
                    const price = parseFloat(String(item.price ?? item.unit_price ?? 0).replace(/[^\d.-]/g, '')) || 0;
                    const discount = parseFloat(String(item.discount ?? 0).replace(/[^\d.-]/g, '')) || 0;
                    const total = Math.max(0, qty * price - discount);

                    return {
                        id: item.id ?? item.item_id ?? `item-${idx}-${Date.now()}`,
                        name: item.name ?? item.item_name ?? item.product_name ?? 'Barang',
                        code: item.code ?? item.item_code ?? item.product_code ?? '',
                        quantity: qty,
                        unit: item.unit ?? item.unit_name ?? 'Pcs',
                        price: price,
                        discount: discount,
                        total: total,
                        __raw: item,
                    };
                });

                setItems(parsedItems);
                setSelectedIds(new Set(parsedItems.map((i) => String(i.id))));
            } catch (err) {
                if (isMounted) setItems([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchDocumentItems();

        return () => {
            isMounted = false;
        };
    }, [open, relatedDocumentId, relatedDocumentRecord, isPurchase]);

    const allSelected = items.length > 0 && selectedIds.size === items.length;

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(items.map((i) => String(i.id))));
        }
    };

    const toggleSelectItem = (id) => {
        const strId = String(id);
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(strId)) {
                next.delete(strId);
            } else {
                next.add(strId);
            }
            return next;
        });
    };

    const handleConfirm = () => {
        const selectedItems = items.filter((i) => selectedIds.has(String(i.id)));
        onConfirmItems?.(selectedItems);
        onClose?.();
    };

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            title="Rincian Barang"
            maxWidthClassName="max-w-[720px]"
            contentClassName="p-0 bg-white"
            footer={
                <div className="flex justify-end w-full">
                    <Button
                        variant="brand-blue"
                        size="md"
                        onClick={handleConfirm}
                        className="!bg-[#2353a0] hover:!bg-[#1f4f96] !border-transparent !text-white font-medium px-6 shadow-btn-blue-hover"
                    >
                        Lanjut
                    </Button>
                </div>
            }
        >
            <div className="w-full overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#5a738e] text-white text-xs font-semibold">
                            <th className="py-2.5 px-3 w-[44px] text-center">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleSelectAll}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer accent-[#2353a0]"
                                />
                            </th>
                            <th className="py-2.5 px-3 font-semibold">Nama Barang</th>
                            <th className="py-2.5 px-3 w-[120px] text-center font-semibold">Kuantitas</th>
                            <th className="py-2.5 px-3 w-[100px] text-center font-semibold">Satuan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-xs sm:text-sm text-zinc-700">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="py-2 text-center text-black italic">
                                    Memuat rincian barang...
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-2 text-center text-black font-normal">
                                    Belum ada data
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => {
                                const isChecked = selectedIds.has(String(item.id));
                                return (
                                    <tr
                                        key={item.id}
                                        onClick={() => toggleSelectItem(item.id)}
                                        className={`cursor-pointer transition-colors hover:bg-slate-50 ${isChecked ? 'bg-blue-50/40' : ''}`}
                                    >
                                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleSelectItem(item.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer accent-[#2353a0]"
                                            />
                                        </td>
                                        <td className="py-3 px-3 font-normal text-zinc-800">
                                            {item.name}
                                        </td>
                                        <td className="py-3 px-3 text-center font-normal text-zinc-700">
                                            {item.quantity}
                                        </td>
                                        <td className="py-3 px-3 text-center font-normal text-zinc-700">
                                            {item.unit}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </WorkspaceDialog>
    );
}
