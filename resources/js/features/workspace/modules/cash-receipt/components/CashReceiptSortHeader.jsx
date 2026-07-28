import { SortIcon } from '@/features/workspace/shared/Icons';

export function CashReceiptSortHeader({ column }) {
    return (
        <span className={`flex items-center gap-2 ${column.align === 'center' ? 'justify-center' : 'justify-start'}`.trim()}>
            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
            <span>{column.label}</span>
        </span>
    );
}
