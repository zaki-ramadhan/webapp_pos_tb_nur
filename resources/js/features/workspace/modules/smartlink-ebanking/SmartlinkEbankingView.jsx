import { useState, useMemo, useEffect, useCallback } from 'react';
import SmartlinkEbankingTableView from './SmartlinkEbankingTableView';
import SmartlinkEbankingFormView from './SmartlinkEbankingFormView';

const STORAGE_KEY = 'pos_tb_nur_smartlink_accounts';

const DEFAULT_ACCOUNTS = [
    {
        id: '1',
        serviceType: 'BRI Mobile (BRIMO)',
        accountNumber: '0129-01-002847-50-8',
        name: '0129-01-002847-50-8',
        tabLabel: '0129-01-002847-50-8',
        label: '0129-01-002847-50-8',
        accountId: '110102',
        accountRelation: 'Bank BRI',
        accountName: 'Bank BRI',
    },
];

function sanitizeAccount(item) {
    const accNumber = item.accountNumber || item.name || '';
    const cleanRelation = (item.accountRelation || '').replace(/^\[.*?\]\s*/, '');
    return {
        ...item,
        id: String(item.id),
        accountNumber: accNumber,
        name: accNumber,
        tabLabel: accNumber,
        label: accNumber,
        accountRelation: cleanRelation,
        accountName: item.accountName || cleanRelation,
        serviceType: item.serviceType || 'BRI Mobile (BRIMO)',
    };
}

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
    const [accounts, setAccounts] = useState(() => {
        try {
            const saved = window.localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.map(sanitizeAccount);
                }
            }
        } catch {
            // fallback
        }
        const initialRows = page?.table?.rows?.length ? page.table.rows : DEFAULT_ACCOUNTS;
        return initialRows.map(sanitizeAccount);
    });

    const persistAccounts = useCallback((newAccounts) => {
        const sanitized = newAccounts.map(sanitizeAccount);
        setAccounts(sanitized);
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
        } catch {
            // ignore
        }
    }, []);

    const handleSaveAccount = (record, isEdit) => {
        const cleanRecord = sanitizeAccount(record);
        let updated;
        if (isEdit) {
            updated = accounts.map((item) => (String(item.id) === String(cleanRecord.id) ? cleanRecord : item));
        } else {
            updated = [cleanRecord, ...accounts];
        }
        persistAccounts(updated);

        if (isEdit) {
            onCloseDetail?.(cleanRecord.id);
        } else if (activeLevel2Tab?.id) {
            onCloseTab?.(activeLevel2Tab.id);
        }
    };

    const handleDeleteAccount = (id) => {
        const updated = accounts.filter((item) => String(item.id) !== String(id));
        persistAccounts(updated);
        onCloseDetail?.(id);
        if (activeLevel2Tab?.id) {
            onCloseTab?.(activeLevel2Tab.id);
        }
    };

    const tableConfig = useMemo(() => ({
        columns: page?.table?.columns || [
            { id: 'accountNumber', label: 'No. Rekening Bank', align: 'left', widthClassName: 'w-[30%]' },
            { id: 'accountRelation', label: 'Relasi Akun...', align: 'left', widthClassName: 'w-[35%]' },
            { id: 'serviceType', label: 'Jenis Internet Banking', align: 'left', widthClassName: 'w-[35%]' },
        ],
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
                        try {
                            const saved = window.localStorage.getItem(STORAGE_KEY);
                            if (saved) {
                                const parsed = JSON.parse(saved);
                                if (Array.isArray(parsed) && parsed.length > 0) {
                                    setAccounts(parsed.map(sanitizeAccount));
                                }
                            }
                        } catch {
                            // ignore
                        }
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
