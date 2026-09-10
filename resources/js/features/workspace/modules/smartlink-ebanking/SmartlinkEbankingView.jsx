import { useMemo } from 'react';
import SmartlinkEbankingTableView from './SmartlinkEbankingTableView';
import SmartlinkEbankingFormView from './SmartlinkEbankingFormView';
import {
    useSmartlinkAccounts,
    saveSmartlinkAccounts,
    sanitizeSmartlinkAccount,
    getSmartlinkAccounts,
} from './smartlinkStore';

export default function SmartlinkEbankingView({
    page,
    mode = 'table',
    activeLevel2Tab,
    level2Tabs = [],
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onCloseTab,
}) {
    const { accounts, updateAccounts } = useSmartlinkAccounts();

    const handleSaveAccount = (record, isEdit) => {
        const cleanRecord = sanitizeSmartlinkAccount(record);
        let updated;
        if (isEdit) {
            updated = accounts.map((item) => (String(item.id) === String(cleanRecord.id) ? cleanRecord : item));
        } else {
            updated = [cleanRecord, ...accounts];
        }
        updateAccounts(updated);

        if (isEdit) {
            onCloseDetail?.(cleanRecord.id);
        } else if (activeLevel2Tab?.id) {
            onCloseTab?.(activeLevel2Tab.id);
        }
    };

    const handleDeleteAccount = (id) => {
        const updated = accounts.filter((item) => String(item.id) !== String(id));
        updateAccounts(updated);
        onCloseDetail?.(id);
        if (activeLevel2Tab?.id) {
            onCloseTab?.(activeLevel2Tab.id);
        }
    };

    const tableConfig = useMemo(() => ({
        columns: (page?.table?.columns || [
            { id: 'accountNumber', label: 'No. Rekening Bank', align: 'left', widthClassName: 'w-[30%]' },
            { id: 'accountRelation', label: 'Relasi Akun Bank', align: 'left', widthClassName: 'w-[35%]' },
            { id: 'serviceType', label: 'Jenis Internet Banking', align: 'left', widthClassName: 'w-[35%]' },
        ]).map((col) => (col.id === 'accountRelation' ? { ...col, label: 'Relasi Akun Bank' } : col)),
        rows: accounts,
        createLabel: page?.table?.createLabel || 'Tambah Akun e-Banking',
        refreshLabel: 'Muat ulang',
        searchPlaceholder: 'Cari data...',
    }), [page?.table, accounts]);

    const handleOpenRowDetail = (detail) => {
        const recordId = detail?.recordId || detail?.id;
        const found = accounts.find((a) => String(a.id) === String(recordId));
        const label = found?.accountNumber || detail?.tabLabel || detail?.label || 'Detail';
        onOpenDetail?.({
            recordId: String(recordId),
            label,
            tabLabel: label,
        });
    };

    return (
        <div className="flex flex-1 flex-col min-h-0 w-full h-full relative">
            <div className={mode === 'table' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                <SmartlinkEbankingTableView
                    table={tableConfig}
                    onCreate={onOpenContent}
                    onOpenDetail={handleOpenRowDetail}
                    onRefresh={() => {
                        updateAccounts(getSmartlinkAccounts());
                    }}
                />
            </div>

            {level2Tabs.map((tab) => {
                if (tab.kind !== 'content') return null;

                const isCurrentForm = mode === 'form' && activeLevel2Tab?.id === tab.id;
                const recordId = tab.tabType === 'detail' ? tab.recordId : null;
                const initialData = recordId ? accounts.find((item) => String(item.id) === String(recordId)) : null;

                return (
                    <div
                        key={tab.id}
                        className={isCurrentForm ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}
                    >
                        <SmartlinkEbankingFormView
                            key={tab.id}
                            page={page}
                            activeLevel2Tab={tab}
                            initialData={initialData}
                            onSaveSuccess={handleSaveAccount}
                            onDeleteSuccess={handleDeleteAccount}
                        />
                    </div>
                );
            })}
        </div>
    );
}
