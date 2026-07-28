import AddressStack from '@/features/workspace/shared/components/AddressStack';

export default function EmployeeAddressTab({ values, onChange }) {
    return (
        <div className="max-w-[900px]">
            <div className="grid gap-3 lg:grid-cols-[135px_minmax(0,1fr)] lg:items-start">
                <label className="pt-2 text-xs sm:text-sm text-brand-dark">Alamat</label>
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
            </div>
        </div>
    );
}
