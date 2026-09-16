import TextareaField from '@/components/ui/TextareaField';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

function ModalFieldRow({ label, required = false, children, isTextarea = false }) {
    return (
        <div className={`grid gap-2 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-x-4 ${isTextarea ? 'sm:items-start' : 'sm:items-center'}`}>
            <TransactionFieldLabel label={label} required={required} className={`text-xs sm:text-sm font-normal text-table-row-text ${isTextarea ? 'pt-2' : ''}`} />
            <div className="min-w-0">{children}</div>
        </div>
    );
}

export default function InventoryAdjustmentInfoTab({ values, setValues }) {
    return (
        <div className="space-y-2.5">

            <ModalFieldRow label="Keterangan" isTextarea>
                <div className="w-full">
                    <TextareaField
                        value={values.notes}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                notes: event.target.value,
                            }))
                        }
                        rows={4}
                        className="w-full rounded-[4px] border-ui-border"
                        textareaClassName="min-h-[92px] text-xs sm:text-sm text-brand-dark"
                    />
                </div>
            </ModalFieldRow>
        </div>
    );
}
