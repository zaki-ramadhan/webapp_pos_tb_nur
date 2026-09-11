import TextareaField from '@/components/ui/TextareaField';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { isWorkspacePageInactive } from '@/features/workspace/shared/workspaceAvailability';

function ModalFieldRow({ label, required = false, children, isTextarea = false }) {
    return (
        <div className={`grid gap-2 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-x-4 ${isTextarea ? 'sm:items-start' : 'sm:items-center'}`}>
            <TransactionFieldLabel label={label} required={required} className={`text-xs sm:text-sm font-normal text-table-row-text ${isTextarea ? 'pt-2' : ''}`} />
            <div className="min-w-0">{children}</div>
        </div>
    );
}

export default function InventoryAdjustmentInfoTab({ values, setValues }) {
    const hideDepartment = isWorkspacePageInactive('department');

    return (
        <div className="space-y-2.5">
            {!hideDepartment ? (
                <ModalFieldRow label="Departemen">
                    <div className="grid grid-cols-5 gap-2.5">
                        <div className="col-span-3 min-w-0">
                            <BackendLookupField
                                resource="departments"
                                value={Array.isArray(values.department) ? (values.department[0] || '') : (values.department || '')}
                                placeholder="Cari/Pilih departemen..."
                                searchLabel="Cari departemen"
                                getOptionLabel={(option) => (typeof option === 'string' ? option : (option?.name ?? option?.label ?? ''))}
                                onSelect={(option) => {
                                    setValues((current) => ({
                                        ...current,
                                        department: [option.name],
                                        __departmentId: option.id,
                                    }));
                                }}
                                onClear={() => {
                                    setValues((current) => ({
                                        ...current,
                                        department: [],
                                        __departmentId: null,
                                    }));
                                }}
                            />
                        </div>
                    </div>
                </ModalFieldRow>
            ) : null}

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
