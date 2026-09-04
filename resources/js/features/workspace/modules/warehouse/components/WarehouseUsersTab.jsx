import CheckboxField from '@/components/ui/CheckboxField';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { WarehouseFieldRow } from './warehouseHelpers';

export default function WarehouseUsersTab({ config, values, onChange, isDetail }) {
    return (
        <div className="space-y-4 max-w-[980px]">
            <div className="border-b border-ui-border-medium pb-2.5">
                <h3 className="text-lg font-normal text-brand-dark">{config.userAccess.title}</h3>
            </div>

            <CheckboxField
                id="warehouse-all-users"
                label={config.userAccess.allUsersLabel}
                checked={values.allUsers}
                onChange={(event) => onChange('allUsers', event.target.checked)}
                align="center"
                labelClassName="text-xs sm:text-sm font-normal text-brand-dark"
                inputClassName="mt-0 h-[18px] w-[18px]"
                containerClassName="w-auto"
            />

            {!values.allUsers ? (
                <div className="ml-6 sm:ml-7 space-y-3">
                    <div className="pt-1">
                        <h3 className="text-lg font-normal text-brand-dark">{config.userAccess.limitedTitle}</h3>
                    </div>

                    <WarehouseFieldRow label={config.labels.user}>
                        <div className="w-full lg:max-w-[50%]">
                            <BackendLookupField
                                resource="users"
                                values={values.users || []}
                                placeholder={config.userAccess.userPlaceholder}
                                searchLabel="Cari pengguna"
                                getOptionLabel={(option) => typeof option === 'string' ? option : (option?.name ?? option?.label ?? '')}
                                onSelect={(option) => {
                                    const name = typeof option === 'string' ? option : (option?.name ?? option?.label ?? '');
                                    if (name && !(values.users || []).includes(name)) {
                                        onChange('users', [...(values.users || []), name]);
                                    }
                                }}
                                onRemove={(item) => {
                                    const name = typeof item === 'string' ? item : (item?.name ?? item?.label ?? '');
                                    onChange('users', (values.users || []).filter((val) => val !== name));
                                }}
                                className="w-full"
                            />
                        </div>
                    </WarehouseFieldRow>
                </div>
            ) : null}
        </div>
    );
}
