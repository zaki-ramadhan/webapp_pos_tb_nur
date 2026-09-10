import { useState, useRef, useEffect, useMemo } from 'react';
import TextInput from '@/components/ui/TextInput';
import { SearchIcon, LoadingIcon } from '@/features/workspace/shared/Icons';
import { useSmartlinkAccounts } from './smartlinkStore';
import { Check, Building2, ExternalLink } from 'lucide-react';

export default function SmartlinkBankLookupInput({
    id = 'smartlink-bank-lookup',
    value = '',
    placeholder = 'Cari/Pilih...',
    disabled = false,
    className = '',
    inputClassName = '',
    trailingClassName = '',
    onChange = null,
}) {
    const { accounts } = useSmartlinkAccounts();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const rootRef = useRef(null);
    const inputRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        function handlePointerDown(e) {
            if (rootRef.current && !rootRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [open]);

    const filteredAccounts = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return accounts;
        return accounts.filter((acc) => {
            const rel = String(acc.accountRelation || acc.accountName || '').toLowerCase();
            const num = String(acc.accountNumber || '').toLowerCase();
            const srv = String(acc.serviceType || '').toLowerCase();
            return rel.includes(q) || num.includes(q) || srv.includes(q);
        });
    }, [accounts, query]);

    const handleSelect = (acc) => {
        const label = acc.accountRelation || acc.accountName || acc.accountNumber || '';
        onChange?.(label, {
            account_id: acc.accountId ? Number(acc.accountId) || acc.accountId : null,
            smartlink_account_id: acc.id,
            account_number: acc.accountNumber,
            service_type: acc.serviceType,
        });
        setOpen(false);
        setQuery('');
    };

    const handleClear = () => {
        onChange?.('', {
            account_id: null,
            smartlink_account_id: null,
            account_number: '',
            service_type: '',
        });
        setQuery('');
        setOpen(false);
    };

    const handleOpenSmartlinkPage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        window.dispatchEvent(
            new CustomEvent('workspace:open-page', {
                detail: { pageId: 'smartlink-bank' },
            }),
        );
    };

    const isSelected = Boolean(value);

    return (
        <div ref={rootRef} className="relative w-full">
            <div
                onClick={() => {
                    if (!disabled) {
                        setOpen(true);
                        inputRef.current?.focus();
                    }
                }}
                className={`relative flex items-center w-full rounded-[4px] border border-ui-border bg-white cursor-pointer transition-colors focus-within:border-brand-blue ${className}`.trim()}
            >
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    readOnly
                    disabled={disabled}
                    value={value}
                    placeholder={placeholder}
                    onFocus={() => setOpen(true)}
                    className={`w-full h-full bg-transparent px-3 text-sm text-brand-dark placeholder-slate-400 outline-none cursor-pointer ${inputClassName}`.trim()}
                />

                <div className={`flex items-center gap-1.5 pr-2.5 shrink-0 ${trailingClassName}`}>
                    {isSelected && !disabled ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
                            aria-label="Hapus pilihan"
                        >
                            <span className="text-sm font-semibold leading-none">&times;</span>
                        </button>
                    ) : null}
                    <SearchIcon className="h-4.5 w-4.5 text-text-darkest pointer-events-none" />
                </div>
            </div>

            {open && (
                <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[300px] sm:min-w-[360px] max-w-md rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="border-b border-slate-100 bg-slate-50 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                Bank SmartLink e-Banking
                            </span>
                            <button
                                type="button"
                                onClick={handleOpenSmartlinkPage}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-blue hover:underline cursor-pointer"
                            >
                                <span>Kelola Akun</span>
                                <ExternalLink className="h-3 w-3" />
                            </button>
                        </div>
                        {accounts.length > 3 && (
                            <div className="mt-1.5 relative">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Cari rekening atau bank..."
                                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-brand-blue"
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>

                    <div className="max-h-[260px] overflow-y-auto divide-y divide-slate-100">
                        {filteredAccounts.length > 0 ? (
                            filteredAccounts.map((acc) => {
                                const label = acc.accountRelation || acc.accountName || acc.name;
                                const isCurrent = value === label;

                                return (
                                    <button
                                        key={acc.id}
                                        type="button"
                                        onClick={() => handleSelect(acc)}
                                        className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer hover:bg-slate-50 ${
                                            isCurrent ? 'bg-blue-50/70' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-2.5 min-w-0">
                                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-600">
                                                <Building2 className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                                                    {label}
                                                </div>
                                                <div className="text-[11px] text-slate-500 truncate">
                                                    No. Rek: <span className="font-mono text-slate-700">{acc.accountNumber}</span> • {acc.serviceType}
                                                </div>
                                            </div>
                                        </div>
                                        {isCurrent && (
                                            <Check className="h-4 w-4 shrink-0 text-brand-blue" />
                                        )}
                                    </button>
                                );
                            })
                        ) : accounts.length === 0 ? (
                            <div className="p-4 text-center">
                                <p className="text-xs text-slate-500 mb-2">
                                    Belum ada akun bank yang didaftarkan di SmartLink e-Banking.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleOpenSmartlinkPage}
                                    className="inline-flex items-center gap-1 rounded bg-brand-blue px-3 py-1.5 text-xs text-white hover:bg-brand-blue-hover cursor-pointer"
                                >
                                    <span>Daftarkan Akun Bank</span>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ) : (
                            <div className="p-3 text-center text-xs text-slate-400">
                                Tidak ada akun bank yang cocok dengan "{query}"
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
