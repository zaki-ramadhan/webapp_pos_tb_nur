import { useState, useEffect, useCallback } from 'react';

export const SMARTLINK_STORAGE_KEY = 'pos_tb_nur_smartlink_accounts';
export const SMARTLINK_UPDATED_EVENT = 'smartlink-accounts-updated';

export const DEFAULT_SMARTLINK_ACCOUNTS = [
    {
        id: '1',
        serviceType: 'BRI Mobile (BRIMO)',
        accountNumber: '123123',
        name: '123123',
        tabLabel: '123123',
        label: '123123',
        accountId: '110102',
        accountRelation: 'Bank BRI',
        accountName: 'Bank BRI',
    },
    {
        id: '2',
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

export function sanitizeSmartlinkAccount(item) {
    if (!item) return null;
    const accNumber = String(item.accountNumber || item.name || '').trim();
    const cleanRelation = String(item.accountRelation || item.accountName || '').replace(/^\[.*?\]\s*/, '').trim();
    return {
        ...item,
        id: String(item.id),
        accountNumber: accNumber,
        name: accNumber,
        tabLabel: accNumber,
        label: accNumber,
        accountId: item.accountId ? String(item.accountId) : '',
        accountRelation: cleanRelation,
        accountName: cleanRelation,
        serviceType: item.serviceType || 'BRI Mobile (BRIMO)',
    };
}

export function getSmartlinkAccounts() {
    if (typeof window === 'undefined') return DEFAULT_SMARTLINK_ACCOUNTS;
    try {
        const saved = window.localStorage.getItem(SMARTLINK_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map(sanitizeSmartlinkAccount).filter(Boolean);
            }
        }
    } catch {
        // fallback
    }
    return DEFAULT_SMARTLINK_ACCOUNTS.map(sanitizeSmartlinkAccount);
}

export function saveSmartlinkAccounts(accounts) {
    if (typeof window === 'undefined') return;
    const sanitized = (accounts || []).map(sanitizeSmartlinkAccount).filter(Boolean);
    try {
        window.localStorage.setItem(SMARTLINK_STORAGE_KEY, JSON.stringify(sanitized));
    } catch {
        // ignore storage errors
    }
    window.dispatchEvent(new CustomEvent(SMARTLINK_UPDATED_EVENT, { detail: sanitized }));
}

export function useSmartlinkAccounts() {
    const [accounts, setAccounts] = useState(getSmartlinkAccounts);

    useEffect(() => {
        const handleUpdate = (e) => {
            if (e?.detail && Array.isArray(e.detail)) {
                setAccounts(e.detail.map(sanitizeSmartlinkAccount).filter(Boolean));
            } else {
                setAccounts(getSmartlinkAccounts());
            }
        };

        window.addEventListener(SMARTLINK_UPDATED_EVENT, handleUpdate);
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener(SMARTLINK_UPDATED_EVENT, handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, []);

    const updateAccounts = useCallback((newAccounts) => {
        saveSmartlinkAccounts(newAccounts);
        setAccounts((newAccounts || []).map(sanitizeSmartlinkAccount).filter(Boolean));
    }, []);

    return { accounts, updateAccounts };
}
