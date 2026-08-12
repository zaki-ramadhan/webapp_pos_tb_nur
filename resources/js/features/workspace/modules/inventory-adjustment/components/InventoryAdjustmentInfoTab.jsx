import TextareaField from '@/components/ui/TextareaField';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { isWorkspacePageInactive } from '@/features/workspace/shared/workspaceAvailability';

function ModalFieldRow({ label, required = false, children, isTextarea = false }) {
    return (
        <div className={`grid gap-2 sm:grid-cols-[156px_minmax(0,1fr)] sm:gap-x-4 ${isTextarea ? 'sm:items-start' : 'sm:items-center'}`}>
            <TransactionFieldLabel label={label} required={required} className={`text-xs sm:text-sm font-normal text-slate-700 ${isTextarea ? 'pt-2' : ''}`} />
            <div>{children}</div>
        </div>
    );
}

export default function InventoryAdjustmentInfoTab({ values, setValues }) {
    const hideDepartment = isWorkspacePageInactive('department');

    return (
        <div className="space-y-4">
            {!hideDepartment ? (
                <ModalFieldRow label="Departemen">
                    <div className="max-w-[280px]">
                        <BackendLookupField
                            resource="departments"
                            values={values.department}
                            placeholder="Cari/Pilih Departemen..."
                            searchLabel="Cari departemen"
                            getOptionLabel={(option) => (typeof option === 'string' ? option : (option?.name ?? option?.label ?? ''))}
                            onSelect={(option) => {
                                setValues((current) => ({
                                    ...current,
                                    department: [option.name],
                                    __departmentId: option.id,
                                }));
                            }}
                            onRemove={() => {
                                setValues((current) => ({
                                    ...current,
                                    department: [],
                                    __departmentId: null,
                                }));
                            }}
                        />
                    </div>
                </ModalFieldRow>
            ) : null}

            <ModalFieldRow label="Keterangan" isTextarea>
                <TextareaField
                    value={values.notes}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            notes: event.target.value,
                        }))
                    }
                    rows={4}
                    className="rounded-[4px] border-ui-border"
                    textareaClassName="min-h-[92px] text-xs sm:text-sm text-brand-dark"
                />
            </ModalFieldRow>
        </div>
    );
}
