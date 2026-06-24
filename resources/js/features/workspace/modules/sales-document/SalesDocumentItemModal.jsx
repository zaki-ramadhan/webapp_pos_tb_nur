import { useEffect, useState } from 'react';

import DocumentModalLayout, {
    DocumentModalFooter,
} from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import {
    ItemDetailTab,
    ItemInfoTab,
    ItemSerialTab,
} from '@/features/workspace/modules/shared/document-modal/SalesDocumentItemModalTabs';

export default function SalesDocumentItemModal({ open, onClose, modal }) {
    const [activeTabId, setActiveTabId] = useState(modal?.tabs?.[0]?.id ?? 'details');

    useEffect(() => {
        if (!open) {
            setActiveTabId(modal?.tabs?.[0]?.id ?? 'details');
        }
    }, [modal?.tabs, open]);

    if (!modal) {
        return null;
    }

    const activeTabIdSafe = modal.tabs.some((tab) => tab.id === activeTabId) ? activeTabId : modal.tabs[0]?.id ?? 'details';
    const detail = modal.values ?? {};

    return (
        <DocumentModalLayout
            open={open}
            onClose={onClose}
            title={modal.title}
            tabs={modal.tabs}
            activeTabId={activeTabIdSafe}
            onTabChange={setActiveTabId}
            closeAriaLabel="Tutup rincian barang"
            panelClassName="max-w-[620px] overflow-hidden rounded-[8px] px-0 py-0 shadow-modal-import"
            bodyClassName="min-h-[336px] py-3"
            footer={<DocumentModalFooter deleteLabel={modal.deleteLabel} submitLabel={modal.submitLabel} />}
        >
            {activeTabIdSafe === 'serial' ? (
                <ItemSerialTab detail={detail} />
            ) : activeTabIdSafe === 'info' ? (
                <ItemInfoTab detail={detail} />
            ) : (
                <ItemDetailTab detail={detail} />
            )}
        </DocumentModalLayout>
    );
}
