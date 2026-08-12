import { TransactionSwitch } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CheckboxField from '@/components/ui/CheckboxField';
import {
    FormRow,
    SectionHeading,
    SimpleTextField,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';

export function ItemSalesInfoSection({ config, values, onChange, isLoading }) {
    return (
        <section className="space-y-2">
            <SectionHeading title={config.labels.salesInfo} />

            <FormRow label="Def. Hrg. Jual Satuan 1">
                {values.kind === 'Grup' ? (
                    <div className="space-y-2">
                        <CheckboxField
                            label="Ambil Harga dari Rincian Barang"
                            checked={values.useGroupPrice !== false}
                            onChange={(e) => onChange('useGroupPrice', e.target.checked)}
                            size="sm"
                        />
                        {values.useGroupPrice === false ? (
                            <SimpleTextField
                                value={values.sellPriceLevel1}
                                onChange={(event) => onChange('sellPriceLevel1', event.target.value)}
                                className="max-w-[280px]"
                                formatAsAmount
                                isLoading={isLoading}
                            />
                        ) : null}
                    </div>
                ) : (
                    <SimpleTextField
                        value={values.sellPriceLevel1}
                        onChange={(event) => onChange('sellPriceLevel1', event.target.value)}
                        className="max-w-[280px]"
                        formatAsAmount
                        isLoading={isLoading}
                    />
                )}
            </FormRow>
        </section>
    );
}
