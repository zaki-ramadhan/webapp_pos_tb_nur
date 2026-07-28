import {
    ItemPurchaseTaxSection,
    ItemSalesInfoSection,
} from '../ItemSalesPurchaseSections';

export function ItemSalesPurchaseTab({ config, values, onChange, isLoading }) {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <ItemSalesInfoSection config={config} values={values} onChange={onChange} isLoading={isLoading} />
            <ItemPurchaseTaxSection config={config} values={values} onChange={onChange} isLoading={isLoading} />
        </div>
    );
}
