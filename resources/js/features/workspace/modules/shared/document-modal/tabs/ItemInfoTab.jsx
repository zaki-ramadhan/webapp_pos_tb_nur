import TextInput from '@/components/ui/TextInput';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { isWorkspacePageInactive } from '@/features/workspace/shared/workspaceAvailability';
import { ReadonlyDocumentTextarea } from '../DocumentModalFields';

export default function ItemInfoTab({ detail }) {
    const hideDepartment = isWorkspacePageInactive('department');

    return (
        <div className="grid gap-y-4 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-x-4">
            {!hideDepartment ? (
                <>
                    <TransactionFieldLabel label="Departemen" />
                    <ChipLookupField
                        values={detail.department ?? []}
                        placeholder="Cari/Pilih..."
                        onRemove={() => {}}
                        searchLabel="Cari departemen"
                        heightClassName="h-[36px]"
                    />
                </>
            ) : null}

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
