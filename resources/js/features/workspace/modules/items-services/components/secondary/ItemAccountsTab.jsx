import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import {
    FormRow,
    SectionHeading,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';

export default function ItemAccountsTab({ config, values, onChange }) {
    const allFields = [
        { key: 'inventory', idKey: 'inventoryAccountId', label: 'Persediaan' },
        { key: 'costOfGoodsSold', idKey: 'cogsAccountId', label: 'Beban' },
        { key: 'sales', idKey: 'salesAccountId', label: 'Penjualan' },
        { key: 'salesReturn', idKey: 'salesReturnAccountId', label: 'Retur Penjualan' },
        { key: 'salesDiscount', idKey: 'salesDiscountAccountId', label: 'Diskon Penjualan' },
        { key: 'deliveredGoods', idKey: 'deliveredGoodsAccountId', label: 'Barang Terkirim' },
        { key: 'purchaseReturn', idKey: 'purchaseReturnAccountId', label: 'Retur Pembelian' },
        { key: 'uninvoicedPurchase', idKey: 'uninvoicedPurchaseAccountId', label: 'Pembelian Belum Tertagih' },
    ];

    const fields = allFields.filter(({ key }) => {
        if (values.kind === 'Jasa') {
            return key === 'sales' || key === 'salesReturn' || key === 'salesDiscount';
        }
        if (values.kind === 'Non Persediaan') {
            return key !== 'inventory' && key !== 'deliveredGoods';
        }
        return true;
    });

    return (
        <div className="space-y-4">
            <div className="lg:max-w-[50%] w-full">
                <SectionHeading title={config.labels.accounts} />

                <div className="mt-4 space-y-2">
                    {fields.map(({ key, idKey, label }) => (
                        <FormRow key={key} label={label === 'Beban' && values.kind !== 'Non Persediaan' ? 'Beban Pokok Penjualan' : label}>
                            <AccountLookupField
                                values={values.accounts[key] ?? []}
                                placeholder="Cari/Pilih..."
                                searchLabel={`Cari akun ${label}`}
                                dialogTitle={`Pilih akun ${label}`}
                                onRemove={(item) => {
                                    onChange(idKey, null);
                                    onChange('accounts', {
                                        ...values.accounts,
                                        [key]: (values.accounts[key] ?? []).filter(
                                            (value) => value !== item,
                                        ),
                                    });
                                }}
                                onSelectAccount={(record, accountLabel) => {
                                    onChange(idKey, record?.id ?? null);
                                    onChange('accounts', {
                                        ...values.accounts,
                                        [key]: accountLabel ? [accountLabel] : [],
                                    });
                                }}
                            />
                        </FormRow>
                    ))}
                </div>
            </div>

            <div className="flex items-start gap-3 pt-2 lg:max-w-[50%] w-full">
                <span className="mt-1 h-6 w-[3px] shrink-0 rounded-full bg-tab-active-border-t" />
                <p className="text-xs sm:text-sm italic leading-6 text-red-550">
                    {config.accountNote}
                </p>
            </div>
        </div>
    );
}
