import TextInput from '@/components/ui/TextInput';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { ReadonlyDocumentTextarea } from '../DocumentModalFields';

export default function ItemInfoTab({ detail }) {
    return (
        <div className="grid gap-y-4 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-x-4">

            <TransactionFieldLabel label="Keterangan" />
            <ReadonlyDocumentTextarea value={detail.notes ?? ''} className="min-h-[92px]" />

            {detail.quoteNumber ? (
                <>
                    <TransactionFieldLabel label="No. Penawaran" />
                    <TextInput
                        value={detail.quoteNumber}
                        readOnly
                        className="h-[36px] rounded-[4px] border-success-border bg-bg-success-alt"
                        inputClassName="text-xs sm:text-sm text-tab-view-inactive-border-l"
                    />
                </>
            ) : null}

            {detail.orderNumber ? (
                <>
                    <TransactionFieldLabel label="No. Pesanan" />
                    <TextInput
                        value={detail.orderNumber}
                        readOnly
                        className="h-[36px] rounded-[4px] border-success-border bg-bg-success-alt"
                        inputClassName="text-xs sm:text-sm text-tab-view-inactive-border-l"
                    />
                </>
            ) : null}
        </div>
    );
}
