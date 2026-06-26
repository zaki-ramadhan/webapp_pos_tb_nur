import { useState } from 'react';

import { showSuccessToast } from '@/components/feedback/toast';

export function useFormLineItems({
    applyLineItems,
    setValues,
    onSuccessMessage = 'Rincian diperbarui.',
    onDeleteMessage = 'Rincian dihapus.',
}) {
    const [lineItemModalOpen, setLineItemModalOpen] = useState(false);
    const [modalRecord, setModalRecord] = useState(null);
    const [modalCurrentItem, setModalCurrentItem] = useState(null);

    function applyLineItemUpdate(record, currentItem = null) {
        setModalRecord(record);
        setModalCurrentItem(currentItem);
        setLineItemModalOpen(true);
    }

    function handleSaveLineItem(nextItem) {
        setLineItemModalOpen(false);
        setModalRecord(null);
        setModalCurrentItem(null);

        if (nextItem.action === 'delete') {
            if (modalCurrentItem) {
                setValues((current) =>
                    applyLineItems(
                        { ...current, lineLookup: '' },
                        (current.lineItems ?? []).filter((item) => item.id !== modalCurrentItem.id),
                    ),
                );
                showSuccessToast({ message: onDeleteMessage });
            }
            return;
        }

        setValues((current) =>
            applyLineItems(
                { ...current, lineLookup: '' },
                modalCurrentItem
                    ? (current.lineItems ?? []).map((item) => (item.id === modalCurrentItem.id ? nextItem : item))
                    : [...(current.lineItems ?? []), nextItem],
            ),
        );
        showSuccessToast({
            message: modalCurrentItem ? onSuccessMessage : 'Rincian ditambahkan.',
        });
    }

    return {
        lineItemModalOpen,
        setLineItemModalOpen,
        modalRecord,
        setModalRecord,
        modalCurrentItem,
        setModalCurrentItem,
        applyLineItemUpdate,
        handleSaveLineItem,
    };
}
