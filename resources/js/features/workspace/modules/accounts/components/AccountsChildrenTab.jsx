import { useMemo } from 'react';
import EmptyState from '@/components/ui/EmptyState';

export function AccountsChildrenTab({ values, onOpenDetail }) {
    const allRows = useMemo(() => {
        const rows = [];
        if (values.name) {
            rows.push({
                id: values.id,
                name: values.name,
                code: values.code,
                level: 0,
                isCurrent: true,
            });
        }
        if (Array.isArray(values.childAccounts)) {
            values.childAccounts.forEach((child) => {
                rows.push({
                    id: String(child.id),
                    name: child.name ?? '',
                    code: child.code ?? '',
                    level: 1,
                    isCurrent: false,
                });
            });
        }
        return rows;
    }, [values.id, values.name, values.code, values.childAccounts]);

    if (!values.childAccounts || values.childAccounts.length === 0) {
        return (
            <div className="w-full flex justify-center py-6">
                <EmptyState
                    title="Tidak Ada Akun Anak"
                    description="Akun perkiraan ini tidak memiliki sub-akun/akun anak."
                    iconName="default"
                    size="sm"
                    tone="subtle"
                />
            </div>
        );
    }

    function handleRowClick(item) {
        if (!item.isCurrent && item.id) {
            onOpenDetail?.({
                recordId: String(item.id),
                label: item.name,
                tabLabel: item.name,
            });
        }
    }

    return (
        <div className="grid gap-7 grid-cols-[minmax(0,1fr)_310px] max-w-[850px]">
            <div className="space-y-1.5">
                {allRows.map((item) => (
                    <div
                        key={`name-${item.id}`}
                        onClick={() => handleRowClick(item)}
                        title={item.isCurrent ? 'Akun Induk Saat Ini (Tidak dapat diklik)' : `Buka detail ${item.name}`}
                        className={`rounded-[3px] px-4 py-2.5 text-xs sm:text-sm text-brand-dark transition-all ${
                            item.isCurrent
                                ? 'bg-[#d8dbde] font-medium cursor-default select-none'
                                : 'bg-[#d8dbde] hover:bg-[#c4c9d1] cursor-pointer active:scale-[0.995]'
                        }`}
                        style={{ paddingLeft: `${16 + item.level * 20}px` }}
                    >
                        {item.name}
                    </div>
                ))}
            </div>

            <div className="space-y-1.5">
                {allRows.map((item) => (
                    <div
                        key={`code-${item.id}`}
                        onClick={() => handleRowClick(item)}
                        title={item.isCurrent ? 'Akun Induk Saat Ini (Tidak dapat diklik)' : `Buka detail ${item.name}`}
                        className={`rounded-[3px] px-4 py-2.5 text-xs sm:text-sm text-brand-dark transition-all ${
                            item.isCurrent
                                ? 'bg-[#d8dbde] font-medium cursor-default select-none'
                                : 'bg-[#d8dbde] hover:bg-[#c4c9d1] cursor-pointer active:scale-[0.995]'
                        }`}
                    >
                        {item.code}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AccountsChildrenTab;
