import AddressStack from '@/features/workspace/shared/components/AddressStack';
import { WarehouseFieldRow } from './warehouseHelpers';

export default function WarehouseAddressTab({ config, values, onChange }) {
    return (
        <div className="max-w-[980px]">
            <WarehouseFieldRow label="Alamat">
                <div className="w-full max-w-[430px]">
                    <AddressStack
                        prefixValue="Jalan"
                        layout="grid"
                        values={{
                            street: values.street,
                            city: values.city,
                            postalCode: values.postalCode,
                            province: values.province,
                            country: values.country,
                        }}
                        onChange={onChange}
                    />
                </div>
            </WarehouseFieldRow>
        </div>
    );
}
