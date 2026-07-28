import { TransactionToolbarIconButton } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { RefreshIcon, TableActionIcon } from '@/features/workspace/shared/Icons';

export default function ReceiptAmountActionButton({ type, onClick }) {
    const icon =
        type === 'refresh' ? (
            <RefreshIcon className="h-4.5 w-4.5 text-brand-blue" />
        ) : (
            <TableActionIcon className="h-4.5 w-4.5 text-brand-blue" />
        );
    const label = type === 'refresh' ? 'Bersihkan nilai pembayaran' : 'Tampilkan bantuan pembayaran';

    return (
        <TransactionToolbarIconButton label={label} className="h-[34px] w-[40px]" onClick={onClick}>
            {icon}
        </TransactionToolbarIconButton>
    );
}
