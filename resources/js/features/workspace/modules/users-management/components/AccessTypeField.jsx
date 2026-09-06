import RadioField from '@/components/ui/RadioField';

const ACCESS_DESCRIPTIONS = {
    kasir: 'Kasir memiliki akses terbatas hanya untuk modul Penjualan & Penerimaan Penjualan. Modul lainnya dibatasi otomatis.',
    owner: 'Owner memiliki hak akses penuh ke seluruh transaksi operasional, laporan keuangan, dan manajemen staf toko.',
    super_admin: 'Administrator Sistem memiliki hak akses root teknis tertinggi untuk mengelola seluruh sistem dan pemeliharaan.',
};

export default function AccessTypeField({ value, onChange, isActorSuperAdmin = false }) {
    const activeDescription = ACCESS_DESCRIPTIONS[value === 'operator' ? 'kasir' : (value === 'admin' ? 'owner' : value)];

    return (
        <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-6 pt-0.5">
                <RadioField
                    id="access-kasir"
                    name="access-type"
                    label="Kasir"
                    checked={value === 'kasir' || value === 'operator'}
                    onChange={() => onChange('kasir')}
                    inputClassName="h-3.5 w-3.5"
                    containerClassName="w-auto inline-flex items-center"
                />
                <RadioField
                    id="access-owner"
                    name="access-type"
                    label="Owner"
                    checked={value === 'owner' || value === 'admin'}
                    onChange={() => onChange('owner')}
                    inputClassName="h-3.5 w-3.5"
                    containerClassName="w-auto inline-flex items-center"
                />
                {isActorSuperAdmin && (
                    <RadioField
                        id="access-super-admin"
                        name="access-type"
                        label="Administrator Sistem"
                        checked={value === 'super_admin'}
                        onChange={() => onChange('super_admin')}
                        inputClassName="h-3.5 w-3.5"
                        containerClassName="w-auto inline-flex items-center"
                    />
                )}
            </div>
            {activeDescription && (
                <div className="flex items-center gap-3 pt-0.5 mt-1">
                    <span className="block h-6 w-[5px] rounded-[2px] bg-bg-bullet-gray" aria-hidden="true" />
                    <p className="text-xs sm:text-sm italic leading-6 text-tab-active-border-t">
                        {activeDescription}
                    </p>
                </div>
            )}
        </div>
    );
}
