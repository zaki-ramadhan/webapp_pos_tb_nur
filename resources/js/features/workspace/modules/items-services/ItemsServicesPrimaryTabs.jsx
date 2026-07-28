import {
    ItemGeneralInfoSection,
    ItemMoreInfoSection,
} from './ItemGeneralSections';
import {
    ItemPurchaseTaxSection,
    ItemSalesInfoSection,
} from './ItemSalesPurchaseSections';

export { default as ItemGroupTab } from './components/ItemGroupTab';

export function ItemGeneralTab({ config, values, onChange, isDetail, isLoading }) {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <ItemGeneralInfoSection
                config={config}
                values={values}
                onChange={onChange}
                isDetail={isDetail}
                isLoading={isLoading}
            />
            <ItemMoreInfoSection config={config} values={values} onChange={onChange} isLoading={isLoading} />
        </div>
    );
}

export function ItemSalesPurchaseTab({ config, values, onChange, isLoading }) {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <ItemSalesInfoSection config={config} values={values} onChange={onChange} isLoading={isLoading} />
            <ItemPurchaseTaxSection config={config} values={values} onChange={onChange} isLoading={isLoading} />
        </div>
    );
}
