import {
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export function PurchasePaymentInfoSection({ config, values }) {
    return (
        <div className="flex-1 flex flex-col min-h-0">
            <TransactionSectionHeading title={config.paymentInfoTitle} icon="payment" />

            <div className="mt-4 grid gap-y-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-x-4">
                <TransactionFieldLabel label="Dibayar dengan" />
                <div className="text-xs sm:text-sm text-brand-dark">{values.paidWith || '-'}</div>

                <TransactionFieldLabel label="Tanggal dan Jam" />
                <div className="text-xs sm:text-sm text-brand-dark">{values.paidAt || '-'}</div>
            </div>
        </div>
    );
}
